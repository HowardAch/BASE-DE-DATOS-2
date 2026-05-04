/* global localStorage, sessionStorage */

const STORAGE_KEY = "bd2_upla_actividades_v1";
const SESSION_KEY = "bd2_upla_logged_in_v1";
const DRAFT_KEY = "bd2_add_form_draft_v1";

let draftTimer = null;

const AUTH_USER = "howard";
const AUTH_PASS = "hachapapi123";

let activePreviewUrl = "";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function safeParseJSON(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

function loadActivities() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeParseJSON(raw);
  if (!parsed.ok || !Array.isArray(parsed.value)) return [];
  return parsed.value;
}

function saveActivities(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items, null, 2));
}

function normalizeActivity(input) {
  if (typeof Bd2Course === "undefined") throw new Error("Falta cargar curriculum.js.");
  const weekRaw = Number(input.week);
  const week = Bd2Course.clampWeek(weekRaw);
  const date = String(input.date || "").trim();
  const title = String(input.title || "").trim();
  const description = String(input.description || "").trim();
  const link = String(input.link || "").trim();

  if (!Number.isFinite(weekRaw) || weekRaw < 1) throw new Error("Semana global inválida.");
  if (!date) throw new Error("La fecha es obligatoria.");
  if (!title) throw new Error("El título es obligatorio.");

  return {
    id: input.id || uid(),
    week,
    date,
    title,
    description,
    link,
    pdfKey: input.pdfKey || "",
    pdfName: input.pdfName || "",
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`No existe el elemento #${id}`);
  return el;
}

function showDialog(title, body) {
  const dialog = $("dialog");
  $("dialogTitle").textContent = title;
  $("dialogBody").textContent = body;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else alert(`${title}\n\n${body}`);
}

function getEditId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("edit");
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function setLoggedIn(v) {
  sessionStorage.setItem(SESSION_KEY, v ? "1" : "0");
}

function fillUnitSelect() {
  const sel = $("unit");
  sel.innerHTML = Bd2Course.UNITS.map(
    (u) =>
      `<option value="${u.id}">${u.label} · ${escapeHtmlOptionText(u.shortTitle)}</option>`,
  ).join("");
}

function escapeHtmlOptionText(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function syncAbsWeekFromUnitFields() {
  const u = Number($("unit").value);
  const wi = Number($("weekInUnit").value);
  const abs = Bd2Course.absWeek(u, wi);
  $("week").value = String(abs);
  const el = document.getElementById("weekAbsLabel");
  if (el) el.textContent = String(abs);
  const meta = Bd2Course.getUnitMeta(Number.isFinite(u) ? u : 1);
  const sum = document.getElementById("unitSummary");
  if (sum) sum.textContent = `${meta.label}: ${meta.title}`;
}

function setFormData(data) {
  if (typeof Bd2Course === "undefined") return;
  const abs = Bd2Course.clampWeek(data.week ?? 1);
  const { unit, weekInUnit } = Bd2Course.splitWeek(abs);
  $("unit").value = String(unit);
  $("weekInUnit").value = String(weekInUnit);
  $("week").value = String(abs);
  syncAbsWeekFromUnitFields();
  $("date").value = data.date ?? todayISO();
  $("title").value = data.title ?? "";
  $("description").value = data.description ?? "";
  $("link").value = data.link ?? "";
  $("pdf").value = "";

  const hasPdf = Boolean(data.pdfKey);
  const info = $("pdfInfo");
  info.textContent = hasPdf ? `PDF actual: ${data.pdfName || "archivo.pdf"}` : "Sin PDF adjunto.";
  $("btnRemovePdf").hidden = !hasPdf;
  $("activityForm").dataset.pdfKey = data.pdfKey || "";
  $("activityForm").dataset.pdfName = data.pdfName || "";

  // Reset preview area
  $("pdfPreviewWrap").hidden = true;
  $("pdfPreview").src = "";
  $("pdfPreviewOpen").removeAttribute("href");
  if (activePreviewUrl) {
    URL.revokeObjectURL(activePreviewUrl);
    activePreviewUrl = "";
  }
}

function getFormData() {
  syncAbsWeekFromUnitFields();
  return {
    week: $("week").value,
    date: $("date").value,
    title: $("title").value,
    description: $("description").value,
    link: $("link").value,
  };
}

function loadGithubForm() {
  if (typeof window.Bd2GitHubSync === "undefined") return;
  const s = window.Bd2GitHubSync.loadSettings();
  const ge = document.getElementById("ghEnabled");
  const gt = document.getElementById("ghToken");
  if (!ge || !gt) return;
  ge.checked = Boolean(s.enabled);
  gt.value = s.token || "";
  document.getElementById("ghOwner").value = s.owner || "";
  document.getElementById("ghRepo").value = s.repo || "";
  document.getElementById("ghBranch").value = s.branch || "main";
  document.getElementById("ghPath").value = s.path || "data/bd2-portfolio.json";
}

function readGithubFormToStorage() {
  if (typeof window.Bd2GitHubSync === "undefined") return;
  window.Bd2GitHubSync.saveSettings({
    enabled: document.getElementById("ghEnabled")?.checked === true,
    token: document.getElementById("ghToken")?.value.trim() || "",
    owner: document.getElementById("ghOwner")?.value.trim() || "",
    repo: document.getElementById("ghRepo")?.value.trim() || "",
    branch: document.getElementById("ghBranch")?.value.trim() || "main",
    path: document.getElementById("ghPath")?.value.trim() || "data/bd2-portfolio.json",
  });
}

function showLoggedState() {
  const logged = isLoggedIn();
  $("loginCard").hidden = logged;
  $("activityCard").hidden = !logged;
  const ghCard = document.getElementById("githubCard");
  if (ghCard) ghCard.hidden = !logged;
  if (logged) loadGithubForm();
}

function scheduleDraftSave() {
  if (!isLoggedIn()) return;
  clearTimeout(draftTimer);
  draftTimer = setTimeout(saveDraftNow, 650);
}

function saveDraftNow() {
  try {
    if (!isLoggedIn()) return;
    syncAbsWeekFromUnitFields();
    const payload = {
      ...getFormData(),
      unit: $("unit").value,
      weekInUnit: $("weekInUnit").value,
      pdfKey: String($("activityForm").dataset.pdfKey || ""),
      pdfName: String($("activityForm").dataset.pdfName || ""),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function applyDraftIfAny() {
  const editId = getEditId();
  if (editId) return;
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  const parsed = safeParseJSON(raw);
  if (!parsed.ok || typeof parsed.value !== "object") return;
  const d = parsed.value;
  let abs = 1;
  if (typeof Bd2Course !== "undefined") {
    if (d.week !== undefined && d.week !== null && String(d.week).trim() !== "") {
      abs = Bd2Course.clampWeek(d.week);
    } else if (d.unit != null && d.weekInUnit != null) {
      abs = Bd2Course.absWeek(Number(d.unit), Number(d.weekInUnit));
    }
  }
  setFormData({
    week: abs,
    date: d.date || todayISO(),
    title: d.title ?? "",
    description: d.description ?? "",
    link: d.link ?? "",
    pdfKey: d.pdfKey ?? "",
    pdfName: d.pdfName ?? "",
  });
}

function loadForEditIfNeeded() {
  const editId = getEditId();
  if (!editId) {
    $("activityForm").dataset.editingId = "";
    setFormData({ week: 1, date: todayISO() });
    return;
  }

  const items = loadActivities();
  const item = items.find((x) => x.id === editId);
  if (!item) {
    showDialog("No encontrado", "No se encontró la actividad a editar.");
    $("activityForm").dataset.editingId = "";
    setFormData({ week: 1, date: todayISO() });
    return;
  }

  $("activityForm").dataset.editingId = item.id;
  setFormData(item);
}

function upsertActivity(newItem) {
  const items = loadActivities();
  const idx = items.findIndex((x) => x.id === newItem.id);
  if (idx >= 0) items[idx] = newItem;
  else items.push(newItem);
  saveActivities(items);
}

function wireEvents() {
  $("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const user = $("loginUser").value.trim();
    const pass = $("loginPass").value;

    if (user === AUTH_USER && pass === AUTH_PASS) {
      setLoggedIn(true);
      showLoggedState();
      loadForEditIfNeeded();
      return;
    }

    showDialog("Acceso denegado", "Usuario o contraseña incorrectos.");
  });

  $("btnLogout").addEventListener("click", () => {
    setLoggedIn(false);
    $("loginPass").value = "";
    showLoggedState();
    showDialog("Sesión cerrada", "Vuelve a iniciar sesión para registrar actividades.");
  });

  $("btnReset").addEventListener("click", () => {
    $("activityForm").dataset.editingId = "";
    clearDraft();
    setFormData({ week: 1, date: todayISO(), title: "", description: "", link: "", pdfKey: "", pdfName: "" });
  });

  $("unit").addEventListener("change", syncAbsWeekFromUnitFields);
  $("weekInUnit").addEventListener("change", syncAbsWeekFromUnitFields);

  $("pdf").addEventListener("change", (e) => {
    const file = e.currentTarget.files?.[0] || null;
    if (!file) {
      $("pdfPreviewWrap").hidden = true;
      return;
    }
    if (file.type !== "application/pdf") {
      showDialog("Archivo no válido", "Solo se permiten archivos PDF.");
      e.currentTarget.value = "";
      return;
    }
    $("pdfInfo").textContent = `PDF seleccionado: ${file.name}`;

    if (activePreviewUrl) URL.revokeObjectURL(activePreviewUrl);
    activePreviewUrl = URL.createObjectURL(file);
    $("pdfPreview").src = activePreviewUrl;
    $("pdfPreviewOpen").href = activePreviewUrl;
    $("pdfPreviewWrap").hidden = false;
  });

  $("btnRemovePdf").addEventListener("click", async () => {
    try {
      if (!isLoggedIn()) throw new Error("Debes iniciar sesión.");
      const key = String($("activityForm").dataset.pdfKey || "");
      if (key) await window.PdfStore.deletePdf(key);
      $("activityForm").dataset.pdfKey = "";
      $("activityForm").dataset.pdfName = "";
      $("pdf").value = "";
      $("pdfInfo").textContent = "Sin PDF adjunto.";
      $("btnRemovePdf").hidden = true;
    } catch (err) {
      showDialog("No se pudo quitar", err instanceof Error ? err.message : String(err));
    }
  });

  const draftFields = ["unit", "weekInUnit", "date", "title", "description", "link"];
  for (const id of draftFields) {
    $(id).addEventListener("input", scheduleDraftSave);
    $(id).addEventListener("change", scheduleDraftSave);
  }

  document.getElementById("githubForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      if (typeof window.Bd2GitHubSync === "undefined") throw new Error("githubSync.js no cargado.");
      readGithubFormToStorage();
      showDialog("Configuración", "Opciones de GitHub guardadas en este navegador.");
    } catch (err) {
      showDialog("Error", err instanceof Error ? err.message : String(err));
    }
  });

  document.getElementById("ghTest")?.addEventListener("click", () => {
    (async () => {
      if (!isLoggedIn()) throw new Error("Debes iniciar sesión.");
      if (typeof window.Bd2GitHubSync === "undefined" || typeof window.Bd2WeekSnapshot === "undefined") {
        throw new Error("Faltan weekSnapshot.js o githubSync.js.");
      }
      readGithubFormToStorage();
      const all = loadActivities();
      window.Bd2WeekSnapshot.persistWeekSnapshot(all);
      const r = await window.Bd2GitHubSync.syncPortfolioJson(
        window.Bd2WeekSnapshot.buildPortfolioExport(all),
      );
      if (r.skipped) {
        showDialog("Sincronización", "Activa el checkbox y completa token, owner y repositorio.");
        return;
      }
      showDialog("GitHub", "Archivo JSON subido o actualizado correctamente.");
    })().catch((err) => {
      showDialog("GitHub", err instanceof Error ? err.message : String(err));
    });
  });

  $("activityForm").addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      if (!isLoggedIn()) throw new Error("Debes iniciar sesión.");
      (async () => {
        const editingId = String(e.currentTarget.dataset.editingId || "").trim();
        const items = loadActivities();
        const existing = editingId ? items.find((x) => x.id === editingId) : null;

        const formPdf = $("pdf").files?.[0] || null;
        let pdfKey = String(e.currentTarget.dataset.pdfKey || existing?.pdfKey || "");
        let pdfName = String(e.currentTarget.dataset.pdfName || existing?.pdfName || "");

        if (formPdf) {
          const key = `pdf_${editingId || uid()}`;
          await window.PdfStore.putPdf(key, formPdf);
          pdfKey = key;
          pdfName = formPdf.name || "archivo.pdf";
        }

        const item = normalizeActivity({
          ...existing,
          ...getFormData(),
          id: editingId || undefined,
          pdfKey,
          pdfName,
        });
        upsertActivity(item);

        const all = loadActivities();
        if (window.Bd2WeekSnapshot) {
          window.Bd2WeekSnapshot.persistWeekSnapshot(all);
        }

        let syncNote = "";
        if (window.Bd2GitHubSync && window.Bd2WeekSnapshot) {
          try {
            const r = await window.Bd2GitHubSync.syncPortfolioJson(
              window.Bd2WeekSnapshot.buildPortfolioExport(all),
            );
            if (!r.skipped) syncNote = " Repositorio GitHub actualizado.";
          } catch (err) {
            syncNote = ` GitHub: ${err instanceof Error ? err.message : String(err)}`;
          }
        }

        clearDraft();
        showDialog(
          "Guardado",
          `Actividad guardada.${syncNote} Redirigiendo a la página principal…`,
        );
        window.location.href = "./index.html";
      })().catch((err) => {
        showDialog("No se pudo guardar", err instanceof Error ? err.message : String(err));
      });
    } catch (err) {
      showDialog("No se pudo guardar", err instanceof Error ? err.message : String(err));
    }
  });
}

function main() {
  if (typeof Bd2Course === "undefined") {
    showDialog("Error", "No se pudo cargar la definición del curso (curriculum.js).");
    return;
  }
  fillUnitSelect();
  if (!isLoggedIn()) setLoggedIn(false);
  showLoggedState();
  wireEvents();
  if (isLoggedIn()) {
    loadForEditIfNeeded();
    if (!getEditId()) applyDraftIfAny();
  } else syncAbsWeekFromUnitFields();

  window.addEventListener("beforeunload", () => {
    if (activePreviewUrl) URL.revokeObjectURL(activePreviewUrl);
  });
}

document.addEventListener("DOMContentLoaded", main);

