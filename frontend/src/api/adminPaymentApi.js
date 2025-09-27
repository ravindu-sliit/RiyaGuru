import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AdminPaymentAPI = {
  approve: async (id) => {
    try {
      const res = await client.patch(`/admin/payments/${id}/approve`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  reject: async (id) => {
    try {
      const res = await client.patch(`/admin/payments/${id}/reject`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  runReminders: async () => {
    try {
      const res = await client.post("/admin/payments/reminders/run");
      return res.data;
    } catch (err) {
      throw err;
    }
  },
};
