// src/routes/AppRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";

// Core pages
import DriveManagerLanding from "../pages/DriveManagerLanding";
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
//import Home from "../pages/Home/Home";
import StudentHome from "../pages/Home/StudentHome";
import InstructorHome from "../pages/Home/InstructorHome";
import AdminHome from "../pages/Home/AdminHome";

// Maintenance
import MaintenanceDashboard from "../pages/Maintenance/MaintenanceDashboard";

// Student
import StudentDocUpload from "../pages/Student/StudentDocUpload";
import RegisterStudent from "../pages/Registration/RegisterStudent";
import OtpRequest from "../pages/Registration/OtpRequest";
import StudentPasswordChange from "../pages/Student/StudentPasswordChange";
import StudentDetailsEdit from "../pages/Student/StudentDetailsEdit";
import StudentPreferences from "../pages/Student/StudentPreferences";
import StudentProgressPage from "../pages/Student/StudentProgressPage";

// Inquiry (⭐ added)
import InquiryDashboard from "../pages/Inquiry/InquiryDashboard";
import StudentInquiry from "../pages/Inquiry/StudentInquiry";

// Instructor
import InstructorRoutes from "./instructorRoutes";


// Vehicles
import VehicleList from "../pages/Vehicle/VehicleList";
import AddVehicle from "../pages/Vehicle/AddVehicle";
import EditVehicle from "../pages/Vehicle/EditVehicle";
import VehicleDetails from "../pages/Vehicle/VehicleDetails";
import VehicleDashboard from "../pages/Vehicle/VehicleDashboard";

// Lesson Progress
// import ProgressTrackingDashboard from "../pages/ProgressTracking/ProgressTrackingDashboard";
// import LessonProgressList from "../pages/LessonProgress/LessonProgressList";
// import StudentLessons from "../pages/LessonProgress/StudentLessons";
// import LessonProgressDashboard from "../pages/LessonProgress/LessonProgressDashboard";
// import StudentList from "../pages/LessonProgress/StudentList";

// Booking
import BookingDashboard from "../pages/Booking/BookingDashboard";
import AddBookingPage from "../pages/Booking/AddBookingPage";
import BookingDetails from "../pages/Booking/BookingDetails";
import BookingEditPage from "../pages/Booking/BookingEditPage";

// 🔒 Simple guard for Student-only routes
function RequireStudent({ children }) {
  const role = localStorage.getItem("rg_role");
  const token = localStorage.getItem("rg_token");
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "Student") return <Navigate to="/home" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/landing" element={<DriveManagerLanding />} />
      <Route path="/home/student" element={<StudentHome />} />
      <Route path="/home/instructor" element={<InstructorHome />} />
      <Route path="/home/admin" element={<AdminHome />} />

      {/* Dashboards */}
      <Route
        path="/student/:id/dashboard"
        element={
          <RequireStudent>
            <StudentDashboard />
          </RequireStudent>
        }
      />

      {/* Student Doc Upload */}
      <Route
        path="/student/:id/docs/upload"
        element={
          <RequireStudent>
            <StudentDocUpload />
          </RequireStudent>
        }
      />

      {/* Student Profile edit */}
      <Route
        path="/student/:id/edit"
        element={
          <RequireStudent>
            <StudentDetailsEdit />
          </RequireStudent>
        }
      />

      {/* Student Password Change */}
      <Route
        path="/student/:id/password"
        element={
          <RequireStudent>
            <StudentPasswordChange />
          </RequireStudent>
        }
      />

      {/* Student Preferences */}
      <Route
        path="/student/:id/preferences"
        element={
          <RequireStudent>
            <StudentPreferences />
          </RequireStudent>
        }
      />

      <Route path="/student/progress" element={<StudentProgressPage />} />

      {/* Admin */}
      <Route path="/admin/*" element={<AdminDashboard />} />

      {/* Register & OTP */}
      <Route path="/register" element={<RegisterStudent />} />
      <Route path="/otp-request" element={<OtpRequest />} />

      {/* Inquiry (⭐ added before catch-all) */}
      <Route path="/inquiries" element={<InquiryDashboard />} />
      <Route path="/inquiry" element={<StudentInquiry />} />

      {/* Instructors */}
      <Route path="/instructor/*" element={<InstructorRoutes />} />

       {/* ✅ Logged-in Instructor Profile (always “/instructor/profile”) */}
      <Route path="/instructor/profile" element={<Instructorprofile />} />

      {/* Progress tracking */}


      {/* Lesson progress */}


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
        <Route path="/bookings/:id/edit" element={<BookingEditPage />} />

        <Route path="/instructor/bookings" element={<InstructorBookings />} />

      
      
      <Route path="/bookings/:id" element={<BookingDetails />} />

      {/* Maintenance */}
      <Route path="/maintenance" element={<MaintenanceDashboard />} />


      {/* Default redirect */}
      <Route path="/" element={<DriveManagerLanding />} />
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
