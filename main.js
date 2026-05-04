/* global localStorage */

const STORAGE_KEY = "bd2_upla_actividades_v1";

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

function compareActivities(a, b) {
  const aw =
    typeof Bd2Course !== "undefined"
      ? Bd2Course.clampWeek(a.week)
      : Number(a.week) || 0;
  const bw =
    typeof Bd2Course !== "undefined"
      ? Bd2Course.clampWeek(b.week)
      : Number(b.week) || 0;
  if (aw !== bw) return aw - bw;
  if (a.date !== b.date) return String(a.date).localeCompare(String(b.date));
  return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
}

function uniqueWeeks(items) {
  const set = new Set(items.map((x) => x.week).filter((w) => Number.isFinite(w)));
  return Array.from(set).sort((a, b) => a - b);
}

/** Semanas para el selector: si hay unidad, siempre las 4 globales; si «todas», solo las que tienen datos. */
function weeksForToolbar(items, unitFilter) {
  if (unitFilter !== "all") {
    const u = Number(unitFilter);
    if (Number.isFinite(u) && u >= 1 && u <= 4) {
      const lo = (u - 1) * 4 + 1;
      return [lo, lo + 1, lo + 2, lo + 3];
    }
  }
  return uniqueWeeks(items);
}

function updateHeroSummary(items) {
  const el = document.getElementById("heroSummary");
  if (!el) return;
  if (typeof Bd2Course === "undefined") {
    el.innerHTML =
      '<li class="nf-chip">Carga curriculum.js para ver el resumen por unidades.</li>';
    return;
  }
  const userItems = items.filter((x) => !x.preset);
  const presetItems = items.filter((x) => x.preset);
  const weeksCount = uniqueWeeks(items).length;
  const n = userItems.length;
  const actWord = n === 1 ? "actividad registrada" : "actividades registradas";
  const unitsTouched = new Set(items.map((x) => Bd2Course.splitWeek(x.week).unit));
  const uCount = unitsTouched.size;
  const ghOn =
    typeof window.Bd2GitHubSync !== "undefined" &&
    window.Bd2GitHubSync.loadSettings().enabled;
  const driveChip =
    presetItems.length > 0
      ? `<li class="nf-chip"><span class="nf-chip__label">${presetItems.length}</span> enlaces Drive (sem. 1–4 · U.I)</li>`
      : "";
  el.innerHTML = `
    <li class="nf-chip"><span class="nf-chip__label">${n}</span> ${actWord}</li>
    ${driveChip}
    <li class="nf-chip"><span class="nf-chip__label">${weeksCount}</span> semana(s) con contenido</li>
    <li class="nf-chip"><span class="nf-chip__label">${uCount}/4</span> unidades con actividades</li>
    <li class="nf-chip">Respaldo por semana en <span class="nf-chip__label">localStorage</span></li>
    <li class="nf-chip">GitHub: <span class="nf-chip__label">${ghOn ? "sync activo" : "sin configurar"}</span></li>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
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

let activePdfUrl = "";

function showPdfPreview(name, file) {
  const dlg = $("pdfDialog");
  const frame = $("pdfFrame");
  const openTab = $("pdfOpenTab");
  $("pdfName").textContent = name || "archivo.pdf";

  if (activePdfUrl) {
    URL.revokeObjectURL(activePdfUrl);
    activePdfUrl = "";
  }

  activePdfUrl = URL.createObjectURL(file);
  frame.src = activePdfUrl;
  openTab.href = activePdfUrl;

  if (typeof dlg.showModal === "function") dlg.showModal();
  else window.open(activePdfUrl, "_blank", "noopener");
}

function render() {
  const rawItems = loadActivities();
  if (typeof window.Bd2WeekSnapshot !== "undefined") {
    window.Bd2WeekSnapshot.persistWeekSnapshot(rawItems);
  }
  const presetItems =
    typeof Bd2Course !== "undefined" && typeof Bd2Course.getPresetDriveActivities === "function"
      ? Bd2Course.getPresetDriveActivities()
      : [];
  const items = [...presetItems, ...rawItems].slice().sort(compareActivities);

  const weekFilter = $("weekFilter").value;
  const unitFilter = $("unitFilter").value;
  const query = $("search").value.trim().toLowerCase();

  if (typeof Bd2Course === "undefined") {
    $("list").innerHTML =
      '<div class="nf-empty"><p class="nf-empty__text">Falta cargar curriculum.js antes de main.js.</p></div>';
    return;
  }

  const filtered = items.filter((x) => {
    const sp = Bd2Course.splitWeek(x.week);
    const matchUnit = unitFilter === "all" ? true : sp.unit === Number(unitFilter);
    const matchWeek = weekFilter === "all" ? true : String(x.week) === String(weekFilter);
    const hay = `${x.title || ""}\n${x.description || ""}\n${x.link || ""}`.toLowerCase();
    const matchQuery = query ? hay.includes(query) : true;
    return matchUnit && matchWeek && matchQuery;
  });

  const weekChoices = weeksForToolbar(items, unitFilter);
  const select = $("weekFilter");
  const current = select.value;
  const options = [
    `<option value="all">Todas en el filtro</option>`,
    ...weekChoices.map(
      (w) => `<option value="${w}">Semana global ${w} (de 16)</option>`,
    ),
  ].join("");
  if (select.innerHTML !== options) {
    select.innerHTML = options;
  }
  if ([...select.options].some((o) => o.value === current)) select.value = current;
  else select.value = "all";

  updateHeroSummary(items);

  const weeksCount = uniqueWeeks(items).length;
  const userCount = rawItems.length;
  const presetCount = items.filter((x) => x.preset).length;
  const statsEl = $("stats");
  const unitLabel =
    unitFilter === "all"
      ? "Todas las unidades"
      : Bd2Course.getUnitMeta(Number(unitFilter)).label;
  if (unitFilter === "all" && weekFilter === "all" && query === "") {
    statsEl.textContent = `Mostrando todo el catálogo (${filtered.length}) · ${userCount} tuyas · ${presetCount} Drive · ${weeksCount} semana(s) con material`;
  } else if (items.length === 0) {
    statsEl.textContent = "Aún no hay actividades guardadas en este navegador.";
  } else {
    const weekLbl = weekFilter === "all" ? "semanas según filtro" : `semana global ${weekFilter}`;
    statsEl.textContent = `${filtered.length} de ${items.length} ítems · ${unitLabel} · ${weekLbl}`;
  }

  const list = $("list");
  if (filtered.length === 0) {
    const hasAny = items.length > 0;
    list.innerHTML = hasAny
      ? `<div class="nf-empty">
          <p class="nf-empty__title">Nada coincide con tu búsqueda o filtro</p>
          <p class="nf-empty__text">Prueba «Todas las unidades», «Todas» en semana, o revisa el texto de búsqueda.</p>
        </div>`
      : `<div class="nf-empty">
          <p class="nf-empty__title">Empieza tu portafolio</p>
          <p class="nf-empty__text">
            Aún no hay actividades. Registra la primera eligiendo unidad y semana (del 1 al 16) en el panel seguro.
          </p>
          <button class="btn nf-btn-primary nf-empty__btn" type="button" data-action="go-add">Crear primera actividad</button>
        </div>`;
    return;
  }

  function activityTile(x) {
    const sp = Bd2Course.splitWeek(x.week);
    const um = Bd2Course.getUnitMeta(sp.unit);
    const isPreset = Boolean(x.preset);
    const linkLabel = isPreset ? "Abrir en Drive" : "Enlace";
    const linkPart = x.link
      ? `<a class="nf-tile__btn" href="${escapeHtml(x.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
          linkLabel,
        )}</a>`
      : "";
    const descPart = x.description
      ? `<p class="nf-tile__desc">${escapeHtml(x.description)}</p>`
      : "";
    const pdfPart = x.pdfKey
      ? `<button class="nf-tile__btn" type="button" data-action="open-pdf" data-pdf="${escapeHtml(
          x.pdfKey
        )}" data-pdf-name="${escapeHtml(x.pdfName || "archivo.pdf")}">PDF</button>`
      : "";
    const editPart = isPreset
      ? ""
      : `<button class="nf-tile__btn nf-tile__btn--solid" type="button" data-action="edit">Editar</button>`;

    return `
      <article class="nf-tile${isPreset ? " nf-tile--preset" : ""}" data-id="${escapeHtml(x.id)}" data-preset="${isPreset ? "1" : "0"}">
        <div class="nf-tile__wrap">
          <div class="nf-tile__poster" data-week-mod="${Number(x.week) % 6}">
            <span class="nf-tile__week">Uni. ${escapeHtml(um.roman)} · Sem. ${escapeHtml(String(sp.weekAbs))}/16</span>
            <h3 class="nf-tile__title">${escapeHtml(x.title)}</h3>
            <p class="nf-tile__date">Sem. ${escapeHtml(String(sp.weekInUnit))} en unidad · ${escapeHtml(x.date)}</p>
          </div>
          <div class="nf-tile__hover">
            <p class="nf-tile__unitline">${escapeHtml(um.label)} — ${escapeHtml(um.title)}</p>
            ${descPart}
            <div class="nf-tile__actions">
              ${editPart}
              ${pdfPart}
              ${linkPart}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  /** Agrupa primero por unidad I–IV, dentro por semana global. */
  const parts = [];
  for (let u = 1; u <= 4; u++) {
    const unitItems = filtered.filter((x) => Bd2Course.splitWeek(x.week).unit === u);
    if (unitItems.length === 0) continue;

    const meta = Bd2Course.getUnitMeta(u);
    const byWeek = new Map();
    for (const x of unitItems) {
      const w = Number.isFinite(x.week) ? Bd2Course.clampWeek(x.week) : 1;
      if (!byWeek.has(w)) byWeek.set(w, []);
      byWeek.get(w).push(x);
    }
    const weekOrder = Array.from(byWeek.keys()).sort((a, b) => a - b);

    const weekSections = weekOrder
      .map((w) => {
        const rowItems = byWeek.get(w) || [];
        const sw = Bd2Course.splitWeek(w);
        return `
        <section class="nf-row nf-row--nested">
          <h3 class="nf-row__title nf-row__title--nested">
            Semana ${escapeHtml(String(w))} del semestre
            <span class="nf-row__meta">(${escapeHtml(String(sw.weekInUnit))}/4 en ${escapeHtml(meta.label)})</span>
          </h3>
          <div class="nf-row__track">${rowItems.map(activityTile).join("")}</div>
        </section>`;
      })
      .join("");

    parts.push(`
      <section class="nf-unit-block" id="unidad-${u}" aria-labelledby="unit-h-${u}">
        <header class="nf-unit-block__head">
          <h2 id="unit-h-${u}" class="nf-unit-block__title">${escapeHtml(meta.label)} · ${escapeHtml(meta.title)}</h2>
          <p class="nf-unit-block__range">Semanas globales ${(u - 1) * 4 + 1}–${u * 4}</p>
        </header>
        <div class="nf-unit-block__body">
          ${weekSections}
        </div>
      </section>`);
  }

  list.innerHTML = parts.join("");

  syncWeekStripHighlight();
}

function syncWeekStripHighlight() {
  const uf = $("unitFilter").value;
  const wf = $("weekFilter").value;
  document.querySelectorAll(".nf-week-btn[data-global-week]").forEach((b) => {
    const u = b.getAttribute("data-unit");
    const wg = b.getAttribute("data-global-week");
    const unitOk = uf === "all" ? true : u === uf;
    const match = wf !== "all" && wg === wf && unitOk;
    b.classList.toggle("nf-week-btn--active", match);
    b.setAttribute("aria-pressed", match ? "true" : "false");
  });
}

function wireWeekStrip() {
  const strip = document.querySelector(".nf-units-strip");
  if (!strip) return;
  strip.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    if (t.closest("#weekBtnsReset")) {
      $("unitFilter").value = "all";
      $("weekFilter").value = "all";
      $("search").value = "";
      render();
      document.getElementById("browse")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const btn = t.closest(".nf-week-btn[data-global-week]");
    if (!btn) return;

    const unit = btn.getAttribute("data-unit");
    const wg = btn.getAttribute("data-global-week");
    if (!unit || !wg) return;

    $("unitFilter").value = unit;
    $("weekFilter").value = wg;
    $("search").value = "";
    render();

    requestAnimationFrame(() => {
      const anchor = document.getElementById(`unidad-${unit}`);
      anchor?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
}

function openAddPanel() {
  window.open("./add.html", "_blank", "noopener");
}

function wireEvents() {
  $("btnAdd").addEventListener("click", openAddPanel);
  document.getElementById("btnAddHero")?.addEventListener("click", openAddPanel);

  $("weekFilter").addEventListener("change", render);
  $("unitFilter").addEventListener("change", render);
  $("search").addEventListener("input", render);

  $("list").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("button[data-action]") : null;
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const article = btn.closest("article[data-id]");
    const id = article?.getAttribute("data-id");
    if (!id) return;

    if (action === "edit") {
      if (article?.getAttribute("data-preset") === "1") return;
      window.open(`./add.html?edit=${encodeURIComponent(id)}`, "_blank", "noopener");
    }

    if (action === "go-add") {
      openAddPanel();
      return;
    }

    if (action === "open-pdf") {
      const key = btn.getAttribute("data-pdf");
      const name = btn.getAttribute("data-pdf-name") || "archivo.pdf";
      if (!key) return;
      (async () => {
        const file = await window.PdfStore.getPdf(key);
        if (!file) throw new Error("No se encontró el PDF en este navegador.");
        showPdfPreview(name, file);
      })().catch((err) => {
        showDialog("No se pudo abrir", `${name}: ${err instanceof Error ? err.message : String(err)}`);
      });
    }
  });
}

function wireNavScroll() {
  const bar = document.querySelector(".nf-topbar");
  if (!bar) return;
  const onScroll = () => bar.classList.toggle("is-solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function main() {
  wireNavScroll();
  wireEvents();
  wireWeekStrip();
  render();

  // Limpieza del objectURL al cerrar el dialog
  const dlg = document.getElementById("pdfDialog");
  dlg?.addEventListener("close", () => {
    const frame = document.getElementById("pdfFrame");
    if (frame) frame.src = "";
    if (activePdfUrl) {
      URL.revokeObjectURL(activePdfUrl);
      activePdfUrl = "";
    }
  });
}

document.addEventListener("DOMContentLoaded", main);

