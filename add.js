/* global localStorage, sessionStorage */

const STORAGE_KEY = "bd2_upla_actividades_v1";
const SESSION_KEY = "bd2_upla_logged_in_v1";

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
  const week = Number(input.week);
  const date = String(input.date || "").trim();
  const title = String(input.title || "").trim();
  const description = String(input.description || "").trim();
  const link = String(input.link || "").trim();

  if (!Number.isFinite(week) || week < 1 || week > 30) throw new Error("Semana inválida.");
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

function setFormData(data) {
  $("week").value = data.week ?? 1;
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
  return {
    week: $("week").value,
    date: $("date").value,
    title: $("title").value,
    description: $("description").value,
    link: $("link").value,
  };
}

function showLoggedState() {
  const logged = isLoggedIn();
  $("loginCard").hidden = logged;
  $("activityCard").hidden = !logged;
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
    setFormData({ week: 1, date: todayISO(), title: "", description: "", link: "", pdfKey: "", pdfName: "" });
  });

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

        showDialog("Guardado", "Actividad guardada. Ya puedes volver a la página principal.");
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
  if (!isLoggedIn()) setLoggedIn(false);
  showLoggedState();
  wireEvents();
  if (isLoggedIn()) loadForEditIfNeeded();

  window.addEventListener("beforeunload", () => {
    if (activePreviewUrl) URL.revokeObjectURL(activePreviewUrl);
  });
}

document.addEventListener("DOMContentLoaded", main);

