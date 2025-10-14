// src/layouts/InstructorLayout.jsx
import React, { useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  TrendingUp,
  ClipboardList,
  Calendar,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function InstructorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navItems = [
    { to: "/instructor", label: "Dashboard", icon: <BookOpen size={18} /> },
    { to: "/instructor/lesson-progress", label: "Lesson Dashboard", icon: <BookOpen size={18} /> },
    { to: "/instructor/lesson-progress/students", label: "Students", icon: <Users size={18} /> },
    { to: "/instructor/lesson-entry", label: "Add Lesson", icon: <ClipboardList size={18} /> },
    { to: "/instructor/progress-tracking", label: "Progress", icon: <TrendingUp size={18} /> },
    { to: "/instructor/booking", label: "Bookings", icon: <Calendar size={18} /> },
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
    <div
      className="flex"
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(10,26,47,0.55), rgba(10,26,47,0.55)), url(/images/hero/instructor-student.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Sidebar (fixed) */}
      <aside
        className="fixed top-0 left-0 h-screen w-64 flex flex-col"
        style={{
          backgroundColor: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRight: "none",
          borderColor: "transparent",
          boxShadow: "none",
          outline: "none",
          marginRight: "-1px",
        }}
      >
        {/* Branding */}
        <div className="h-16 px-6 flex items-center font-bold text-lg gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-800">
            Riya<span className="text-indigo-600">Guru.lk</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-2 flex-grow overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                location.pathname === item.to
                  ? "bg-white/30 text-orange-700 border border-white/40"
                  : "text-gray-700 hover:text-orange-600 hover:bg-white/20"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-white/40">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/30 hover:bg-white/40 text-red-700 font-medium transition"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Right side: scrollable content */}
      <div className="flex-1 ml-64 h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto p-6 student-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
