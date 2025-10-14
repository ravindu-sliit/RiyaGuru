// src/pages/Instructor/InstructorDetailsPage.jsx
//profile sankalpa
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import InstructorAPI from "../../api/instructorApi";

export default function InstructorDetailsPage() {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await InstructorAPI.getById(id);
      setRec(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const printProfile = () => window.print();

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

  const getSpecializationBg = (spec) => {
    const backgrounds = {
      Car: "bg-orange-100 text-orange-700 border-orange-200",
      Motorcycle: "bg-purple-100 text-purple-700 border-purple-200",
      Threewheeler: "bg-pink-100 text-pink-700 border-pink-200",
      HeavyVehicle: "bg-red-100 text-red-700 border-red-200",
      All: "bg-teal-100 text-teal-700 border-teal-200",
    };
    return backgrounds[spec] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getRatingStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array(fullStars)
          .fill()
          .map((_, i) => (
            <StarIcon
              key={`full-${i}`}
              className="h-5 w-5 text-yellow-400"
            />
          ))}
        {hasHalfStar && (
          <StarIcon className="h-5 w-5 text-yellow-300 opacity-70" />
        )}
        {Array(emptyStars)
          .fill()
          .map((_, i) => (
            <StarIcon
              key={`empty-${i}`}
              className="h-5 w-5 text-gray-300"
            />
          ))}
        <span className="ml-2 text-sm text-slate-600 font-medium">
          {numRating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-16 text-center">
          <div className="w-12 h-12 border-4 border-white/50 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800">Loading instructor profile...</p>
        </div>
      </div>
    );

  if (!rec)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-16 text-center max-w-md">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Instructor Not Found</h2>
          <p className="text-gray-800 mb-6">The instructor you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/admin/instructors/list"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
          >
            ← Back to Instructors
          </Link>
        </div>
      </div>
    );

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const imageUrl = rec.image
    ? rec.image.startsWith("http")
      ? rec.image
      : `${API_URL}${rec.image}`
    : "/avatar.svg";

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm px-6 py-3 mb-6">
        <div className="flex items-center gap-3 font-bold text-xl text-gray-800">
          <span className="text-orange-500 text-2xl"></span>
          Instructor Management
        </div>
        <div className="flex items-center gap-6">
          
          <Link
            to="/admin/Instructordashboard"
            className="px-4 py-2 rounded-lg text-orange-600 bg-white/70 backdrop-blur-sm border border-white/40 font-medium hover:bg-white/80"
          >
             Instructors DashBoard
          </Link>
          
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Instructor Profile
            </h1>
            <p className="text-gray-800 text-lg font-medium">
              Complete instructor information and performance details
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/admin/instructors/${id}/edit`}
              className="border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white/80 text-gray-800 px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
            >
               Edit Profile
            </Link>
            <button
              onClick={printProfile}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
            >
               Print / Save PDF
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row">
            {/* Left */}
            <div className="lg:w-1/3 p-8 bg-white/40 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-white/30">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-48 h-48 rounded-full bg-orange-500 p-1 shadow-lg">
                   <img
                     src={`${process.env.REACT_APP_API_URL.replace("/api", "")}${rec.image}`}
                    alt={rec.name}
                    className="w-full h-full object-cover rounded-full border-4 border-white"
                    onError={(e) => (e.currentTarget.src = "/avatar.svg")}
                    />
                    
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <span
                      className={`px-4 py-2 text-sm font-medium rounded-full border-2 border-white shadow-sm ${
                        rec.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {rec.status === "Active" ? " Active" : "⏸ Inactive"}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {rec.name}
                </h2>
                <div className="bg-white/70 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-lg mb-4">
                  <span className="text-sm font-mono text-gray-800">
                    ID: {rec.instructorId || "N/A"}
                  </span>
                </div>

                <div>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm border ${getSpecializationBg(
                      rec.specialization
                    )}`}
                  >
                    <span className="text-lg">
                      {getSpecializationIcon(rec.specialization)}
                    </span>
                    <span>{rec.specialization}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex-1 p-8 space-y-8">
              {/* Contact */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                   Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-white/40">
                    <p className="text-xs text-gray-700 uppercase mb-1">
                      Email
                    </p>
                    <p className="text-gray-900 font-medium">{rec.email}</p>
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-white/40">
                    <p className="text-xs text-gray-700 uppercase mb-1">
                      Phone
                    </p>
                    <p className="text-gray-900 font-medium">{rec.phone}</p>
                  </div>
                  <div className="md:col-span-2 bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-white/40">
                    <p className="text-xs text-gray-700 uppercase mb-1">
                      Address
                    </p>
                    <p className="text-gray-900 font-medium">
                      {rec.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-white/40">
                    <p className="text-xs text-gray-700 uppercase mb-1">
                      License Number
                    </p>
                    <p className="text-gray-900 font-mono">
                      {rec.licenseNumber}
                    </p>
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-white/40">
                    <p className="text-xs text-gray-700 uppercase mb-1">
                      Experience
                    </p>
                    <p className="text-gray-900">
                      {rec.experienceYears} year(s)
                    </p>
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-white/40">
                    <p className="text-xs text-gray-700 uppercase mb-1">
                      Rating
                    </p>
                    {getRatingStars(rec.rating)}
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-white/40">
                    <p className="text-xs text-gray-700 uppercase mb-1">
                      Joined Date
                    </p>
                    <p className="text-gray-900">
                      {new Date(
                        rec.joinedDate || rec.createdAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Availability Schedule
                </h3>
                <div className="rounded-lg border border-white/40 bg-white/60 backdrop-blur-md p-6">
                  {rec.availability?.length ? (
                    <div className="space-y-4">
                      {rec.availability.map((a, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:justify-between p-4 rounded-lg border border-white/40 bg-white/70 backdrop-blur-sm shadow-sm"
                        >
                          <div className="font-semibold text-gray-900 mb-2 sm:mb-0">
                             {a.date}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(a.timeSlots || []).map((slot, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full border border-orange-200"
                              >
                                 {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-gray-800 font-medium mb-1">
                        No availability records found
                      </p>
                      <p className="text-sm text-gray-700">
                        Availability schedule will appear here once added
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            ⚡ Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to={`/admin/instructors/list`}
              className="p-4 rounded-lg border border-white/40 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all"
            >
              Manage Schedule
            </Link>
            <Link
              to={`/admin/instructors/list`}
              className="p-4 rounded-lg border border-white/40 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all"
            >
              View Performance
            </Link>
            <Link
              to="/admin/instructors/list"
              className="p-4 rounded-lg border border-white/40 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
