// src/routes/AppRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";

// Core pages
import DriveManagerLanding from "../pages/DriveManagerLanding";
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
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

// Instructor
import InstructorRoutes from "./instructorRoutes";
import StatusFilterPage from "../pages/Instructor/StatusFilterPage";
import InstructorLessonEntryPage from "../pages/Instructor/InstructorLessonEntryPage";
import InstructorLessonProgressHome from "../pages/Instructor/InstructorLessonProgressHome";
import InstructorBookings from "../pages/Instructor/InstructorBookings";




import Instructorprofile from "../pages/Instructor/InstructorProfile";

// Vehicles
import VehicleList from "../pages/Vehicle/VehicleList";
import AddVehicle from "../pages/Vehicle/AddVehicle";
import EditVehicle from "../pages/Vehicle/EditVehicle";
import VehicleDetails from "../pages/Vehicle/VehicleDetails";
import VehicleDashboard from "../pages/Vehicle/VehicleDashboard";

// Lesson Progress
import ProgressTrackingDashboard from "../pages/ProgressTracking/ProgressTrackingDashboard";
import LessonProgressList from "../pages/LessonProgress/LessonProgressList";
import StudentLessons from "../pages/LessonProgress/StudentLessons";
import LessonProgressDashboard from "../pages/LessonProgress/LessonProgressDashboard";
import StudentList from "../pages/LessonProgress/StudentList";

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
      <Route path="/login" element={<LoginPage />} />j
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
      <Route path="/instructor/*" element={<InstructorDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />

      <Route path="/register" element={<RegisterStudent />} />
      <Route path="/otp-request" element={<OtpRequest />} />

      {/* Instructors */}
      <Route path="/*" element={<InstructorRoutes />} />
      <Route path="/instructor/filter" element={<StatusFilterPage />} />
      <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
      <Route path="/instructor/lesson-entry" element={<InstructorLessonEntryPage />} />
      <Route path="/instructor/lesson-progress" element={<InstructorLessonProgressHome />} />

       {/* ✅ Logged-in Instructor Profile (always “/instructor/profile”) */}
      <Route path="/instructor/profile" element={<Instructorprofile />} />

      {/* Progress tracking */}
      <Route path="/progress-tracking" element={<ProgressTrackingDashboard />} />

      {/* Lesson progress */}
      <Route path="/lesson-progress" element={<LessonProgressDashboard />} />
      <Route path="/lesson-progress/all" element={<LessonProgressList />} />
      <Route path="/lesson-progress/students" element={<StudentList />} />
      <Route path="/lesson-progress/student/:studentId" element={<StudentLessons />} />

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
