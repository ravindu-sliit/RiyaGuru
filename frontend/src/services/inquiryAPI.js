// src/services/inquiryAPI.js - API Service for Inquiry Operations

// Use CRA proxy via relative base URL
const BASE_URL = "/api";

const apiCall = async (url, options = {}) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`);
  }
  return data; // backend shape: { success, data } (except delete which may return { success, message })
};

export const inquiryAPI = {
  getAll: async () => {
    const r = await apiCall(`/inquiries`);
    return r.data;
  },
  getById: async (id) => {
    const r = await apiCall(`/inquiries/${id}`);
    return r.data;
  },
  create: async (payload) => {
    const r = await apiCall(`/inquiries`, { method: "POST", body: JSON.stringify(payload) });
    return r.data;
  },
  update: async (id, payload) => {
    const r = await apiCall(`/inquiries/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    return r.data;
  },
  remove: async (id) => {
    return apiCall(`/inquiries/${id}`, { method: "DELETE" });
  },
};

export const { getAll, getById, create, update, remove } = inquiryAPI;
export default inquiryAPI;
