/**
 * Sincronización opcional con GitHub (Contents API). El token se guarda solo en este navegador.
 * No usar en equipos compartidos sin entender el riesgo.
 */
(function githubSyncGlobal(win) {
  const SETTINGS_KEY = "bd2_github_sync_v1";

  /** @returns {{ enabled: boolean, token: string, owner: string, repo: string, branch: string, path: string }} */
  function defaultSettings() {
    return {
      enabled: false,
      token: "",
      owner: "",
      repo: "",
      branch: "main",
      path: "data/bd2-portfolio.json",
    };
  }

  function loadSettings() {
    const raw = win.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    try {
      const o = JSON.parse(raw);
      return { ...defaultSettings(), ...o };
    } catch {
      return defaultSettings();
    }
  }

  function saveSettings(partial) {
    const next = { ...loadSettings(), ...partial };
    win.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    return next;
  }

  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    return win.btoa(bin);
  }

  /**
   * @param {object} opts
   * @param {string} opts.token
   * @param {string} opts.owner
   * @param {string} opts.repo
   * @param {string} opts.path
   * @param {string} opts.branch
   * @param {string} opts.content - texto UTF-8 del archivo
   * @param {string} [opts.message]
   */
  async function putRepoFile(opts) {
    const { token, owner, repo, path, branch, content, message } = opts;
    if (!token || !owner || !repo || !path) {
      throw new Error("Faltan token, owner, repo o ruta del archivo.");
    }
    const safePath = path
      .split("/")
      .filter(Boolean)
      .map((seg) => encodeURIComponent(seg))
      .join("/");
    const api = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${safePath}`;

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    let sha;
    const getRes = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    } else if (getRes.status !== 404) {
      const t = await getRes.text();
      throw new Error(`GitHub (${getRes.status}): ${t.slice(0, 200)}`);
    }

    const body = {
      message: message || `BD2 portfolio · ${new Date().toISOString()}`,
      content: utf8ToBase64(content),
      branch,
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(api, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const t = await putRes.text();
      throw new Error(`GitHub al guardar (${putRes.status}): ${t.slice(0, 280)}`);
    }
    return putRes.json();
  }

  /** @param {object} portfolio objeto serializable (p. ej. buildPortfolioExport) */
  async function syncPortfolioJson(portfolio) {
    const s = loadSettings();
    if (!s.enabled || !s.token) return { skipped: true, reason: "sync_disabled" };
    const json = JSON.stringify(portfolio, null, 2);
    await putRepoFile({
      token: s.token.trim(),
      owner: s.owner.trim(),
      repo: s.repo.trim(),
      branch: (s.branch || "main").trim(),
      path: (s.path || "data/bd2-portfolio.json").trim(),
      content: json,
    });
    return { skipped: false, ok: true };
  }

  win.Bd2GitHubSync = {
    SETTINGS_KEY,
    loadSettings,
    saveSettings,
    putRepoFile,
    syncPortfolioJson,
  };
})(typeof window !== "undefined" ? window : globalThis);
