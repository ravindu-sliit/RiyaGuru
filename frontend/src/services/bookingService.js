// src/services/bookingService.js
import axios from "axios";
import authService from "./authService";

// 🔹 Base API URL (use .env for flexibility)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/bookings";

// Helper to get auth headers
const authHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const bookingService = {
  // Get all bookings
  async getBookings() {
    const res = await axios.get(`${API_URL}`, {
      headers: authHeader(),
      withCredentials: true,
    });
    return res.data;
  },

  // Get single booking by ID
  async getBookingById(id) {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: authHeader(),
      withCredentials: true,
    });
    return res.data;
  },

  // Create a new booking
  async createBooking(data) {
    const res = await axios.post(`${API_URL}`, data, {
      headers: authHeader(),
      withCredentials: true,
    });
    return res.data;
  },

  // Update an existing booking
  async updateBooking(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: authHeader(),
      withCredentials: true,
    });
    return res.data;
  },

  // Delete booking
  async deleteBooking(id) {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: authHeader(),
      withCredentials: true,
    });
    return res.data;
  },

  // Check availability (for logged-in student’s allowed courses)
  async checkAvailability(date, time) {
    const res = await axios.get(`${API_URL}/availability/check`, {
      params: { date, time },
      headers: authHeader(),
      withCredentials: true,
    });
    return res.data;
  },

  // Get logged-in student’s courses
  async getMyCourses() {
    const res = await axios.get(`${API_URL}/my-courses`, {
      headers: authHeader(),
      withCredentials: true,
    });
    return res.data;
  },
};

export default bookingService;
