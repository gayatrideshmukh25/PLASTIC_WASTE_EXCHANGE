// Single place that knows where the backend lives and how to talk to it.
// Empty base = same origin (Vite proxies /api in dev). Set VITE_API_URL for a separate API host.
export const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * fetch() wrapper used by every page.
 *  - always sends cookies (the backend uses a session)
 *  - JSON-encodes `json` bodies
 *  - never throws on non-2xx or non-JSON responses: you always get `{ ok, status, data }`
 *    where `data` is at least `{}` (so `data.success` is safely falsy)
 *  - still throws on network failure, so callers can show "could not reach the server"
 */
export async function apiFetch(path, { json, headers, ...init } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });

  let data = {};
  try {
    data = (await res.json()) ?? {};
  } catch {
    /* empty or non-JSON body */
  }
  return { ok: res.ok, status: res.status, data };
}

export const apiGet = (path, init) => apiFetch(path, { ...init, method: "GET" });
export const apiPost = (path, json, init) => apiFetch(path, { ...init, method: "POST", json });

export const NETWORK_ERROR = "Could not reach the server. Please try again.";
