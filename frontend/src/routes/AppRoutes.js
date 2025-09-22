// src/routes/AppRoutes.js
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentProgressPage from "../pages/Student/StudentProgressPage.jsx";
import InstructorDashboard from "../pages/Instructor/InstructorDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import InstructorRoutes from "./instructorRoutes";
import InstructorLessonEntryPage from "../pages/Instructor/InstructorLessonEntryPage";
import PaymentDashboard from '../pages/Payments/PaymentDashboard';
import PaymentForm from '../pages/Payments/PaymentForm';
import PaymentHistory from '../pages/Payments/PaymentHistory';
import ProgressTrackingDashboard from "../pages/ProgressTracking/ProgressTrackingDashboard";
import LessonProgressList from "../pages/LessonProgress/LessonProgressList";
import StudentLessons from "../pages/LessonProgress/StudentLessons";
import LessonProgressDashboard from "../pages/LessonProgress/LessonProgressDashboard";







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
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/progress-tracking" element={<ProgressTrackingDashboard />} />
        <Route path="/lesson-progress/all" element={<LessonProgressList />} />
        <Route path="/lesson-progress/students" element={<StudentLessons />} />
        <Route path="/lesson-progress" element={<LessonProgressDashboard />} />
        <Route path="/lesson-progress/students/:studentId" element={<StudentLessons />} />
          
           {/* Instructors */}
        <Route path="/instructor/lesson-entry" element={<InstructorLessonEntryPage />} />


         {/* Default route redirects to payment dashboard */}
        <Route path="/" element={<Navigate to="/payments" replace />} />
        
        {/* Payment Routes */}
        <Route path="/payments" element={<PaymentDashboard />} />
        <Route path="/payments/form" element={<PaymentForm />} />
        <Route path="/payments/history" element={<PaymentHistory />} />
        
        {/* Catch all route - redirect to payments */}
        <Route path="*" element={<Navigate to="/payments" replace />} />

      </Routes>
    </BrowserRouter>

  );
}
