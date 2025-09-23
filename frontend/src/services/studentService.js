// src/services/studentService.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const studentService = {
  async getAllStudents() {
    const res = await fetch(`${API_URL}/students`);
    if (!res.ok) throw new Error("Failed to fetch students");
    return res.json(); // returns { students: [...] }
  },

  async getStudentById(studentId) {
    const res = await fetch(`${API_URL}/students/${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch student");
    return res.json();
  }
};
