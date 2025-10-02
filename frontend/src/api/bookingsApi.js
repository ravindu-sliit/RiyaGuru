import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_BASE });

// 🔑 Automatically attach Bearer token from localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("rg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const BookingAPI = {
  // 📌 Get my booked courses
  getMyCourses: async () => {
    try {
      const res = await client.get("/bookings/my-courses");
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // 📌 Check availability
  checkAvailability: async (params) => {
    try {
      const res = await client.get("/bookings/availability/check", { params });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // 📌 Create a booking (always defaults to "pending" on backend)
  create: async (data) => {
    try {
      const res = await client.post("/bookings", data);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // 📌 Get all bookings (Admin only)
  getAll: async () => {
    try {
      const res = await client.get("/bookings");
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // 📌 Get booking by ID
  getById: async (id) => {
    try {
      const res = await client.get(`/bookings/${id}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // 📌 Update booking (date/time/etc.)
  update: async (id, data) => {
    try {
      const res = await client.put(`/bookings/${id}`, data);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // 📌 Delete booking
  remove: async (id) => {
    try {
      const res = await client.delete(`/bookings/${id}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // 📌 Update booking status (pending → booked → started → completed/cancelled)
  updateStatus: async (id, status) => {
    try {
      // 🔹 Ensure status is lowercase before sending
      const normalizedStatus = String(status).toLowerCase();

      // ✅ matches backend route: PUT /api/bookings/:id/status
      const res = await client.put(`/bookings/${id}/status`, {
        status: normalizedStatus,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
};
