/* API client for the Adil Furnitures backend.
   Contract used by the site: API.get(path,opts), API.post(path,body,opts), API.whenReady() -> Promise<boolean>
   opts: { retries, wake, timeout, keepalive }
   Errors: if the server answered with a non-2xx status the Error has .status/.data (validation, stock...);
   network failures / timeouts have no .status so callers can fall back (e.g. open WhatsApp directly). */
const API = (() => {
  const BASE = String(window.API_BASE || "").replace(/\/$/, "");
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const configured = () => BASE && !/YOUR-BACKEND/i.test(BASE);

  async function once(method, path, body, o) {
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const t = ctl ? setTimeout(() => ctl.abort(), o.timeout || 15000) : null;
    try {
      const r = await fetch(BASE + path, {
        method,
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        keepalive: !!o.keepalive,
        credentials: "omit",
        signal: ctl ? ctl.signal : undefined
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(d.error || ("Request failed (" + r.status + ")")), { status: r.status, data: d });
      return d;
    } finally { if (t) clearTimeout(t); }
  }

  async function call(method, path, body, o) {
    o = o || {};
    if (!configured()) throw new Error("Backend URL not configured");
    const max = o.retries == null ? 2 : o.retries;
    let n = 0;
    for (;;) {
      try { return await once(method, path, body, o); }
      catch (e) {
        const transient = !e.status || e.status === 502 || e.status === 503 || e.status === 504;   // cold start / db connecting / network
        if (!transient || n >= max) throw e;
        n++;
        await sleep(Math.min(1500 * n, o.wake ? 6000 : 3000));
      }
    }
  }

  let readyP = null;
  function whenReady() {
    if (!readyP) readyP = configured()
      ? call("GET", "/api/health", undefined, { retries: 8, wake: true, timeout: 20000 }).then(() => true, () => false).then(ok => { if (!ok) readyP = null; return ok; })
      : Promise.resolve(false);
    return readyP;
  }

  return {
    base: BASE,
    get: (p, o) => call("GET", p, undefined, o),
    post: (p, b, o) => call("POST", p, b === undefined ? {} : b, o),
    whenReady
  };
})();
