// src/routes/AppRoutes.js

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// existing imports


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


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

import StudentDocUpload from "../pages/Student/StudentDocUpload";

import Home from "../pages/Home/Home";
import RegisterStudent from "../pages/Registration/RegisterStudent";
import OtpRequest from "../pages/Registration/OtpRequest";

import InstructorRoutes from "./instructorRoutes";
import StatusFilterPage from "../pages/Instructor/StatusFilterPage";

// ✅ Vehicle pages
import VehicleList from "../pages/Vehicle/VehicleList";
import AddVehicle from "../pages/Vehicle/AddVehicle";
import EditVehicle from "../pages/Vehicle/EditVehicle";
import VehicleDetails from "../pages/Vehicle/VehicleDetails";
import VehicleDashboard from "../pages/Vehicle/VehicleDashboard";

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

import ProgressTrackingDashboard from "../pages/ProgressTracking/ProgressTrackingDashboard";
import LessonProgressList from "../pages/LessonProgress/LessonProgressList";
import StudentLessons from "../pages/LessonProgress/StudentLessons";
import LessonProgressDashboard from "../pages/LessonProgress/LessonProgressDashboard";
import InstructorLessonProgressHome from "../pages/Instructor/InstructorLessonProgressHome";
import StudentList from "../pages/LessonProgress/StudentList";

// src/routes/AppRoutes.js
import BookingDashboard from "../pages/Booking/BookingDashboard";
import AddBookingPage from "../pages/Booking/AddBookingPage";
import BookingDetails from "../pages/Booking/BookingDetails";



export default function AppRoutes() {
  return (


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
     

      {/* Vehicles */}
      <Route path="/vehicles" element={<VehicleList />} />
      <Route path="/vehicles/add" element={<AddVehicle />} />
      <Route path="/vehicles/:id" element={<VehicleDetails />} />
      <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
      <Route path="/dashboard" element={<VehicleDashboard />} />

           {/* Booking Routes */}
        <Route path="/bookings" element={<BookingDashboard />} />
        <Route path="/bookings/add" element={<AddBookingPage />} />
        <Route path="/bookings/:id" element={<BookingDetails />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/payments" replace />} />
      <Route path="*" element={<Navigate to="/payments" replace />} />
    </Routes>



  );
}
