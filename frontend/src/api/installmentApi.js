// frontend/api/installmentApi.js
const API_URL = `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/installments`;

const authHeaders = (extra = {}) => {
  const token = localStorage.getItem("rg_token");
  const headers = { ...extra };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export async function createPlan(data) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function getAllPlans(studentId) {
  try {
    const url = studentId ? `${API_URL}?studentId=${studentId}` : API_URL;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function getPlanById(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function updatePlan(id, data) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function payInstallment(id, data) {
  try {
    const res = await fetch(`${API_URL}/${id}/pay`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export const deletePlan = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const message = text || res.statusText || "Delete failed";
      throw new Error(message);
    }
    // 204 No Content or empty body
    if (res.status === 204) return { success: true };
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return await res.json();
    }
    return { success: true };
  } catch (err) {
    throw err;
  }
};

// Admin endpoints
export async function adminApprovePlan(id, adminComment = "") {
  const ADMIN_URL = `${(process.env.REACT_APP_API_URL || "http://localhost:5000/api")}/admin/installments`;
  const res = await fetch(`${ADMIN_URL}/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ adminComment }),
  });
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return await res.json();
}

export async function adminRejectPlan(id, adminComment = "") {
  const ADMIN_URL = `${(process.env.REACT_APP_API_URL || "http://localhost:5000/api")}/admin/installments`;
  const res = await fetch(`${ADMIN_URL}/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ adminComment }),
  });
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return await res.json();
}
