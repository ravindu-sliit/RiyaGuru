// src/routes/adminRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

// Admin Pages
import AdminHome from "../pages/Home/AdminHome";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminViewStudents from "../pages/Admin/AdminViewStudents";

// Payment
import AdminPayments from "../pages/Payment/AdminPayments";
import AdminInstallments from "../pages/Payment/AdminInstallments";

// Vehicles
import VehicleList from "../pages/Vehicle/VehicleList";

// Instructors
import InstructorListPage from "../pages/Instructor/InstructorListPage";

// Bookings
import BookingDashboard from "../pages/Booking/BookingDashboard";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Dashboard (default) */}
        <Route index element={<AdminHome />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* Students */}
        <Route path="students" element={<AdminViewStudents />} />

        {/* Payments */}
        <Route path="payments" element={<AdminPayments />} />
        <Route path="installments" element={<AdminInstallments />} />

        {/* Vehicles */}
        <Route path="vehicles" element={<VehicleList />} />

        {/* Instructors */}
        <Route path="instructors/list" element={<InstructorListPage />} />

        {/* Bookings */}
        <Route path="bookings" element={<BookingDashboard />} />

        {/* Reports & Settings removed */}

        {/* Catch-all inside admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
