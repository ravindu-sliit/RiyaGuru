// src/routes/AppRoutes.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentProgressPage from "../pages/Student/StudentProgressPage.jsx";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";

import StudentDocUpload from "../pages/Student/StudentDocUpload";

import Home from "../pages/Home/Home";
import RegisterStudent from "../pages/Registration/RegisterStudent";
import OtpRequest from "../pages/Registration/OtpRequest";

import InstructorRoutes from "./instructorRoutes";
import InstructorLessonEntryPage from "../pages/Instructor/InstructorLessonEntryPage";
import PaymentDashboard from "../pages/Payments/PaymentDashboard";
import PaymentForm from "../pages/Payments/PaymentForm";
import PaymentHistory from "../pages/Payments/PaymentHistory";

import StudentPasswordChange from "../pages/Student/StudentPasswordChange";
import StudentDetailsEdit from "../pages/Student/StudentDetailsEdit";

import StudentPreferences from "../pages/Student/StudentPreferences";


// Simple guard for Student-only routes
function RequireStudent({ children }) {
  const role = localStorage.getItem("rg_role");
  const token = localStorage.getItem("rg_token");
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "Student") return <Navigate to="/home" replace />;
  return children;
}


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />

        {/* Dashboards */}

        {/* Student dashboard (protected) */}
        <Route path="/student/:id/dashboard" element={<RequireStudent><StudentDashboard /></RequireStudent>}/>


        {/* Student Doc Upload */}
        <Route path="/student/:id/docs/upload" element={<RequireStudent><StudentDocUpload /></RequireStudent>}/>

        {/* Student Profile edit */}
        <Route path="/student/:id/edit" element={ <RequireStudent><StudentDetailsEdit /></RequireStudent>}/>

        {/* Student Password Change */}
        <Route path="/student/:id/password" element={ <RequireStudent><StudentPasswordChange /></RequireStudent>} />

        <Route path="/student/:id/preferences"element={<RequireStudent> <StudentPreferences /> </RequireStudent>}/>

        <Route path="/student/progress" element={<StudentProgressPage />} />
        <Route path="/instructor/*" element={<InstructorDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        <Route path="/register" element={<RegisterStudent />} />
        <Route path="/otp-request" element={<OtpRequest />} />

        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />

        {/* Instructors */}
        <Route path="/*" element={<InstructorRoutes />} />
        <Route
          path="/instructor/lesson-entry"
          element={<InstructorLessonEntryPage />}
        />

        {/* Default route redirects to payment dashboard */}
        <Route path="/" element={<Navigate to="/payments" replace />} />

        {/* Payment Routes */}
        <Route path="/payments" element={<PaymentDashboard />} />
        <Route path="/payments/form" element={<PaymentForm />} />
        <Route path="/payments/history" element={<PaymentHistory />} />

        {/* Catch all route - redirect to payments */}
        <Route path="*" element={<Navigate to="/payments" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
