// src/layouts/StudentLayout.jsx
import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Car,
  CreditCard,
  User,
  LogOut,
  LayoutDashboardIcon,
} from "lucide-react";

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const studentId = localStorage.getItem("rg_id");

  const navItems = [
    { to: `/student`, label: "Dashboard", icon: <LayoutDashboardIcon size={18} /> },
    { to: `/student/progress`, label: "Progress", icon: <BookOpen size={18} /> },
    { to: "/student/bookings", label: "Bookings", icon: <Calendar size={18} /> },
    { to: "/StuVehicle", label: "Vehicles", icon: <Car size={18} /> },
    { to: "/payments", label: "Payments", icon: <CreditCard size={18} /> },
    { to: `/student/${studentId}/dashboard`, label: "Profile", icon: <User size={18} /> },
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
    <div className="flex">
      {/* Sidebar - Fixed Height */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        {/* Branding */}
        <div className="px-6 py-4 font-bold text-lg border-b flex items-center gap-2">
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
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
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
      <main className="flex-1 ml-64 p-6 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
}
