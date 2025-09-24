import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const CourseAPI = {
  // Add a new course
  add: async (data) => {
    try {
      const res = await client.post("/courses", data);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Get all courses
  getAll: async () => {
    try {
      const res = await client.get("/courses");
      return res.data;
    } catch (err) {
      throw err;
    }
  },
};
