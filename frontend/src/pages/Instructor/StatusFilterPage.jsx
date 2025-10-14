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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm px-6 py-3 mb-6">
        <div className="flex items-center gap-3 font-bold text-xl text-gray-800">
          <span className="text-orange-500 text-2xl"></span>
          Instructor Management
        </div>
        <div className="flex items-center gap-6">
    
          <Link
            to="/admin/Instructordashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-orange-600 bg-white/70 backdrop-blur-sm border border-white/40 font-medium hover:bg-white/80"
          >
             Instructor DashBoard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Filter by Status
            </h1>
            <p className="text-gray-800 text-lg font-medium">
              View instructors by their current status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/Instructordashboard"
              className="flex items-center gap-2 border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white/80 text-gray-800 px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
            >
              ← Back to All Instructors
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 text-lg">🔍</span>
                <label className="text-sm font-semibold text-gray-900">
                  Filter by Status:
                </label>
              </div>
              <div className="relative">
                <select
                  className="pl-4 pr-10 py-3 bg-white/70 backdrop-blur-sm border border-white/40 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-300 focus:outline-none transition-all appearance-none cursor-pointer min-w-[150px]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Not-Active"> Not-Active</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">▼</span>
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
          <div className="mt-6 pt-6 border-t border-white/30">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg border border-white/40 bg-white/40">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {rows.length}
                </div>
                <div className="text-sm text-gray-800 font-medium">
                  {status === "Active"
                    ? "Active Instructors"
                    : "Inactive Instructors"}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg border border-white/40 bg-white/40">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stats.activeCount}
                </div>
                <div className="text-sm text-gray-800 font-medium">
                  Total Active
                </div>
              </div>
              <div className="text-center p-4 rounded-lg border border-white/40 bg-white/40">
                <div className="text-2xl font-bold text-amber-600 mb-1">
                  {stats.inactiveCount}
                </div>
                <div className="text-sm text-gray-800 font-medium">
                  Total Inactive
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-16">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-white/50 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-800 font-medium">
                Loading instructors...
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Please wait while we fetch the data
              </p>
            </div>
          </div>
        ) : rows.length > 0 ? (
          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm overflow-hidden">
            {/* Results Header */}
            <div className="border-b border-white/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500 text-lg"></span>
                  <h3 className="text-lg font-bold text-gray-900">
                    {status} Instructors ({rows.length})
                  </h3>
                </div>
                <div className="text-sm text-gray-800">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Instructor List */}
            <div className="divide-y divide-white/40">
              {rows.map((r) => (
                <div
                  key={r.instructorId}
                  className="p-6 hover:bg-white/60 transition-colors group"
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
        onError={(e) => (e.currentTarget.src = "/avatar.svg")}
      />
    ) : (
      r.name?.charAt(0)?.toUpperCase() || "?"
    )}
  </div>

  {/* Instructor Details */}
  <div className="flex-1">
    <div className="flex items-center gap-3 mb-1">
      <h4 className="text-lg font-semibold text-gray-900">{r.name}</h4>
      <span className="font-mono text-sm text-gray-800 border border-white/40 bg-white/70 backdrop-blur-sm px-2 py-1 rounded">
        {r.instructorId}
      </span>
    </div>
    <div className="flex items-center gap-4 text-sm text-gray-800">
      <div className="flex items-center gap-1">
        <span>{getSpecializationIcon(r.specialization)}</span>
        <span className="font-semibold">{r.specialization}</span>
      </div>
      {r.email && (
        <div className="flex items-center gap-1">
          <span className="font-medium">{r.email}</span>
        </div>
      )}
      {r.phone && (
        <div className="flex items-center gap-1">
          <span className="font-medium">{r.phone}</span>
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
                          className="px-3 py-2 text-xs font-medium rounded-lg border border-white/40 bg-white/70 backdrop-blur-sm text-gray-800 hover:bg-white/80"
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
          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-16">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {status === "Active" ? "" : ""}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {status.toLowerCase()} instructors found
              </h3>
              <p className="text-gray-700 mb-6">
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
                  className="px-6 py-3 rounded-lg border border-white/40 bg-white/70 backdrop-blur-sm text-gray-800 hover:bg-white/80 font-medium"
                >
                  + Add New Instructor
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {!loading && rows.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-orange-500 text-lg"></span>
              <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
            </div>
            <div className="text-center">
              <p className="text-gray-800">
                Showing 
                <span className="font-semibold text-gray-900">
                  {rows.length}
                </span>
                {" "}instructors with {" "}
                <span className="font-semibold text-gray-900">
                  "{status}"
                </span>
                {" "}status
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Use the filter above to switch between Active and Inactive instructors
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
