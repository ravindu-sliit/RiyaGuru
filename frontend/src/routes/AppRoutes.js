// src/routes/AppRoutes.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Home from "../pages/Home/Home";
import RegisterStudent from "../pages/Registration/RegisterStudent";
import OtpRequest from "../pages/Registration/OtpRequest";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />

        {/* Dashboards */}
        <Route path="/student/*" element={<StudentDashboard />} />
        <Route path="/instructor/*" element={<InstructorDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        <Route path="/register" element={<RegisterStudent />} />
        <Route path="/otp-request" element={<OtpRequest />} />


      </Routes>
    </BrowserRouter>
  );
}
