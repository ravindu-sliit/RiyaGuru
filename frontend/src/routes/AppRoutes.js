// src/routes/AppRoutes.js
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentProgressPage from "../pages/Student/StudentProgressPage.jsx";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import InstructorRoutes from "./instructorRoutes";
<<<<<<< Updated upstream
import InstructorLessonEntryPage from "../pages/Instructor/InstructorLessonEntryPage";
// Import Payment Pages
import MyEnrollments from '../pages/Payments/MyEnrollments/MyEnrollments';
import PaymentForm from '../pages/Payments/PaymentForm/PaymentForm';
import InstallmentPlan from '../pages/Payments/InstallmentPlan/InstallmentPlan';
import PaymentHistory from '../pages/Payments/PaymentHistory/PaymentHistory';
import AdminPayments from '../pages/Payments/AdminPayments/AdminPayments';
import InstallmentManagement from '../pages/Payments/InstallmentManagement/InstallmentManagement';
=======


// ✅ Vehicle pages
import VehicleList from "../pages/Vehicle/VehicleList";
import AddVehicle from "../pages/Vehicle/AddVehicle";
import EditVehicle from "../pages/Vehicle/EditVehicle";
import VehicleDetails from "../pages/Vehicle/VehicleDetails";
import VehicleDashboard from "../pages/Vehicle/VehicleDashboard";

import InstructorLessonEntryPage from "../pages/Instructor/InstructorLessonEntryPage";
import ProgressTrackingDashboard from "../pages/ProgressTracking/ProgressTrackingDashboard";
import LessonProgressList from "../pages/LessonProgress/LessonProgressList";
import StudentLessons from "../pages/LessonProgress/StudentLessons";
import LessonProgressDashboard from "../pages/LessonProgress/LessonProgressDashboard";









>>>>>>> Stashed changes
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboards */}
        <Route path="/student/*" element={<StudentDashboard />} />
        <Route path="/student/progress" element={<StudentProgressPage />} />
        <Route path="/instructor/*" element={<InstructorDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
          
           {/* Instructors */}
        <Route path="/*" element={<InstructorRoutes />} />
        <Route path="/instructor/lesson-entry" element={<InstructorLessonEntryPage />} />
 
          {/* Student Payment Routes */}
      <Route path="/payments/enrollments" element={<MyEnrollments />} />
      <Route path="/payments/form/:enrollmentId" element={<PaymentForm />} />
      <Route path="/payments/installment/:enrollmentId" element={<InstallmentPlan />} />
      <Route path="/payments/history" element={<PaymentHistory />} />
      
      {/* Admin Routes */}
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin/installments" element={<InstallmentManagement />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/payments/enrollments" replace />} />

        

        {/* Vehicles */}
        <Route path="/vehicles" element={<VehicleList />} />
        <Route path="/vehicles/add" element={<AddVehicle />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
        <Route path="/dashboard" element={<VehicleDashboard />} />


  

>>>>>>> Stashed changes
       
      </Routes>
    </BrowserRouter>

  );
}
