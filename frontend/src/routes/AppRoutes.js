// src/routes/AppRoutes.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// existing imports
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";

// Maintenance
import MaintenanceDashboard from "../pages/Maintenance/MaintenanceDashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboards */}
        <Route path="/student/*" element={<StudentDashboard />} />
        <Route path="/instructor/*" element={<InstructorDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Maintenance (single-page dashboard that swaps list/form/view internally) */}
        <Route path="/maintenance" element={<MaintenanceDashboard />} />

        {/* Default route → send user to Maintenance */}
        <Route path="/" element={<Navigate to="/maintenance" replace />} />

        {/* Fallback for unknown urls */}
        <Route path="*" element={<Navigate to="/maintenance" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
