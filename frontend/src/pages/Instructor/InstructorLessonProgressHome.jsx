// src/pages/Instructor/InstructorLessonProgressHome.jsx
import React from "react";
import { Link } from "react-router-dom";
import ProgressHero from "../../components/ProgressHero";
import {
  BookOpen,
  Plus,
  Users,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Calendar,
  User,
} from "lucide-react";

export default function InstructorLessonProgressHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressHero
        title="Instructor Dashboard"
        subtitle="Manage lessons, students, bookings, and your profile with a modern dashboard."
      />

      {/* Navigation Cards Section */}
      <div className="px-6 -mt-6 relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        <NavCard
          title="Lesson Dashboard"
          description="Overview of all lessons and stats"
          icon={<BookOpen className="w-8 h-8" />}
          gradient="from-blue-500 to-blue-600"
          to="/instructor/lesson-progress"
        />
        <NavCard
          title="Add Lesson"
          description="Record new lesson progress for students"
          icon={<ClipboardList className="w-8 h-8" />}
          gradient="from-orange-500 to-red-500"
          to="/instructor/lesson-entry"
        />
        <NavCard
          title="Student Lessons"
          description="Manage lessons for each student individually"
          icon={<Users className="w-8 h-8" />}
          gradient="from-green-500 to-emerald-600"
          to="/instructor/lesson-progress/students"
        />
        <NavCard
          title="Progress Tracking"
          description="Monitor course completion & issue certificates"
          icon={<TrendingUp className="w-8 h-8" />}
          gradient="from-purple-500 to-indigo-600"
          to="/instructor/progress-tracking"
        />
        <NavCard
          title="Bookings"
          description="View and manage your schedule"
          icon={<Calendar className="w-8 h-8" />}
          gradient="from-pink-500 to-rose-600"
          to="/instructor/booking"
        />
        <NavCard
          title="My Profile"
          description="View and edit your instructor details"
          icon={<User className="w-8 h-8" />}
          gradient="from-gray-700 to-gray-900"
          to="/instructor/profile"
        />
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-8 border-t">
        <p>DriveSchool Instructor Panel</p>
      </div>
    </div>
  );
}

/* --- Styled Subcomponents --- */
function NavItem({ to, icon, children, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
        active
          ? "bg-orange-50 text-orange-600 border border-orange-200"
          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function NavCard({ title, description, icon, gradient, to }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-4 rounded-xl bg-gradient-to-r ${gradient} text-white`}>
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
      <Link
        to={to}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition shadow-md"
      >
        Go
      </Link>
    </div>
  );
}
