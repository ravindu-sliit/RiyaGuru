// src/routes/AppRoutes.js
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";

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
import InstructorPage from "../pages/Instructor/InstructorPage";
import InstructorListPage from "../pages/Instructor/InstructorListPage";
import InstructorDetailsPage from "../pages/Instructor/InstructorDetailsPage";
import AddInstructorPage from "../pages/Instructor/AddInstructorPage";
import EditInstructorPage from "../pages/Instructor/EditInstructorPage";
import AvailabilityPage from "../pages/Instructor/AvailabilityPage";
import StatusFilterPage from "../pages/Instructor/StatusFilterPage";


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
//Payments
import MakePayment from "../pages/Payment/MakePayment.jsx";
import PaymentList from "../pages/Payment/PaymentList.jsx";
import CreatePayment from "../pages/Payment/CreatePayment.jsx";
import PaymentsHub from "../pages/Payment/PaymentsHub.jsx";
import MyInstallments from "../pages/Payment/MyInstallments.jsx";
import AdminInstallments from "../pages/Payment/AdminInstallments.jsx";
import AdminPayments from "../pages/Payment/AdminPayments.jsx";
import MyEnrollments from "../pages/Enrollment/MyEnrollments.jsx";
import EnrollmentDetails from "../pages/Enrollment/EnrollmentDetails.jsx";

import StudentPasswordChange from "../pages/Student/StudentPasswordChange";

export default function AppRoutes() {
  const EnrollRedirect = () => {
    const { id } = useParams();
    const location = useLocation();
    const search = location?.search || "";
    return <Navigate to={`/student/enrollments/${encodeURIComponent(id)}${search}`} replace />;
  };
  return (
    <Routes>


       {/* Student Password Change */}
        <Route path="/student/:id/password" element={<StudentPasswordChange />} />


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
       <Route path="Instructordashboard" element={<InstructorPage />} />

      {/* Vehicles */}
      <Route path="/vehicles" element={<VehicleList />} />
      <Route path="/vehicles/add" element={<AddVehicle />} />
      <Route path="/vehicles/:id" element={<VehicleDetails />} />
      <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
      <Route path="/dashboard" element={<VehicleDashboard />} />

      {/* Booking */}
      <Route path="/bookings" element={<BookingDashboard />} />
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
      <Route path="/admin-installments" element={<AdminInstallments />} />
      <Route path="/admin-payments" element={<AdminPayments />} />

 
      {/* Maintenance */}
      <Route path="/maintenance" element={<MaintenanceDashboard />} />
      <Route path="/" element={<DriveManagerLanding />} />
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
