import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";


const client = axios.create({
  baseURL: API_BASE,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const InstructorAPI = {
  getAll: () => client.get("/instructors"),
  getById: (id) => client.get(`/instructors/${id}`),
  create: (payload) =>
    client.post("/instructors", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, payload) =>
    client.put(`/instructors/${id}`, payload, {
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
    }),
  remove: (id) => client.delete(`/instructors/${id}`),

  availability: ({ date, time }) =>
    client.get("/instructors/availability/check", { params: { date, time } }),
  byStatus: (status) => client.get(`/instructors/status/${status}`),
  toggleStatus: (id, next) => client.put(`/instructors/${id}`, { status: next }),
};

export default InstructorAPI;
