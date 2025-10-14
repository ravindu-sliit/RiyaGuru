// src/routes/studentRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import StudentLayout from "../layouts/StudentLayout";
import StudentHome from "../pages/Home/StudentHome";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentDocUpload from "../pages/Student/StudentDocUpload";

import StudentPreferences from "../pages/Student/StudentPreferences";
import StudentProgressPage from "../pages/Student/StudentProgressPage";
import BookingDetails from "../pages/Booking/BookingDetails";
import AddBookingPage from "../pages/Booking/AddBookingPage";

import StudentPasswordChange from "../pages/Student/StudentPasswordChange";

import MyEnrollments from "../pages/Enrollment/MyEnrollments";
import PaymentsHub from "../pages/Payment/PaymentsHub";
import EnrollmentDetails from "../pages/Enrollment/EnrollmentDetails";
import Studentvehicle from "../pages/Vehicle/Studentvehicle.jsx";
import StudentInstructors from "../pages/Instructor/StudentInstructors";
import StudentInquiry from "../pages/Inquiry/StudentInquiry";
import CreatePayment from "../pages/Payment/CreatePayment.jsx";


export default function StudentRoutes() {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<StudentHome />} />

        <Route path=":id/dashboard" element={<StudentDashboard />} />

        <Route path="progress" element={<StudentProgressPage />} />

        <Route path=":id/docs/upload" element={<StudentDocUpload />} />

        <Route path="/studVehicle" element={<Studentvehicle />} />

           <Route path="/student-instructors" element={<StudentInstructors />} />

        <Route path=":id/preferences" element={<StudentPreferences />} />

        <Route path=":id/password" element={<StudentPasswordChange />} />

        <Route path="bookings" element={<BookingDetails />} />
        <Route path="Addbookings" element={<AddBookingPage />} />

        <Route path="my-enrollments" element={<MyEnrollments />} />
        <Route path="my-payments" element={<PaymentsHub />} />
        <Route path="enrollments/:id" element={<EnrollmentDetails />} />
        <Route path="create-payment" element={<CreatePayment />} />

        <Route path="inquiry" element={<StudentInquiry />} />

        <Route path="*" element={<Navigate to="/student" replace />} />
        
      </Route>
    </Routes>
  );
}
