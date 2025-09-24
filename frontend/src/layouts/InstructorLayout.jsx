// src/layouts/InstructorLayout.jsx
import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  TrendingUp,
  ClipboardList,
  Calendar,
  User,
  LogOut,
} from "lucide-react";

export default function InstructorLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: "/instructor", label: "Dashboard", icon: <BookOpen size={18} /> },
    { to: "/instructor/lesson-progress", label: "Lesson Dashboard", icon: <BookOpen size={18} /> },
    { to: "/instructor/lesson-progress/students", label: "Students", icon: <Users size={18} /> },
    { to: "/instructor/lesson-entry", label: "Add Lesson", icon: <ClipboardList size={18} /> },
    { to: "/instructor/progress-tracking", label: "Progress", icon: <TrendingUp size={18} /> },
    { to: "/bookings", label: "Bookings", icon: <Calendar size={18} /> }, // stays global
    { to: "/instructor/profile", label: "My Profile", icon: <User size={18} /> },
  ];

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("rg_token");
      localStorage.removeItem("rg_userId");
      localStorage.removeItem("rg_role");
      localStorage.removeItem("rg_id");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar (fixed) */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        {/* Branding */}
        <div className="px-6 py-4 font-bold text-lg border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          Riya<span className="text-orange-500">Guru</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-2 flex-grow overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                location.pathname === item.to
                  ? "bg-orange-50 text-orange-600 border border-orange-200"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
