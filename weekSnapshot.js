/**
 * Respaldo local organizado por semanas (1–16). Usa Bd2Course si está disponible.
 */
(function weekSnapshotGlobal(win) {
  const SNAP_KEY = "bd2_upla_by_week_v1";

  function clampWeek(n) {
    if (typeof win.Bd2Course !== "undefined") return win.Bd2Course.clampWeek(n);
    const w = Number(n);
    if (!Number.isFinite(w)) return 1;
    return Math.min(16, Math.max(1, Math.round(w)));
  }

  /** @param {Array} activities */
  function buildByWeek(activities) {
    /** @type {Record<string, unknown[]>} */
    const byWeek = {};
    for (let w = 1; w <= 16; w++) byWeek[String(w)] = [];
    if (!Array.isArray(activities)) return byWeek;
    for (const a of activities) {
      const w = clampWeek(a.week);
      const key = String(w);
      if (!byWeek[key]) byWeek[key] = [];
      byWeek[key].push(a);
    }
    return byWeek;
  }

  /** @param {Array} activities */
  function persistWeekSnapshot(activities) {
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      byWeek: buildByWeek(activities),
    };
    try {
      win.localStorage.setItem(SNAP_KEY, JSON.stringify(payload, null, 2));
    } catch (e) {
      console.warn("weekSnapshot: no se pudo guardar", e);
    }
    return payload;
  }

  /** Exportación completa para JSON / GitHub (metadatos; PDFs siguen en IndexedDB). */
  function buildPortfolioExport(activities) {
    const list = Array.isArray(activities) ? activities.slice() : [];
    const byWeek = buildByWeek(list);
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      course: "Base de Datos II · UPLA",
      activities: list,
      byWeek,
    };
  }

  function readStoredSnapshot() {
    const raw = win.localStorage.getItem(SNAP_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  win.Bd2WeekSnapshot = {
    SNAP_KEY,
    buildByWeek,
    persistWeekSnapshot,
    buildPortfolioExport,
    readStoredSnapshot,
  };
})(typeof window !== "undefined" ? window : globalThis);
