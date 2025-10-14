// src/pages/Instructor/AvailabilityPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";

export default function AvailabilityPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = async () => {
    setLoading(true);
    try {
      const { data } = await InstructorAPI.availability({ date, time });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    query();
    // eslint-disable-next-line
  }, []);

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

  const getSpecializationColor = (spec) => {
    const colors = {
      Car: "bg-orange-50 text-orange-700 border-orange-200",
      Motorcycle: "bg-purple-50 text-purple-700 border-purple-200",
      Threewheeler: "bg-pink-50 text-pink-700 border-pink-200",
      HeavyVehicle: "bg-red-50 text-red-700 border-red-200",
      All: "bg-teal-50 text-teal-700 border-teal-200",
    };
    return colors[spec] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const clearFilters = () => {
    setDate("");
    setTime("");
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const setTodayDate = () => {
    setDate(getTodayDate());
  };

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
            Instructors DashBoard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Instructor Availability
            </h1>
            <p className="text-gray-800 text-lg font-medium">
              Find available instructors for specific dates and time slots
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/Instructordashboard"
              className="flex items-center gap-2 border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white/80 text-gray-800 px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Search Filters */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-orange-500 text-lg">🔍</span>
            <h2 className="text-xl font-semibold text-gray-900">
              Search Availability
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            {/* Date Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                 Select Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/40 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-300 focus:outline-none transition-all"
                />
                <button
                  onClick={setTodayDate}
                  className="px-4 py-3 border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white/80 text-gray-800 rounded-lg font-medium transition-all text-sm"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Time Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                 Time Range (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 09:00-17:00 or 14:30-16:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/40 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-300 focus:outline-none transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={query}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg font-medium transition-all shadow-sm disabled:cursor-not-allowed min-w-[120px] justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Checking...
                  </>
                ) : (
                  <>🔍 Search</>
                )}
              </button>

              <button
                onClick={clearFilters}
                className="px-4 py-3 border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white/80 text-gray-800 rounded-lg font-medium transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search Info */}
          {(date || time) && (
            <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <span>🔍</span>
                <span>
                  Searching for instructors
                  {date && (
                    <span className="font-medium">
                      {" "}
                      on {new Date(date).toLocaleDateString()}
                    </span>
                  )}
                  {time && (
                    <span className="font-semibold"> during {time}</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-16">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-white/50 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-800 font-medium">
                Searching for available instructors...
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Please wait while we check their schedules
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 text-lg"></span>
                <h3 className="text-xl font-bold text-gray-900">
                  Available Instructors ({rows.length})
                </h3>
              </div>
              {rows.length > 0 && (
                <div className="text-sm text-gray-800">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Results Grid */}
            {rows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rows.map((r) => (
                  <div
                    key={r.instructorId}
                    className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6 hover:shadow-md transition-all duration-200 group"
                  >
                    {/* Instructor Header */}
                    {/* Name + Photo */}
<div className="col-span-2 flex items-center gap-3">
  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-orange-500 text-white font-bold text-sm">
    {r.image ? (
      <img
        src={`${process.env.REACT_APP_API_URL.replace("/api", "")}${r.image}`}
        alt={r.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "/avatar.svg"; // fallback image
        }}
      />
    ) : (
      r.name?.charAt(0)?.toUpperCase() || "?"
    )}
  </div>

  <div>
    <div className="font-semibold text-gray-900">{r.name}</div>
  </div>
</div>


                    {/* Instructor Details */}
                    <div className="space-y-3 mb-4">
                      {/* Specialization */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-800 font-medium">
                          Specialization:
                        </span>
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getSpecializationColor(
                            r.specialization
                          )}`}
                        >
                          <span>{getSpecializationIcon(r.specialization)}</span>
                          <span>{r.specialization}</span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-800 font-medium">Phone:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {r.phone || "Not provided"}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-800 font-medium">Status:</span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            r.status === "Active"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {r.status}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-white/30">
                      <Link
                        to={``}
                        className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-white/40 bg-white/70 backdrop-blur-sm text-blue-700 hover:bg-white/80 transition-colors text-center"
                      >
                         View Profile
                      </Link>
                      <Link
                        to={``}
                        className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-white/40 bg-white/70 backdrop-blur-sm text-orange-700 hover:bg-white/80 transition-colors text-center"
                      >
                         Schedule
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-16">
                <div className="text-center">
                  <div className="text-6xl mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Available Instructors
                  </h3>
                  <p className="text-gray-700 mb-6">
                    {date || time
                      ? "No instructors are available for the selected date and time."
                      : "Search for instructors by selecting a date or time range above."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {(date || time) && (
                      <button
                        onClick={clearFilters}
                        className="px-6 py-3 rounded-lg border border-white/40 bg-white/70 backdrop-blur-sm text-gray-800 hover:bg-white/80 transition-colors font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                    <Link
                      to="/admin/instructors/add"
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                      + Add New Instructor
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

       
        
      </div>
    </div>
  );
}
