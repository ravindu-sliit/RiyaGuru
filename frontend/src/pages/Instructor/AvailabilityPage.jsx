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
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl text-gray-800">
          <span className="text-orange-500 text-2xl"></span>
          Instructor Management
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all font-medium"
          >
             vehicle Management
          </Link>
          <Link
            to="/Instructordashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all font-medium"
          >
             Instructors Management
          </Link>
          <Link
            to="/instructors/availability"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-orange-500 bg-orange-50 font-medium"
          >
            Instructors Availability
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Instructor Availability
            </h1>
            <p className="text-slate-600 text-lg">
              Find available instructors for specific dates and time slots
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/Instructordashboard"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-slate-700 px-6 py-3 rounded-lg font-medium border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-orange-500 text-lg">🔍</span>
            <h2 className="text-xl font-semibold text-slate-800">
              Search Availability
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            {/* Date Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                 Select Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 focus:outline-none transition-all"
                />
                <button
                  onClick={setTodayDate}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all text-sm border border-slate-200"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Time Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                 Time Range (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 09:00-17:00 or 14:30-16:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 focus:outline-none transition-all"
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
                className="px-4 py-3 bg-white hover:bg-gray-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg font-medium transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search Info */}
          {(date || time) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
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
                    <span className="font-medium"> during {time}</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-medium">
                Searching for available instructors...
              </p>
              <p className="text-sm text-slate-500 mt-1">
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
                <h3 className="text-xl font-semibold text-slate-800">
                  Available Instructors ({rows.length})
                </h3>
              </div>
              {rows.length > 0 && (
                <div className="text-sm text-slate-600">
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
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200 group"
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
          e.currentTarget.src = "/avatar.png"; // fallback image
        }}
      />
    ) : (
      r.name?.charAt(0)?.toUpperCase() || "?"
    )}
  </div>

  <div>
    <div className="font-medium text-slate-800">{r.name}</div>
  </div>
</div>


                    {/* Instructor Details */}
                    <div className="space-y-3 mb-4">
                      {/* Specialization */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
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
                        <span className="text-sm text-slate-600">Phone:</span>
                        <span className="text-sm font-medium text-slate-800">
                          {r.phone || "Not provided"}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Status:</span>
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
                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                      <Link
                        to={`/instructors/${r._id || r.id}`}
                        className="flex-1 px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center"
                      >
                         View Profile
                      </Link>
                      <Link
                        to={`/instructors/${r._id || r.id}/schedule`}
                        className="flex-1 px-3 py-2 text-sm font-medium bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-center"
                      >
                         Schedule
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16">
                <div className="text-center">
                  <div className="text-6xl mb-4"></div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    No Available Instructors
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {date || time
                      ? "No instructors are available for the selected date and time."
                      : "Search for instructors by selecting a date or time range above."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {(date || time) && (
                      <button
                        onClick={clearFilters}
                        className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                    <Link
                      to="/instructors/add"
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
