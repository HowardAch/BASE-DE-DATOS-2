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
  if (a.week !== b.week) return a.week - b.week;
  if (a.date !== b.date) return String(a.date).localeCompare(String(b.date));
  return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
}

function uniqueWeeks(items) {
  const set = new Set(items.map((x) => x.week).filter((w) => Number.isFinite(w)));
  return Array.from(set).sort((a, b) => a - b);
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
  const items = loadActivities().slice().sort(compareActivities);

  const weekFilter = $("weekFilter").value;
  const query = $("search").value.trim().toLowerCase();

  const filtered = items.filter((x) => {
    const matchWeek = weekFilter === "all" ? true : String(x.week) === String(weekFilter);
    const hay = `${x.title || ""}\n${x.description || ""}`.toLowerCase();
    const matchQuery = query ? hay.includes(query) : true;
    return matchWeek && matchQuery;
  });

  const weeks = uniqueWeeks(items);
  const select = $("weekFilter");
  const current = select.value;
  const options = [
    `<option value="all">Todas</option>`,
    ...weeks.map((w) => `<option value="${w}">Semana ${w}</option>`),
  ].join("");
  if (select.innerHTML !== options) {
    select.innerHTML = options;
    if ([...select.options].some((o) => o.value === current)) select.value = current;
  }

  $("stats").textContent = `${filtered.length} actividad(es) mostrada(s) · ${items.length} total`;

  const list = $("list");
  if (filtered.length === 0) {
    list.innerHTML = `<div class="item"><p class="item__desc">No hay actividades para mostrar.</p></div>`;
    return;
  }

  list.innerHTML = filtered
    .map((x) => {
      const linkPart = x.link
        ? `<div class="item__link"><a href="${escapeHtml(x.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
            x.link
          )}</a></div>`
        : "";

      const descPart = x.description ? `<p class="item__desc">${escapeHtml(x.description)}</p>` : "";
      const pdfPart =
        x.pdfKey
          ? `<div class="item__pdf"><button class="btn btn--ghost mini" type="button" data-action="open-pdf" data-pdf="${escapeHtml(
              x.pdfKey
            )}" data-pdf-name="${escapeHtml(x.pdfName || "archivo.pdf")}">Abrir PDF</button></div>`
          : "";

      return `
        <article class="item" data-id="${escapeHtml(x.id)}">
          <div class="item__top">
            <div>
              <h3 class="item__title">${escapeHtml(x.title)}</h3>
              <div class="item__meta">
                <span class="pill">Semana ${escapeHtml(x.week)}</span>
                <span class="pill">${escapeHtml(x.date)}</span>
              </div>
            </div>
            <div class="item__actions">
              <button class="btn btn--ghost mini" type="button" data-action="edit">Editar</button>
            </div>
          </div>
          ${descPart}
          ${linkPart}
          ${pdfPart}
        </article>
      `;
    })
    .join("");
}

function wireEvents() {
  $("btnAdd").addEventListener("click", () => {
    window.open("./add.html", "_blank", "noopener");
  });

  $("weekFilter").addEventListener("change", render);
  $("search").addEventListener("input", render);

  $("list").addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("button[data-action]") : null;
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const article = btn.closest("article[data-id]");
    const id = article?.getAttribute("data-id");
    if (!id) return;

    if (action === "edit") {
      window.open(`./add.html?edit=${encodeURIComponent(id)}`, "_blank", "noopener");
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

function main() {
  wireEvents();
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

