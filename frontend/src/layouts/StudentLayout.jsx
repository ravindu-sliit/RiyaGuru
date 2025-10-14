// src/layouts/StudentLayout.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Car,
  CreditCard,
  User,
  LogOut,
  LayoutDashboardIcon,
  Settings,
  HelpCircle,
  LockIcon,
  FileText,
  ChevronDown,
} from "lucide-react";
import { apiFetch } from "../services/api";
import "../styles/student-overlay.css";

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const studentId = localStorage.getItem("rg_id");

  // ---------- Header user state ----------
  const [firstName, setFirstName] = useState("Student");
  const [firstTwoNames, setFirstTwoNames] = useState("Student");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadMe() {
      try {
        if (!studentId) return;
        const data = await apiFetch(`/api/students/${studentId}`);
        const s = data?.student || {};
        const name = (s.full_name || "").trim();
        const parts = name.split(/\s+/).filter(Boolean);
        const first = parts[0] || "Student";
        const two = parts.slice(0, 2).join(" ") || first;

        if (isMounted) {
          setFirstName(first);
          setFirstTwoNames(two);
          setEmail(s.email || "");
          setAvatar(s.profilePicUrl || "");
        }
      } catch {
        /* ignore */
      }
    }
    loadMe();
    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const navItems = [
    { to: `/student`, label: "Dashboard", icon: <LayoutDashboardIcon size={18} /> },
    { to: `/student/progress`, label: "Progress", icon: <BookOpen size={18} /> },
    { to: "/student/bookings", label: "Bookings", icon: <Calendar size={18} /> },
    { to: "/student/my-enrollments", label: "Enrollments", icon: <User size={18} /> },
    { to: "/payments", label: "Payments", icon: <CreditCard size={18} /> },
    { to: `/student/${studentId}/docs/upload`, label: "Documents", icon: <FileText size={18} /> },
    { to: "/inquiry", label: "Inquiries", icon: <HelpCircle size={18} /> },
  ];

  // Derive a readable page title for the header based on the current route
  const pageTitle = (() => {
    const p = location.pathname || "";
    if (p === "/student") return "Dashboard";
    if (p.startsWith("/student/progress")) return "Progress";
    if (p.startsWith("/student/bookings")) return "Bookings";
    if (p.startsWith("/student/my-enrollments")) return "Enrollments";
    if (p === `/student/${studentId}/docs/upload`) return "Documents";
    if (p.startsWith("/payments")) return "Payments";
    if (p.startsWith("/inquiry")) return "Inquiries";
    // Fallback: last path segment, capitalized
    const parts = p.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    return last
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ") || "";
  })();

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("rg_token");
      localStorage.removeItem("rg_userId");
      localStorage.removeItem("rg_role");
      localStorage.removeItem("rg_id");
      navigate("/login", { replace: true });
    }
  };

  const goProfile = () => {
    setMenuOpen(false);
    navigate(`/student/${studentId}/dashboard`);
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
      {/* ----- Sidebar (fixed, full height) ----- */}
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
        {/* Branding (match header height) */}
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
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign Out removed as requested */}
      </aside>

      {/* ----- Right side: header + scrollable content ----- */}
      <div className="flex-1 ml-64 h-screen flex flex-col">
        {/* Top header — same height as sidebar brand */}
        <header
          className="h-16 flex items-center px-6 sticky top-0 z-20"
          style={{
            backgroundColor: "transparent",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            borderColor: "transparent",
          }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="min-w-0">
              <h1 className="text-white font-semibold text-lg truncate">{pageTitle}</h1>
            </div>
            <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-3 rounded-full px-3 py-1.5 transition border border-transparent bg-transparent"
              style={{ background: "transparent" }} // hard override against any global orange
            >
              {/* Avatar — force transparent background */}
              <img
                src={avatar || "https://via.placeholder.com/40x40.png?text=%F0%9F%91%A4"}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-gray-200 bg-transparent"
                style={{ background: "transparent" }}
                loading="lazy"
                decoding="async"
              />
              {/* One line, same weight */}
              <span className="text-sm font-medium text-gray-800">
                Hi there, {firstName}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                style={{ background: "white" }}
              >
                {/* Top user panel */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                  <img
                    src={avatar || "https://via.placeholder.com/48x48.png?text=%F0%9F%91%A4"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-transparent"
                    style={{ background: "transparent" }}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 truncate">
                      {firstTwoNames}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{email}</div>
                  </div>
                </div>

                {/* Actions — no default background, only hover */}
                <button
                  onClick={goProfile}
                  className="w-full text-left px-4 py-3 flex items-center gap-2 text-gray-700 bg-transparent hover:bg-gray-50"
                  style={{ background: "transparent" }}
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>

                <div className="h-px bg-gray-100" />

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 flex items-center gap-2 text-gray-700 bg-transparent hover:bg-gray-50 hover:text-red-600"
                  style={{ background: "transparent" }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6 student-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
