import { authHeaders } from "./authHeader";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const lessonProgressService = {
  // ✅ Get all lesson progress
  async getAllLessonProgress() {
    const rawAuth = localStorage.getItem("rg_auth") || localStorage.getItem("rg_token");
    let token = null;
    try {
      const parsed = JSON.parse(rawAuth || "null");
      token = parsed?.token || rawAuth;
    } catch (e) {
      token = rawAuth;
    }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_URL}/lesson-progress`, { headers });
    if (!res.ok) throw new Error("Failed to fetch lesson progress");
    return res.json();
  },

  // ✅ Get lessons for a specific student
  async getLessonsByStudent(studentId) {
    // attach auth header if token is present in localStorage (repo uses inconsistent keys)
    const rawAuth = localStorage.getItem("rg_auth") || localStorage.getItem("rg_token");
    let token = null;
    try {
      const parsed = JSON.parse(rawAuth || "null");
      token = parsed?.token || rawAuth; // rawAuth may itself be a token string
    } catch (e) {
      token = rawAuth; // fallback: raw string token
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_URL}/lesson-progress/${studentId}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch student lessons");
    return res.json();
  },

  // Get completed lessons for a given student and course (server-side filtered)
  async getLessonsByStudentAndCourse(studentId, courseName) {
    const rawAuth = localStorage.getItem("rg_auth") || localStorage.getItem("rg_token");
    let token = null;
    try {
      const parsed = JSON.parse(rawAuth || "null");
      token = parsed?.token || rawAuth;
    } catch (e) {
      token = rawAuth;
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_URL}/lesson-progress/${studentId}/${encodeURIComponent(courseName)}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch student lessons by course");
    return res.json();
  },

  // ✅ Add a new lesson progress record
  async addLessonProgress(lessonData) {
    const headers = authHeaders("application/json");
    const res = await fetch(`${API_URL}/lesson-progress/add`, {
      method: "POST",
      headers,
      body: JSON.stringify(lessonData),
    });
    // try to parse response body (may contain structured error message)
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    if (!res.ok) {
      const serverMsg = data?.message || data?.error || (typeof data === 'string' ? data : null);
      throw new Error(serverMsg || "Failed to add lesson progress");
    }

    return data;
  },

  // ❌ Currently your backend does NOT support deleting lessons
  // If you want delete functionality, add a DELETE route in backend first.
  async deleteLessonProgress(lessonId) {
    const res = await fetch(`${API_URL}/lesson-progress/${lessonId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete lesson progress");
    return res.json();
  },
};
