import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("rg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const PaymentAPI = {
  getAll: async () => {
    try {
      const res = await client.get("/payments");
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  getById: async (id) => {
    try {
      const res = await client.get(`/payments/${id}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  uploadSlip: async (file, onProgress) => {
    const form = new FormData();
    form.append("file", file);
    const res = await client.post("/payments/upload-slip", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (typeof onProgress === "function" && evt.total) {
          const pct = Math.round((evt.loaded * 100) / evt.total);
          onProgress(pct);
        }
      },
    });
    return res.data; // { path }
  },
  create: async (payload) => {
    try {
      const res = await client.post("/payments", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  update: async (id, payload) => {
    try {
      const res = await client.put(`/payments/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  remove: async (id) => {
    try {
      const res = await client.delete(`/payments/${id}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  // Admin endpoints
  adminApprove: async (id, adminComment = "") => {
    try {
      const res = await client.patch(`/admin/payments/${id}/approve`, { adminComment });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  adminReject: async (id, adminComment = "") => {
    try {
      const res = await client.patch(`/admin/payments/${id}/reject`, { adminComment });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
};
