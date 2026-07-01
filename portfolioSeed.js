/**
 * Actividades predefinidas del portafolio · Unidad III (semanas 9–12).
 * Se cargan una sola vez en localStorage para que aparezcan como entregables editables.
 */
(function portfolioSeedGlobal(win) {
  const SEED_FLAG = "bd2_upla_seeded_unit3_v2";
  const STORAGE_KEY = "bd2_upla_actividades_v1";

  /** @type {Array<object>} */
  const UNIT3_ACTIVITIES = [
    {
      id: "u3-w9-infografias",
      week: 9,
      date: "2026-05-05",
      title: "Infografías SQL avanzado (5 temas)",
      description:
        "Conjunto de cinco infografías de la Unidad III: consultas multitabla, subconsultas, operadores de conjunto, funciones de agregación y buenas prácticas de DML. Material visual de apoyo al portafolio.",
      link: "https://drive.google.com/file/d/1dLtqC6FNqeqwkDW6SaxGxsljkjwgiENP/view?usp=sharing",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-05T10:00:00.000Z",
    },
    {
      id: "u3-w9-grados",
      week: 9,
      date: "2026-05-06",
      title: "Infografía · Grados y títulos",
      description:
        "Infografía sobre el proceso académico de grados y títulos, vinculado al escenario de base de datos institucional (tesistas, jurados, trámites) desarrollado en la unidad.",
      link: "https://drive.google.com/file/d/1MEYiG2y-m4zHUeiLR-d5xAjvVuRQ1s5B/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-06T10:00:00.000Z",
    },
    {
      id: "u3-w9-manual-codigo",
      week: 9,
      date: "2026-06-30",
      title: "Manual y código BD UPLA",
      description:
        "Manual técnico y código de apoyo para la base de datos institucional UPLA (grados, títulos y trámites académicos). Incluye scripts y referencias de la semana 9 · Unidad III.",
      link: "https://drive.google.com/file/d/1ZkH6i191f1Ki1IuehLAAP7YMgS4OfbNd/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-06-30T10:00:00.000Z",
    },
    {
      id: "u3-w10-azure",
      week: 10,
      date: "2026-05-12",
      title: "Manual Azure SQL · Infografía",
      description:
        "Manual-infografía sobre servicios Azure SQL Database: arquitectura cloud, despliegue, conectividad y administración básica en la nube. Entregable visual del portafolio.",
      link: "https://drive.google.com/file/d/1iCL3bDS_bY10sxDbg2opyl-hh9I4SxDb/view?usp=sharing",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-12T10:00:00.000Z",
    },
    {
      id: "u3-w10-infografias",
      week: 10,
      date: "2026-05-13",
      title: "Infografías SQL avanzado (7 temas)",
      description:
        "Siete infografías complementarias: vistas, transacciones, integridad referencial, índices, procedimientos almacenados, funciones definidas por el usuario y seguridad básica en SQL Server.",
      link: "https://drive.google.com/file/d/1u3D-IG3HsgaEXVi0_bJOQOHFFXI4-mOv/view?usp=sharing",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-13T10:00:00.000Z",
    },
    {
      id: "u3-w11-guia",
      week: 11,
      date: "2026-05-19",
      title: "Guía · Administración y seguridad SQL Server",
      description:
        "Guía de gestión técnica: administración y seguridad en SQL Server aplicada al contexto UPLA (grados, títulos y trámites académicos). Documento base de la semana 11.",
      link: "https://drive.google.com/file/d/1g9KYtZHIgWxC38yWaKoWtlaHA9Q0EXfX/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-19T09:00:00.000Z",
    },
    {
      id: "u3-w11-t1-auth",
      week: 11,
      date: "2026-05-19",
      title: "Tema 1 · Autenticación SQL y Windows",
      description:
        "Diferencias entre autenticación SQL Server y Windows, prácticas seguras y proyectos: acceso mixto (personal académico/administrativo), accesos para jurado de tesis y políticas estrictas de cuentas.",
      link: "https://drive.google.com/file/d/1g9KYtZHIgWxC38yWaKoWtlaHA9Q0EXfX/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-19T10:00:00.000Z",
    },
    {
      id: "u3-w11-t2-servicio",
      week: 11,
      date: "2026-05-20",
      title: "Tema 2 · Cuentas de servicio y configuración",
      description:
        "Configuración segura de servicios SQL Server, monitoreo de servicios críticos y protocolos de red seguros para el servidor institucional.",
      link: "https://drive.google.com/file/d/1g9KYtZHIgWxC38yWaKoWtlaHA9Q0EXfX/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-20T10:00:00.000Z",
    },
    {
      id: "u3-w11-t3-roles",
      week: 11,
      date: "2026-05-20",
      title: "Tema 3 · Roles fijos y personalizados",
      description:
        "Creación de roles para grados y títulos, evaluadores de tesis y estructura jerárquica institucional. Incluye diseño de roles db_datareader, db_datawriter y roles personalizados por área.",
      link: "https://drive.google.com/file/d/1g9KYtZHIgWxC38yWaKoWtlaHA9Q0EXfX/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-20T11:00:00.000Z",
    },
    {
      id: "u3-w11-t4-grant",
      week: 11,
      date: "2026-05-21",
      title: "Tema 4 · GRANT, DENY y REVOKE",
      description:
        "Control de acceso con GRANT, DENY y REVOKE. Proyectos: restricciones para operadores académicos, bloqueo de resoluciones/diplomas y revocación de permisos temporales.\n\nEjemplo:\nGRANT SELECT ON dbo.Tramites TO rol_academico;\nDENY INSERT, DELETE ON dbo.Diplomas TO rol_academico;",
      link: "https://drive.google.com/file/d/1g9KYtZHIgWxC38yWaKoWtlaHA9Q0EXfX/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-21T10:00:00.000Z",
    },
    {
      id: "u3-w11-t5-cifrado",
      week: 11,
      date: "2026-05-21",
      title: "Tema 5 · TDE y Always Encrypted",
      description:
        "Cifrado y protección de datos: Transparent Data Encryption (TDE) para grados y títulos, protección de datos personales del tesista y cifrado de información de jurados y asesores.",
      link: "https://drive.google.com/file/d/1g9KYtZHIgWxC38yWaKoWtlaHA9Q0EXfX/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-21T11:00:00.000Z",
    },
    {
      id: "u3-w11-t6-auditoria",
      week: 11,
      date: "2026-05-22",
      title: "Tema 6 · Auditoría SQL Server",
      description:
        "Auditoría y monitoreo con SQL Server Audit: accesos a la BD, modificaciones en trámites académicos y sistema integral de auditoría institucional.",
      link: "https://drive.google.com/file/d/1g9KYtZHIgWxC38yWaKoWtlaHA9Q0EXfX/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-22T10:00:00.000Z",
    },
    {
      id: "u3-w11-infografias",
      week: 11,
      date: "2026-05-22",
      title: "Infografías semana 11 (6 temas)",
      description:
        "Seis infografías de apoyo visual sobre administración y seguridad en SQL Server (autenticación, roles, permisos, cifrado y auditoría).",
      link: "https://drive.google.com/drive/folders/1Ypk126aHFlSrVO0R9pcqBIXFwSewmf1O?usp=sharing",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-22T11:00:00.000Z",
    },
    {
      id: "u3-w12-infografias",
      week: 12,
      date: "2026-05-26",
      title: "Infografías SQL avanzado (6 temas)",
      description:
        "Cierre de la Unidad III con seis infografías: triggers, cursores, manejo de errores (TRY/CATCH), optimización de consultas, planes de ejecución y automatización T-SQL.",
      link: "https://drive.google.com/file/d/1gTaY8LO5EPQqK9n9ooYFL0KaR4LBgn9W/view?usp=drive_link",
      pdfKey: "",
      pdfName: "",
      createdAt: "2026-05-26T10:00:00.000Z",
    },
  ];

  function safeParseJSON(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  function seedUnit3Portfolio() {
    try {
      if (win.localStorage.getItem(SEED_FLAG) === "1") return { seeded: false, added: 0 };

      const raw = win.localStorage.getItem(STORAGE_KEY);
      const existing = safeParseJSON(raw);
      const list = Array.isArray(existing) ? existing.slice() : [];
      const ids = new Set(list.map((x) => x.id));
      let added = 0;

      for (const item of UNIT3_ACTIVITIES) {
        if (ids.has(item.id)) continue;
        list.push({ ...item });
        ids.add(item.id);
        added += 1;
      }

      win.localStorage.setItem(STORAGE_KEY, JSON.stringify(list, null, 2));
      win.localStorage.setItem(SEED_FLAG, "1");

      if (added > 0 && win.Bd2WeekSnapshot) {
        win.Bd2WeekSnapshot.persistWeekSnapshot(list);
      }

      return { seeded: true, added };
    } catch (e) {
      console.warn("portfolioSeed:", e);
      return { seeded: false, added: 0, error: e };
    }
  }

  win.Bd2PortfolioSeed = {
    SEED_FLAG,
    UNIT3_ACTIVITIES,
    seedUnit3Portfolio,
  };

  seedUnit3Portfolio();
})(typeof window !== "undefined" ? window : globalThis);
