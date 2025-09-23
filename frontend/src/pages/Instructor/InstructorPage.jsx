// src/pages/Instructor/InstructorPage.jsx
// Instructor Dashboard Page
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";

export default function InstructorPage() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    car: 0,
    moto: 0,
    three: 0,
    heavy: 0,
    all: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await InstructorAPI.getAll();
        const total = data.length;
        const active = data.filter((i) => i.status === "Active").length;
        const inactive = total - active;
        const bySpec = (k) => data.filter((i) => i.specialization === k).length;
        setStats({
          total,
          active,
          inactive,
          car: bySpec("Car"),
          moto: bySpec("Motorcycle"),
          three: bySpec("Threewheeler"),
          heavy: bySpec("HeavyVehicle"),
          all: bySpec("All"),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = useMemo(
    () => [
      { label: "Total Instructors", value: stats.total, gradient: "from-blue-500 to-blue-600", bg: "bg-blue-50", icon: "👥" },
      { label: "Active", value: stats.active, gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", icon: "✅" },
      { label: "Not-Active", value: stats.inactive, gradient: "from-amber-500 to-amber-600", bg: "bg-amber-50", icon: "⏸️" },
      { label: "Car", value: stats.car, gradient: "from-orange-500 to-orange-600", bg: "bg-orange-50", icon: "🚗" },
      { label: "Motorcycle", value: stats.moto, gradient: "from-purple-500 to-purple-600", bg: "bg-purple-50", icon: "🏍️" },
      { label: "Threewheeler", value: stats.three, gradient: "from-pink-500 to-pink-600", bg: "bg-pink-50", icon: "🛺" },
      { label: "Heavy Vehicle", value: stats.heavy, gradient: "from-red-500 to-red-600", bg: "bg-red-50", icon: "🚛" },
      { label: "All (Multi-skill)", value: stats.all, gradient: "from-teal-500 to-teal-600", bg: "bg-teal-50", icon: "⭐" },
    ],
    [stats]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl text-gray-800">
          <span className="text-orange-500 text-2xl"></span>
          Instructor Dashboard
        </div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all font-medium">
            Vehicles Management
          </Link>
          <Link to="/instructors" className="flex items-center gap-2 px-4 py-2 rounded-lg text-orange-500 bg-orange-50 font-medium">
            Instructors Management
          </Link>
        </div>
      </nav>

      {/* Page Wrapper */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Instructors Dashboard</h1>
              <p className="text-slate-600 text-lg">Manage and monitor instructor performance and availability</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/instructors/add" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md">
                 Add Instructor
              </Link>
              <Link to="/instructors/list" className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 shadow-sm">
                 View List
              </Link>
              <Link to="/instructors/availability" className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 shadow-sm">
                Availability
              </Link>
              <Link to="/instructor/filter" className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 shadow-sm">
                 Filter Status
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-slate-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((c, i) => (
              <div key={i} className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`w-14 h-14 ${c.bg} rounded-xl flex items-center justify-center text-2xl`}>
                    {c.icon}
                  </div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>
                    {c.value}
                  </div>
                </div>
                <h3 className="text-slate-700 font-semibold relative z-10">{c.label}</h3>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-5 rounded-xl bg-blue-50 border border-blue-100">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">📊</div>
              <div>
                <h3 className="font-semibold text-slate-800">Performance Reports</h3>
                <p className="text-sm text-slate-600">View detailed analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 rounded-xl bg-green-50 border border-green-100">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">🎯</div>
              <div>
                <h3 className="font-semibold text-slate-800">Training Programs</h3>
                <p className="text-sm text-slate-600">Manage certifications</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 rounded-xl bg-purple-50 border border-purple-100">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">⚙️</div>
              <div>
                <h3 className="font-semibold text-slate-800">Settings</h3>
                <p className="text-sm text-slate-600">Configure preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
