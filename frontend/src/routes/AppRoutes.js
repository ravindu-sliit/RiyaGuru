// src/routes/AppRoutes.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentProgressPage from "../pages/Student/StudentProgressPage.jsx";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import InstructorRoutes from "./instructorRoutes";
import PaymentDashboard from "../pages/Payments/PaymentDashboard";
import PaymentForm from "../pages/Payments/PaymentForm";
import PaymentHistory from "../pages/Payments/PaymentHistory";
import StatusFilterPage from "../pages/Instructor/StatusFilterPage";


// ✅ Vehicle pages
import VehicleList from "../pages/Vehicle/VehicleList";
import AddVehicle from "../pages/Vehicle/AddVehicle";
import EditVehicle from "../pages/Vehicle/EditVehicle";
import VehicleDetails from "../pages/Vehicle/VehicleDetails";
import VehicleDashboard from "../pages/Vehicle/VehicleDashboard";

export default function AppRoutes() {
  return (
    
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboards */}
        <Route path="/student/*" element={<StudentDashboard />} />
        <Route path="/student/progress" element={<StudentProgressPage />} />
        <Route path="/instructor/*" element={<InstructorDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Instructors */}
        <Route path="/*" element={<InstructorRoutes />} />
        <Route path="/instructor/filter" element={<StatusFilterPage />} />

        {/* Payments */}
        <Route path="/payments" element={<PaymentDashboard />} />
        <Route path="/payments/form" element={<PaymentForm />} />
        <Route path="/payments/history" element={<PaymentHistory />} />

        {/* Vehicles */}
        <Route path="/vehicles" element={<VehicleList />} />
        <Route path="/vehicles/add" element={<AddVehicle />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
        <Route path="/dashboard" element={<VehicleDashboard />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/payments" replace />} />
        <Route path="*" element={<Navigate to="/payments" replace />} />
      </Routes>
    
  );
}
