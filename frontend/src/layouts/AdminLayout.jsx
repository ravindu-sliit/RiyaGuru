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
    { to: "/admin/vehicledashboard", label: "Vehicles", icon: <Car size={18} /> },
    { to: "/admin/Instructordashboard", label: "Instructors", icon: <ClipboardList size={18} /> },
    { to: "/admin/payments", label: "Payments", icon: <CreditCard size={18} /> },
    { to: "/admin/bookings", label: "Bookings", icon: <Calendar size={18} /> },
    { to: "/admin/installments", label: "Installments", icon: <Layers size={18} /> },
    { to: "/admin/inquiries", label: "Inquiries", icon: <ClipboardList size={18} /> },
    { to: "/admin/maintenance", label: "Maintenance", icon: <Layers size={18} /> },
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
    <div
      className="flex min-h-screen"
      style={{
        backgroundImage:
          "linear-gradient(rgba(10,26,47,.55), rgba(10,26,47,.55)), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=60')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/30 bg-white/50 backdrop-blur-md shadow-sm flex flex-col">
        <div className="px-6 py-4 font-bold text-lg border-b border-white/30 text-gray-900">RiyaGuru.lk Admin</div>
        <nav className="flex flex-col p-4 space-y-2 flex-grow">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                location.pathname === item.to
                  ? "bg-white/60 text-indigo-700 border border-white/40 backdrop-blur-sm"
                  : "text-gray-700 hover:text-indigo-700 hover:bg-white/50 backdrop-blur-sm"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/30">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-white/50 transition-all font-medium backdrop-blur-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="rounded-2xl border border-white/30 bg-white/50 backdrop-blur-md shadow-sm p-6 min-h-[calc(100vh-48px)]">
          {children ? children : <Outlet />}
        </div>
      </main>
    </div>
  );
}
