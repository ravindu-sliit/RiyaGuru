// src/pages/Instructor/InstructorDetailsPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProgressHero from "../../components/ProgressHero";
import { StarIcon } from "@heroicons/react/24/solid";
import axios from "axios";

export default function InstructorDetailsPage() {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("rg_token");
      const { data } = await axios.get(
        "http://localhost:5000/api/instructors/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRec(data.instructor);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const printProfile = () => window.print();

  const getSpecializationIcon = (spec) => {
    const icons = {
      Car: "🚗",
      Motorcycle: "🏍️",
      Threewheeler: "🛺",
      HeavyVehicle: "🚚",
      All: "🎯",
    };
    return icons[spec] || "📘";
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
            <StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-400" />
          ))}
        {hasHalfStar && (
          <StarIcon className="h-5 w-5 text-yellow-300 opacity-70" />
        )}
        {Array(emptyStars)
          .fill()
          .map((_, i) => (
            <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
          ))}
        <span className="ml-2 text-sm text-slate-600 font-medium">
          {numRating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading instructor profile...</p>
        </div>
      </div>
    );

  if (!rec)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Instructor Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            Could not load your profile. Please log in again.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    );

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const defaultAvatar =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#e2e8f0"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
        </defs>
        <rect width="256" height="256" fill="url(#g)"/>
        <circle cx="128" cy="96" r="44" fill="#94a3b8"/>
        <path d="M32 224c12-40 52-64 96-64s84 24 96 64" fill="#94a3b8"/>
      </svg>`
    );

  const imageUrl = rec.image
    ? (rec.image.startsWith("http") ? rec.image : `${API_URL}${rec.image}`)
    : defaultAvatar;

  return (
    <div className="min-h-screen bg-transparent">
      <ProgressHero
        title="My Profile"
        subtitle="Complete instructor information and performance details"
      >
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/instructors/${rec.instructorId}/edit`}
            className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg"
          >
            Edit Profile
          </Link>
          <button
            onClick={printProfile}
            className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg"
          >
            Print / Save PDF
          </button>
        </div>
      </ProgressHero>

      <div className="max-w-6xl mx-auto px-8 -mt-6 relative z-10 pb-12">

        {/* Profile Card */}
        <div className="bg-white/40 backdrop-blur-md rounded-xl shadow-xl border border-white/30 overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row">
            {/* Left */}
            <div className="lg:w-1/3 p-8 bg-white/30 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-white/30">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-48 h-48 rounded-full bg-orange-500 p-1 shadow-lg">
                    <img
                      src={imageUrl}
                      alt={rec.name}
                      className="w-full h-full object-cover rounded-full border-4 border-white"
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
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

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {rec.name}
                </h2>
                <div className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-lg mb-4 border border-white/30">
                  <span className="text-sm font-mono text-slate-700">
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
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      Email
                    </p>
                    <p className="text-slate-800 font-medium">{rec.email}</p>
                  </div>
                  <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      Phone
                    </p>
                    <p className="text-slate-800 font-medium">{rec.phone}</p>
                  </div>
                  <div className="md:col-span-2 bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      Address
                    </p>
                    <p className="text-slate-800 font-medium">
                      {rec.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      License Number
                    </p>
                    <p className="text-slate-800 font-mono">
                      {rec.licenseNumber}
                    </p>
                  </div>
                  <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      Experience
                    </p>
                    <p className="text-slate-800">
                      {rec.experienceYears} year(s)
                    </p>
                  </div>
                  <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      Rating
                    </p>
                    {getRatingStars(rec.rating)}
                  </div>
                  <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/30">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      Joined Date
                    </p>
                    <p className="text-slate-800">
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
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  Availability Schedule
                </h3>
                <div className="bg-white/30 backdrop-blur-sm rounded-lg border border-white/30 p-6">
                  {rec.availability?.length ? (
                    <div className="space-y-4">
                      {rec.availability.map((a, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:justify-between p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-white/30 shadow-sm"
                        >
                          <div className="font-medium text-slate-800 mb-2 sm:mb-0">
                            {a.date}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(a.timeSlots || []).map((slot, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-orange-100/80 text-orange-700 text-sm font-medium rounded-full border border-orange-200/60"
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
                      <p className="text-slate-600 font-medium mb-1">
                        No availability records found
                      </p>
                      <p className="text-sm text-slate-500">
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
        <div className="bg-white/40 backdrop-blur-md rounded-xl shadow-xl border border-white/30 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
             Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to={``}
              className="p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 hover:border-white/40 transition-all"
            >
              Manage Schedule
            </Link>
            <Link
              to={``}
              className="p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 hover:border-white/40 transition-all"
            >
              View Performance
            </Link>
            <Link
              to=""
              className="p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 hover:border-white/40 transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
