const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const lessonProgressService = {
  // ✅ Get all lesson progress
  async getAllLessonProgress() {
    const res = await fetch(`${API_URL}/lesson-progress`);
    if (!res.ok) throw new Error("Failed to fetch lesson progress");
    return res.json();
  },

  // ✅ Get lessons for a specific student
  async getLessonsByStudent(studentId) {
    const res = await fetch(`${API_URL}/lesson-progress/${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch student lessons");
    return res.json();
  },

  // ✅ Add a new lesson progress record
  async addLessonProgress(lessonData) {
    const res = await fetch(`${API_URL}/lesson-progress/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lessonData),
    });
    if (!res.ok) throw new Error("Failed to add lesson progress");
    return res.json();
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
