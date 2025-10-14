// src/pages/Instructor/InstructorPage.jsx

//sankalpa instructor landin dashBoard
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";
import { Calendar, ArrowLeft } from "lucide-react";


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
  const [updates, setUpdates] = useState([]);
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

        // Sort by updated date (assuming i.updatedAt exists)
        setUpdates(
          data
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5) // latest 5 updates
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const navigate = useNavigate();
  const topCards = useMemo(
    () => [
      {
        label: "Total Instructors",
        value: stats.total,
        gradient: "from-blue-500 to-blue-600",
      },
      {
        label: "Active",
        value: stats.active,
        gradient: "from-emerald-500 to-emerald-600",
      },
      {
        label: "Not-Active",
        value: stats.inactive,
        gradient: "from-amber-500 to-amber-600",
      },
    ],
    [stats]
  );

  const specializationCards = useMemo(
    () => [
      {
        label: "Car",
        value: stats.car,
        gradient: "from-orange-500 to-orange-600",
      },
      {
        label: "Motorcycle",
        value: stats.moto,
        gradient: "from-purple-500 to-purple-600",
      },
      {
        label: "Threewheeler",
        value: stats.three,
        gradient: "from-pink-500 to-pink-600",
      },
      {
        label: "Heavy Vehicle",
        value: stats.heavy,
        gradient: "from-red-500 to-red-600",
      },
      {
        label: "All (Multi-skill)",
        value: stats.all,
        gradient: "from-teal-500 to-teal-600",
      },
    ],
    [stats]
  );

  return (
    <div className="min-h-screen bg-slate-50">
    
       <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
          <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 🔙 Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Instructor Management</h1>
                <p className="text-orange-100">Monitor and manage all driving Instructor </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
            </div>
          </div>
        </div>
      </div>

      {/* Page Wrapper */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                Instructors Dashboard
              </h1>
              <p className="text-slate-600 text-lg">
                Manage and monitor instructor performance and availability
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/instructors/add"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md"
              >
                + Add Instructor
              </Link>
              <Link
                to="/admin/instructors/list"
                className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold border shadow-sm"
              >
                View List
              </Link>
              <Link
                to="/admin/instructors/availability"
                className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold border shadow-sm"
              >
                Availability
              </Link>
              <Link
                to="/admin/instructors/status"
                className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold border shadow-sm"
              >
                Filter Status
              </Link>
            </div>
          </div>
        </div>

        {/* Stats - Top Row: Total / Active / Not-Active */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border p-6 animate-pulse"
                >
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                  <div className="h-8 bg-slate-300 rounded w-1/2"></div>
                </div>
              ))
            : topCards.map((c, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-2xl shadow-sm border p-6 hover:shadow-lg transition-all relative overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                  ></div>
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>
                      {c.value}
                    </div>
                  </div>
                  <h3 className="text-slate-700 font-semibold relative z-10">{c.label}</h3>
                </div>
              ))}
        </div>

        {/* Specialization Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Specialization</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-sm border p-6 animate-pulse"
                  >
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="h-8 bg-slate-300 rounded w-1/2"></div>
                  </div>
                ))
              : specializationCards.map((c, i) => (
                  <div
                    key={i}
                    className="group bg-white rounded-2xl shadow-sm border p-6 hover:shadow-lg transition-all relative overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                    ></div>
                    <div className="flex items-center justify-between mb-2 relative z-10">
                      <div className={`text-3xl font-bold bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>
                        {c.value}
                      </div>
                    </div>
                    <h3 className="text-slate-700 font-semibold relative z-10">{c.label}</h3>
                  </div>
                ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Recent Updates
            </h2>
            <div className="space-y-4">
              {updates.map((ins, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 rounded-lg border hover:bg-slate-50"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">{ins.name}</h3>
                    <p className="text-sm text-slate-600">
                      {ins.specialization}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ins.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {ins.status}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {new Date(ins.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {updates.length === 0 && (
                <p className="text-slate-500">No recent updates</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <Link
                to="/instructors/reports"
                className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border hover:bg-blue-100 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Performance Reports
                  </h3>
                  <p className="text-sm text-slate-600">
                    View detailed analytics
                  </p>
                </div>
              </Link>
              <Link
                to="/instructors/training"
                className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border hover:bg-green-100 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Training Programs
                  </h3>
                  <p className="text-sm text-slate-600">Manage certifications</p>
                </div>
              </Link>
              <Link
                to="/instructors/settings"
                className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border hover:bg-purple-100 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Settings</h3>
                  <p className="text-sm text-slate-600">
                    Configure preferences
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
