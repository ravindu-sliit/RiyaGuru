import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("rg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const StudentCourseAPI = {
  add: async (payload) => {
    try {
      const res = await client.post("/studentcourses", payload);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  getAll: async () => {
    try {
      const res = await client.get("/studentcourses");
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  getByStudentId: async (studentId) => {
    try {
      const res = await client.get(`/studentcourses/${studentId}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  update: async (studentId, payload) => {
    try {
      const res = await client.put(`/studentcourses/${studentId}`, payload);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  remove: async (studentId, courseId) => {
    try {
      const res = await client.delete(
        `/studentcourses/${studentId}/${courseId}`
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  },
};
