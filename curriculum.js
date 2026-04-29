/**
 * Base de Datos II (UPLA) — organización por unidades y semanas (16 semanas, 4 unidades × 4 semanas).
 * Usado por index (main.js) y add (add.js).
 */
(function curriculumGlobal(win) {
  const UNITS = [
    {
      id: 1,
      roman: "I",
      label: "Unidad I",
      title: "Introducción a la Arquitectura de BD",
      shortTitle: "Arquitectura de BD",
    },
    {
      id: 2,
      roman: "II",
      label: "Unidad II",
      title: "Diseño y Normalización",
      shortTitle: "Diseño y normalización",
    },
    {
      id: 3,
      roman: "III",
      label: "Unidad III",
      title: "SQL Avanzado",
      shortTitle: "SQL avanzado",
    },
    {
      id: 4,
      roman: "IV",
      label: "Unidad IV",
      title: "Bases de Datos NoSQL",
      shortTitle: "NoSQL",
    },
  ];

  /** Semestre oficial (16 semanas). */
  const TOTAL_WEEKS = 16;

  function clampWeek(n) {
    const w = Number(n);
    if (!Number.isFinite(w)) return 1;
    return Math.min(TOTAL_WEEKS, Math.max(1, Math.round(w)));
  }

  /** Semana global (1–16) → unidad (1–4) y semana dentro de la unidad (1–4). */
  function splitWeek(abs) {
    const w = clampWeek(abs);
    const unit = Math.min(4, Math.ceil(w / 4));
    const weekInUnit = w - (unit - 1) * 4;
    return { weekAbs: w, unit, weekInUnit };
  }

  /** unidad (1–4), semana en unidad (1–4) → semana absoluta (1–16). */
  function absWeek(unit, weekInUnit) {
    const u = Math.min(4, Math.max(1, Number(unit)));
    const wi = Math.min(4, Math.max(1, Number(weekInUnit)));
    return (u - 1) * 4 + wi;
  }

  function getUnitMeta(unitId) {
    return UNITS.find((u) => u.id === unitId) || UNITS[0];
  }

  win.Bd2Course = {
    UNITS,
    TOTAL_WEEKS,
    clampWeek,
    splitWeek,
    absWeek,
    getUnitMeta,
  };
})(typeof window !== "undefined" ? window : globalThis);
