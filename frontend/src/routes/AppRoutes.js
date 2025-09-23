// src/routes/AppRoutes.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentProgressPage from "../pages/Student/StudentProgressPage.jsx";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";

import Home from "../pages/Home/Home";
import RegisterStudent from "../pages/Registration/RegisterStudent";
import OtpRequest from "../pages/Registration/OtpRequest";

import InstructorRoutes from "./instructorRoutes";

import PaymentDashboard from "../pages/Payments/PaymentDashboard";
import PaymentForm from "../pages/Payments/PaymentForm";
import PaymentHistory from "../pages/Payments/PaymentHistory";
import StatusFilterPage from "../pages/Instructor/StatusFilterPage";

// ✅ Vehicle pages
import VehicleList from "../pages/Vehicle/VehicleList";
import AddVehicle from "../pages/Vehicle/AddVehicle";
import EditVehicle from "../pages/Vehicle/EditVehicle";
import VehicleDetails from "../pages/Vehicle/VehicleDetails";
import VehicleDashboard from "../pages/Vehicle/VehicleDashboard";

import InstructorLessonEntryPage from "../pages/Instructor/InstructorLessonEntryPage";
import ProgressTrackingDashboard from "../pages/ProgressTracking/ProgressTrackingDashboard";
import LessonProgressList from "../pages/LessonProgress/LessonProgressList";
import StudentLessons from "../pages/LessonProgress/StudentLessons";
import LessonProgressDashboard from "../pages/LessonProgress/LessonProgressDashboard";
import InstructorLessonProgressHome from "../pages/Instructor/InstructorLessonProgressHome";
import StudentList from "../pages/LessonProgress/StudentList";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<Home />} />

      {/* Dashboards */}
      <Route path="/student/*" element={<StudentDashboard />} />
      <Route path="/student/progress" element={<StudentProgressPage />} />
      <Route path="/instructor/*" element={<InstructorDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />

      {/* Instructors */}
      <Route path="/*" element={<InstructorRoutes />} />
      <Route path="/instructor/filter" element={<StatusFilterPage />} />
      <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
      <Route path="/instructor/lesson-entry" element={<InstructorLessonEntryPage />} />
      <Route path="/instructor/lesson-progress" element={<InstructorLessonProgressHome />} />

      {/* Student registration */}
      <Route path="/register" element={<RegisterStudent />} />
      <Route path="/otp-request" element={<OtpRequest />} />

      {/* Progress tracking */}
      <Route path="/progress-tracking" element={<ProgressTrackingDashboard />} />

      {/* Lesson progress */}
      <Route path="/lesson-progress" element={<LessonProgressDashboard />} />
      <Route path="/lesson-progress/all" element={<LessonProgressList />} />
      <Route path="/lesson-progress/students" element={<StudentList />} />
      <Route path="/lesson-progress/student/:studentId" element={<StudentLessons />} />

      {/* Payments */}
      <Route path="/payments" element={<PaymentDashboard />} />
      <Route path="/payments/form" element={<PaymentForm />} />
      <Route path="/payments/history" element={<PaymentHistory />} />

      {/* Vehicles */}
      <Route path="/vehicles" element={<VehicleList />} />
      <Route path="/vehicles/add" element={<AddVehicle />} />
      <Route path="/vehicles/:id" element={<VehicleDetails />} />
      <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
      <Route path="/dashboard" element={<VehicleDashboard />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/payments" replace />} />
      <Route path="*" element={<Navigate to="/payments" replace />} />
    </Routes>
  );
}
