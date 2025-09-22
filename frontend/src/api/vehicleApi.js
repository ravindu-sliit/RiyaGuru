import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: `${API_BASE}/vehicles`,
});

// Attach token if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const vehicleApi = {
  // Get all vehicles
  getAll: () => client.get("/"),

  // Get one vehicle
  getById: (id) => client.get(`/${id}`),

  // Create vehicle (with image upload)
  create: (payload) =>
    client.post("/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Update vehicle
  update: (id, payload) =>
    client.put(`/${id}`, payload, {
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
    }),

  // Delete vehicle
  remove: (id) => client.delete(`/${id}`),

  // Get vehicles by status
  byStatus: (status) => client.get(`/status/${status}`),

  // Check availability
  availability: ({ date, time }) =>
    client.get("/availability/check", { params: { date, time } }),
};

export default vehicleApi;
