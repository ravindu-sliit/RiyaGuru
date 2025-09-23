// src/services/authService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/auth";

const authService = {
  // Login user
  async login(email, password) {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    if (res.data.token) {
      // Save token + user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("role", res.data.role);
    }
    return res.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  },

  // Get token
  getToken() {
    return localStorage.getItem("token");
  },

  // Get current logged in user info
  getUser() {
    return {
      userId: localStorage.getItem("userId"),
      role: localStorage.getItem("role"),
    };
  },
};

export default authService;
