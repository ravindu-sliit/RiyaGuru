// src/routes/AppRoutes.js
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";

// Core pages
import DriveManagerLanding from "../pages/DriveManagerLanding";
import LoginPage from "../pages/Auth/LoginPage";
// Admin (nested in AdminRoutes)
import StudentHome from "../pages/Home/StudentHome";
import InstructorHome from "../pages/Home/InstructorHome";
import AdminHome from "../pages/Home/AdminHome";

// Admin student pages are nested under AdminRoutes now
// Maintenance
import MaintenanceDashboard from "../pages/Maintenance/MaintenanceDashboard";

// Student

import StudentRoutes from "./studentRoutes";
//import StudentPasswordChange from "../pages/Student/StudentPasswordChange";
import StudentDetailsEdit from "../pages/Student/StudentDetailsEdit";


import AdminRoutes from "./adminRoutes";


// Student Registration
import RegisterStudent from "../pages/Registration/RegisterStudent";
import OtpRequest from "../pages/Registration/OtpRequest";


// Inquiry
import InquiryDashboard from "../pages/Inquiry/InquiryDashboard";
import StudentInquiry from "../pages/Inquiry/StudentInquiry";

// Instructor
import InstructorRoutes from "./instructorRoutes";
import InstructorPage from "../pages/Instructor/InstructorPage";
import InstructorListPage from "../pages/Instructor/InstructorListPage";
import InstructorDetailsPage from "../pages/Instructor/InstructorDetailsPage";
import AddInstructorPage from "../pages/Instructor/AddInstructorPage";
import EditInstructorPage from "../pages/Instructor/EditInstructorPage";
import AvailabilityPage from "../pages/Instructor/AvailabilityPage";
import StatusFilterPage from "../pages/Instructor/StatusFilterPage";


// Vehicles
import AddVehicle from "../pages/Vehicle/AddVehicle";
import EditVehicle from "../pages/Vehicle/EditVehicle";
import VehicleDetails from "../pages/Vehicle/VehicleDetails";
import VehicleDashboard from "../pages/Vehicle/VehicleDashboard";

// Booking
import BookingDetails from "../pages/Booking/BookingDetails";
import BookingEditPage from "../pages/Booking/BookingEditPage";
//Payments
import MakePayment from "../pages/Payment/MakePayment.jsx";
import PaymentList from "../pages/Payment/PaymentList.jsx";
import CreatePayment from "../pages/Payment/CreatePayment.jsx";





export default function AppRoutes() {
  const EnrollRedirect = () => {
    const { id } = useParams();
    const location = useLocation();
    const search = location?.search || "";
    return <Navigate to={`/student/enrollments/${encodeURIComponent(id)}${search}`} replace />;
  };
  return (
    <Routes>


       {/* Student Routes*/}
      <Route path="/student/*" element={<StudentRoutes />} />


       {/* Instructor CRUD */}
      <Route path="instructors/list" element={<InstructorListPage />} />
      <Route path="instructors/:id" element={<InstructorDetailsPage />} />
      <Route path="instructors/add" element={<AddInstructorPage />} />
      <Route path="instructors/:id/edit" element={<EditInstructorPage />} />
      <Route path="instructors/availability" element={<AvailabilityPage />} />
      <Route path="instructors/status" element={<StatusFilterPage />} />

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/landing" element={<DriveManagerLanding />} />
      <Route path="/home/student" element={<StudentHome />} /> 
      <Route path="/home/instructor" element={<InstructorHome />} />
      <Route path="/home/admin" element={<AdminHome />} />

      {/* Students (all under sidebar layout) */}
      <Route path="/student/*" element={<StudentRoutes />} />


      <Route path="/student/:id/edit" element={<StudentDetailsEdit />} />

      {/* Admin */}
      {/*
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/admin/students" element={<AdminViewStudents />} />
      */}

      {/* Admin (nested under AdminLayout with sidebar) */}
      <Route path="/admin/*" element={<AdminRoutes />} />


      {/* Register & OTP */}
      <Route path="/register" element={<RegisterStudent />} />
      <Route path="/otp-request" element={<OtpRequest />} />


      {/* Inquiry (⭐ added before catch-all) */}
      <Route path="/inquiries" element={<InquiryDashboard />} />
      <Route path="/inquiry" element={<StudentInquiry />} />

      {/* Instructors */}
      <Route path="/instructor/*" element={<InstructorRoutes />} />
      <Route path="Instructordashboard" element={<InstructorPage />} />

      {/* Vehicles (redirect to admin nested for sidebar) */}
      <Route path="/vehicles" element={<Navigate to="/admin/vehicles" replace />} />
      <Route path="/vehicles/add" element={<AddVehicle />} />
      <Route path="/vehicles/:id" element={<VehicleDetails />} />
      <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
      <Route path="/dashboard" element={<VehicleDashboard />} />

      {/* Booking (redirect to admin nested for sidebar) */}
      <Route path="/bookings" element={<Navigate to="/admin/bookings" replace />} />
      <Route path="/bookings/:id" element={<BookingDetails />} />
      <Route path="/bookings/:id/edit" element={<BookingEditPage />} />


       {/* Payments */}
      <Route path="/make-payment" element={<MakePayment />} />
      <Route path="/payment-list" element={<PaymentList />} />
      <Route path="/create-payment" element={<CreatePayment />} />
      {/* Redirect student payment/enrollment pages to nested routes so sidebar shows */}
      <Route path="/my-enrollments" element={<Navigate to="/student/my-enrollments" replace />} />
      <Route path="/enrollments/:id" element={<EnrollRedirect />} />
      <Route path="/my-payments" element={<Navigate to="/student/my-payments" replace />} />
      <Route path="/payments" element={<Navigate to="/student/my-payments" replace />} />
      <Route path="/my-installments" element={<Navigate to="/student/my-payments?tab=installment" replace />} />
      {/* Redirect admin payment pages to admin nested paths for sidebar */}
      <Route path="/admin-installments" element={<Navigate to="/admin/installments" replace />} />
      <Route path="/admin-payments" element={<Navigate to="/admin/payments" replace />} />

      {/* Redirect instructors list to admin nested for sidebar */}
      <Route path="/instructors/list" element={<Navigate to="/admin/instructors/list" replace />} />

 
      {/* Maintenance */}
      <Route path="/maintenance" element={<MaintenanceDashboard />} />
      <Route path="/" element={<DriveManagerLanding />} />
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
