// src/services/authHeader.js
export function getAuthToken() {
  // Try multiple common storage keys used across the app
  const rawAuth = localStorage.getItem("rg_auth") || localStorage.getItem("rg_token") || localStorage.getItem("rgAuth");
  if (!rawAuth) return null;
  try {
    const parsed = JSON.parse(rawAuth);
    return parsed?.token || null;
  } catch (e) {
    // rawAuth might be a plain token string
    return rawAuth;
  }
}

export function authHeaders(contentType = "application/json") {
  const token = getAuthToken();
  const headers = {};
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export default authHeaders;
