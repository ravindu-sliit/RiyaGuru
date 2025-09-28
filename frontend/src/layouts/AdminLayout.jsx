// src/layouts/AdminLayout.jsx
import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Users, Car, ClipboardList, CreditCard, Layers, BookOpen, LogOut, Calendar } from "lucide-react";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const nav = [
    { to: "/admin", label: "Dashboard", icon: <BookOpen size={18} /> },
    { to: "/admin/students", label: "Students", icon: <Users size={18} /> },
    { to: "/admin/vehicles", label: "Vehicles", icon: <Car size={18} /> },
    { to: "/admin/instructors/list", label: "Instructors", icon: <ClipboardList size={18} /> },
    { to: "/admin/payments", label: "Payments", icon: <CreditCard size={18} /> },
    { to: "/admin/bookings", label: "Bookings", icon: <Calendar size={18} /> },
    { to: "/admin/installments", label: "Installments", icon: <Layers size={18} /> },
  ];

  const handleSignOut = () => {
    if (!window.confirm("Sign out from admin?")) return;
    localStorage.removeItem("rg_token");
    localStorage.removeItem("rg_userId");
    localStorage.removeItem("rg_role");
    localStorage.removeItem("rg_id");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="px-6 py-4 font-bold text-lg border-b">RiyaGuru.lk Admin</div>
        <nav className="flex flex-col p-4 space-y-2 flex-grow">
          {nav.map((item) => (
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

      {/* Main content */}
      <main className="flex-1 p-6">
        {children ? children : <Outlet />}
      </main>
    </div>
  );
}
