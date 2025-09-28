// src/routes/adminRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminSection from "../components/admin/AdminSection";
import { CreditCard, FileText, Car } from "lucide-react";

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

        {/* Payments - with route-level header */}
        <Route
          element={
            <AdminSection
              title="Payment Management"
              subtitle="Review and manage all student payments"
              icon={<CreditCard className="w-6 h-6 text-white" />}
            />
          }
        >
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        {/* Installments - with route-level header */}
        <Route
          element={
            <AdminSection
              title="Installment Management"
              subtitle="Review and manage students' installment plans"
              icon={<FileText className="w-6 h-6 text-white" />}
            />
          }
        >
          <Route path="installments" element={<AdminInstallments />} />
        </Route>

        {/* Vehicles - with route-level header */}
        <Route
          element={
            <AdminSection
              title="Vehicle Management"
              subtitle="Manage your fleet and availability"
              icon={<Car className="w-6 h-6 text-white" />}
            />
          }
        >
          <Route path="vehicles" element={<VehicleList />} />
        </Route>

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
