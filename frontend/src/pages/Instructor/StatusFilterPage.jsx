// src/pages/Instructor/StatusFilterPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";

export default function StatusFilterPage() {
  const [status, setStatus] = useState("Active");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await InstructorAPI.byStatus(status);
      setRows(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [status]);

  const getSpecializationIcon = (spec) => {
    const icons = {
      Car: "",
      Motorcycle: "",
      Threewheeler: "",
      HeavyVehicle: "",
      All: "",
    };
    return icons[spec] || "";
  };

  const getStatusStats = () => {
    const activeCount = rows.filter((r) => r.status === "Active").length;
    const inactiveCount = rows.filter((r) => r.status !== "Active").length;
    return { activeCount, inactiveCount, total: rows.length };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl text-gray-800">
          <span className="text-orange-500 text-2xl"></span>
          Instructor Management
        </div>
        <div className="flex items-center gap-6">
    
          <Link
            to="/admin/Instructordashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-orange-500 bg-orange-50 font-medium"
          >
             Instructor DashBoard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Filter by Status
            </h1>
            <p className="text-slate-600 text-lg">
              View instructors by their current status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/Instructordashboard"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-slate-700 px-6 py-3 rounded-lg font-medium border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
            >
              ← Back to All Instructors
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 text-lg">🔍</span>
                <label className="text-sm font-medium text-slate-700">
                  Filter by Status:
                </label>
              </div>
              <div className="relative">
                <select
                  className="pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 focus:outline-none transition-all appearance-none cursor-pointer min-w-[150px]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Not-Active"> Not-Active</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400">▼</span>
                </div>
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg font-medium transition-all shadow-sm disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>Refresh</>
              )}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-800 mb-1">
                  {rows.length}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {status === "Active"
                    ? "Active Instructors"
                    : "Inactive Instructors"}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stats.activeCount}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  Total Active
                </div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600 mb-1">
                  {stats.inactiveCount}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  Total Inactive
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-medium">
                Loading instructors...
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Please wait while we fetch the data
              </p>
            </div>
          </div>
        ) : rows.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Results Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500 text-lg"></span>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {status} Instructors ({rows.length})
                  </h3>
                </div>
                <div className="text-sm text-slate-600">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Instructor List */}
            <div className="divide-y divide-slate-100">
              {rows.map((r) => (
                <div
                  key={r.instructorId}
                  className="p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    {/* Info */}
                    <div className="flex items-center gap-4 flex-1">
  {/* Instructor Photo */}
  <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
    {r.image ? (
      <img
        src={`${process.env.REACT_APP_API_URL.replace("/api", "")}${r.image}`}
        alt={r.name}
        className="w-full h-full object-cover"
        onError={(e) => (e.currentTarget.src = "/avatar.png")}
      />
    ) : (
      r.name?.charAt(0)?.toUpperCase() || "?"
    )}
  </div>

  {/* Instructor Details */}
  <div className="flex-1">
    <div className="flex items-center gap-3 mb-1">
      <h4 className="text-lg font-semibold text-slate-800">{r.name}</h4>
      <span className="font-mono text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
        {r.instructorId}
      </span>
    </div>
    <div className="flex items-center gap-4 text-sm text-slate-600">
      <div className="flex items-center gap-1">
        <span>{getSpecializationIcon(r.specialization)}</span>
        <span>{r.specialization}</span>
      </div>
      {r.email && (
        <div className="flex items-center gap-1">
          <span>{r.email}</span>
        </div>
      )}
      {r.phone && (
        <div className="flex items-center gap-1">
          <span>{r.phone}</span>
        </div>
      )}
    </div>
  </div>
</div>


                    {/* Status */}
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full ${
                          r.status === "Active"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {r.status}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
              
                        <Link
                          to={`/admin/instructors/${r._id || r.id}/edit`}
                          className="px-3 py-2 text-xs font-medium bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {status === "Active" ? "" : ""}
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No {status.toLowerCase()} instructors found
              </h3>
              <p className="text-slate-500 mb-6">
                There are currently no instructors with "{status}" status.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={load}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                >
                   Refresh Data
                </button>
                <Link
                  to="/instructors/add"
                  className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-gray-50 font-medium"
                >
                  + Add New Instructor
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {!loading && rows.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-orange-500 text-lg"></span>
              <h3 className="text-lg font-semibold text-slate-800">Summary</h3>
            </div>
            <div className="text-center">
              <p className="text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {rows.length}
                </span>{" "}
                instructors with{" "}
                <span className="font-semibold text-slate-800">
                  "{status}"
                </span>{" "}
                status
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Use the filter above to switch between Active and Inactive
                instructors
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
