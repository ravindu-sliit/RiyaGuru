import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("rg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const StudentAPI = {
  getById: async (id) => {
    const res = await client.get(`/students/${id}`);
    return res.data; // shape depends on backend; expect {student} or data directly
  },
};
