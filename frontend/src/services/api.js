const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const raw = localStorage.getItem("rg_auth");
  const token = raw ? JSON.parse(raw)?.token : null;

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export { API_BASE };
