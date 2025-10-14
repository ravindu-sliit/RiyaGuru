import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Plus, Users, TrendingUp, Calendar, User } from "lucide-react";

export default function InstructorNav() {
  const { pathname } = useLocation();

  const items = [
    { to: "/instructor/lesson-progress", label: "Dashboard", icon: <BookOpen size={16} /> },
    { to: "/instructor/lesson-entry", label: "Add Lesson", icon: <Plus size={16} /> },
    { to: "/instructor/lesson-progress/students", label: "Students", icon: <Users size={16} /> },
    { to: "/instructor/progress-tracking", label: "Progress", icon: <TrendingUp size={16} /> },
    { to: "/instructor/instructorbooking", label: "Bookings", icon: <Calendar size={16} /> },
    { to: "/instructor/profile", label: "Profile", icon: <User size={16} /> },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-100">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span>
            Riya<span className="text-orange-500">Guru</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {items.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  active
                    ? "bg-orange-50 text-orange-600 border border-orange-200"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                {it.icon}
                <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
