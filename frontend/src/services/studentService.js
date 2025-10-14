// src/services/studentService.js
import { apiFetch } from "./api";

export const studentService = {
  async getAllStudents() {
    // apiFetch will include auth headers when available
    return apiFetch("/api/students");
  },

  async getStudentById(studentId) {
    return apiFetch(`/api/students/${encodeURIComponent(studentId)}`);
  }
};
