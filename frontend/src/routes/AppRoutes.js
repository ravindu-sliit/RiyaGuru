// src/routes/AppRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";

// Core pages
import DriveManagerLanding from "../pages/DriveManagerLanding";
import LoginPage from "../pages/Auth/LoginPage";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import StudentHome from "../pages/Home/StudentHome";
import InstructorHome from "../pages/Home/InstructorHome";
import AdminHome from "../pages/Home/AdminHome";


import AdminViewStudents from "../pages/Admin/AdminViewStudents"; //View All Students



// Maintenance
import MaintenanceDashboard from "../pages/Maintenance/MaintenanceDashboard";

// Student
import StudentRoutes from "./studentRoutes"; 

// Student Registration
import RegisterStudent from "../pages/Registration/RegisterStudent";
import OtpRequest from "../pages/Registration/OtpRequest";


// Inquiry
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

// Booking
import BookingDashboard from "../pages/Booking/BookingDashboard";
import AddBookingPage from "../pages/Booking/AddBookingPage";
import BookingDetails from "../pages/Booking/BookingDetails";
import BookingEditPage from "../pages/Booking/BookingEditPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/landing" element={<DriveManagerLanding />} />
      <Route path="/home/student" element={<StudentHome />} /> 
      <Route path="/home/instructor" element={<InstructorHome />} />
      <Route path="/home/admin" element={<AdminHome />} />

      {/* Students (all under sidebar layout) */}
      <Route path="/student/*" element={<StudentRoutes />} />

      {/* Admin */}
      <Route path="/admin/*" element={<AdminDashboard />} />

      {/* Register & OTP */}
      <Route path="/register" element={<RegisterStudent />} />
      <Route path="/otp-request" element={<OtpRequest />} />



      <Route path="/admin/students" element={<AdminViewStudents />} /> 

      {/* Inquiry (⭐ added before catch-all) */}
      <Route path="/inquiries" element={<InquiryDashboard />} />
      <Route path="/inquiry" element={<StudentInquiry />} />


      {/* Instructors */}
      <Route path="/instructor/*" element={<InstructorRoutes />} />

      {/* Vehicles */}
      <Route path="/vehicles" element={<VehicleList />} />
      <Route path="/vehicles/add" element={<AddVehicle />} />
      <Route path="/vehicles/:id" element={<VehicleDetails />} />
      <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
      <Route path="/dashboard" element={<VehicleDashboard />} />

      {/* Booking */}
      <Route path="/bookings" element={<BookingDashboard />} />
      <Route path="/bookings/add" element={<AddBookingPage />} />
      <Route path="/bookings/:id" element={<BookingDetails />} />
      <Route path="/bookings/:id/edit" element={<BookingEditPage />} />

      {/* Maintenance */}
      <Route path="/maintenance" element={<MaintenanceDashboard />} />

      {/* Default redirect */}
      <Route path="/" element={<DriveManagerLanding />} />
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
