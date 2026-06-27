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

  /**
   * Material en Google Drive por semana global del semestre.
   * Se muestra en el catálogo junto a tus actividades guardadas.
   */
  const WEEK_DRIVE_LINKS = {
    1: [
      "https://drive.google.com/file/d/1lutaw09_mVreH11_-QvD13IfmYziq7xB/view?usp=drive_link",
      "https://drive.google.com/file/d/1WI2nnRtjNdqlzMJvzYiIcbvVHpz3f_c3/view?usp=drive_link",
    ],
    2: [
      "https://drive.google.com/file/d/1SQgLI86JpPRMt5-bxn_MW_30khQkvHiN/view?usp=drive_link",
      "https://drive.google.com/file/d/1oYLO0MmWm5lQ7O2-xicRtfafDkSyWy1J/view?usp=drive_link",
      "https://drive.google.com/file/d/1ndPBK_bySnSokFtEDaYpQtEOWc2M7d-l/view?usp=drive_link",
    ],
    3: [
      "https://drive.google.com/file/d/1s1b1V9RGIxNPcibxdTq5sjX-6pIg-Ils/view?usp=drive_link",
      "https://drive.google.com/file/d/1xGL9keAH2SxfG0Tq1Vi7Zok_Mxhm1jRO/view?usp=drive_link",
    ],
    4: [
      "https://drive.google.com/file/d/1D9MgDrAJvXd5Sb9g4enURIOLyjzieFSn/view?usp=drive_link",
    ],
    5: [
      "https://drive.google.com/file/d/10pyIAAiDslGnCVMJH23PthzLfDBThtOh/view?usp=sharing",
      "https://drive.google.com/file/d/1H-1so2pDpIFso0JTciZW3kxmQF4Wctl5/view?usp=sharing",
    ],
    6: [
      "https://drive.google.com/file/d/18c8HhikI1Po3y9undVGseH1KU69XeLj5/view?usp=sharing",
      "https://drive.google.com/file/d/1QdamY7iIiaY60IvVk_vaNj4rore_QP94/view?usp=sharing",
    ],
    7: [
      "https://drive.google.com/file/d/1gHpNk1tz4hJ0jyi8N-VTk7H-Ujoj6Qk6/view?usp=sharing",
    ],
    8: [
      "https://drive.google.com/file/d/1U1HT7InVLQ--Gc1C_qrOCR_ZJQpJixjA/view?usp=sharing",
    ],
    9: [
      "https://drive.google.com/file/d/1dLtqC6FNqeqwkDW6SaxGxsljkjwgiENP/view?usp=sharing",
      "https://drive.google.com/file/d/1MEYiG2y-m4zHUeiLR-d5xAjvVuRQ1s5B/view?usp=drive_link",
    ],
    10: [
      "https://drive.google.com/file/d/1iCL3bDS_bY10sxDbg2opyl-hh9I4SxDb/view?usp=sharing",
      "https://drive.google.com/file/d/1u3D-IG3HsgaEXVi0_bJOQOHFFXI4-mOv/view?usp=sharing",
    ],
    11: [
      "https://drive.google.com/file/d/1g9KYtZHIgWxC38yWaKoWtlaHA9Q0EXfX/view?usp=drive_link",
      "https://drive.google.com/drive/folders/1Ypk126aHFlSrVO0R9pcqBIXFwSewmf1O?usp=sharing",
    ],
    12: [
      "https://drive.google.com/file/d/1gTaY8LO5EPQqK9n9ooYFL0KaR4LBgn9W/view?usp=drive_link",
    ],
  };

  /** Títulos legibles para enlaces Drive (opcional; clave = semana global). */
  const WEEK_DRIVE_TITLES = {
    5: [
      "Normalización del Inventario Tecnológico",
      "SQL Server 2022 Command Center",
    ],
    6: [
      "Actividades · Preguntas del PDF",
      "Resumen semana 6",
    ],
    7: ["Documento semana 7"],
    8: ["Organized"],
    9: ["5 infografías", "Grados y títulos"],
    10: ["Manual Azure · infografía", "7 infografías"],
    11: ["Actividades semana 11", "Carpeta semana 11 (infografías)"],
    12: ["6 infografías"],
  };

  function getPresetDriveActivities() {
    const out = [];
    for (const weekStr of Object.keys(WEEK_DRIVE_LINKS)) {
      const week = clampWeek(Number(weekStr));
      const urls = WEEK_DRIVE_LINKS[weekStr];
      if (!Array.isArray(urls)) continue;
      const titles = WEEK_DRIVE_TITLES[weekStr];
      urls.forEach((url, idx) => {
        const um = getUnitMeta(splitWeek(week).unit);
        const customTitle = Array.isArray(titles) && titles[idx] ? titles[idx] : null;
        out.push({
          id: `drive-w${week}-${idx}`,
          week,
          date: "2026-01-01",
          title: customTitle
            ? `${customTitle} · sem. ${week}`
            : `Google Drive · semana ${week} (${idx + 1}/${urls.length})`,
          description: `Documento compartido en Google Drive (${um.label}).`,
          link: url,
          pdfKey: "",
          pdfName: "",
          createdAt: `drive-${week}-${String(idx).padStart(2, "0")}`,
          preset: true,
        });
      });
    }
    return out;
  }

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
    WEEK_DRIVE_LINKS,
    WEEK_DRIVE_TITLES,
    getPresetDriveActivities,
    clampWeek,
    splitWeek,
    absWeek,
    getUnitMeta,
  };
})(typeof window !== "undefined" ? window : globalThis);
