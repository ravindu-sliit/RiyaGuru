// src/routes/AppRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentProgressPage from "../pages/Student/StudentProgressPage.jsx";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import InstructorRoutes from "./instructorRoutes";
import InstructorLessonEntryPage from "../pages/Instructor/InstructorLessonEntryPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboards */}
      <Route path="/student/*" element={<StudentDashboard />} />
      <Route path="/student/progress" element={<StudentProgressPage />} />
      <Route path="/instructor/*" element={<InstructorDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />

      {/* Instructors */}
      <Route path="/*" element={<InstructorRoutes />} />
      <Route path="/instructor/lesson-entry" element={<InstructorLessonEntryPage />} />

   
      {/* Admin Routes */}
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin/installments" element={<InstallmentManagement />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/payments/enrollments" replace />} />
    </Routes>
  );
}
