import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StudentCourseAPI } from "../../api/studentCourseApi";
import { AlertCircle, BookOpen, Loader2, ArrowRight } from "lucide-react";
import ProgressHero from "../../components/ProgressHero";
import { CourseAPI } from "../../api/courseApi";

const MyEnrollments = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem("rg_id") || localStorage.getItem("rg_userId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [coursePriceMap, setCoursePriceMap] = useState({});

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!studentId) {
        setError("No student ID found. Please log in again.");
        return;
      }
      const res = await StudentCourseAPI.getByStudentId(studentId);
      // API can return array directly or {data}
      const list = Array.isArray(res) ? res : res?.data || [];
      setCourses(list);
    } catch (err) {
      if (err?.response?.status === 404) {
        // No enrollments — empty state, not an error
        setCourses([]);
        setError(null);
      } else if (err?.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to load enrollments. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Load all courses and build a quick lookup for price by id/name
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const all = await CourseAPI.getAll();
        const list = Array.isArray(all?.courses) ? all.courses : Array.isArray(all) ? all : [];
        const norm = (s) => String(s || "").trim().toLowerCase();
        const map = {};
        list.forEach((c) => {
          // try multiple common price field names
          const price = c?.price ?? c?.amount ?? c?.fee ?? c?.fees ?? c?.cost;
          const keys = [
            c?._id,
            c?.id,
            c?.course_id,
            c?.courseId,
            c?.code,
            c?.name,
            c?.course_name,
            c?.title,
          ]
            .filter(Boolean)
            .map(norm);
          keys.forEach((k) => {
            if (k && price != null) map[k] = price;
          });
        });
        setCoursePriceMap(map);
      } catch (e) {
        // ignore silently; UI will still work without price map
      }
    };
    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your enrollments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchEnrollments}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-6">
        <ProgressHero
          title="My Enrollments"
          subtitle="View your enrolled courses and proceed to payment."
          icon={<BookOpen className="w-8 h-8 text-white" />}
        />
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100 hover:shadow-md transition-shadow">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Enrolled Courses</h3>
          <p className="text-gray-500 mb-6">You don't have any enrolled courses yet.</p>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all">
            Explore Courses
          </button>
        </div>
      ) : (
        <div className="px-6 py-8 grid md:grid-cols-2 gap-5">
          {courses.map((c, idx) => (
            <div key={c._id || idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-base md:text-lg mb-0.5" style={{ color: "#0A1A2F" }}>
                    {c.course_name || c.course_id || `Course #${idx + 1}`}
                  </h4>
                  <div className="text-xs md:text-sm text-gray-600">Course ID: {c.course_id || "N/A"}</div>
                </div>
              </div>

              {(() => {
                const norm = (s) => String(s || "").trim().toLowerCase();
                const keyId = norm(c.course_id);
                const keyName = norm(c.course_name || c.course_id);
                // also fallback to enrollment record fields if course map misses
                const price =
                  coursePriceMap[keyId] ??
                  coursePriceMap[keyName] ??
                  c?.price ?? c?.amount ?? c?.fee ?? c?.fees ?? c?.cost ?? null;
                return (
                  <div className="mb-3 min-h-[56px] flex flex-col justify-end">
                    {price != null ? (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Price</span>
                        <div className="text-lg font-semibold text-slate-900">
                          {new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" })
                            .format(price)
                            .replace("LKR", "Rs.")}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 shadow-sm">
                        <span className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">Price</span>
                        <div className="text-lg font-semibold text-gray-600">Rs.</div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex justify-between items-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5 shadow-sm">
                  <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">Status</span>
                  <div className="text-xs font-semibold text-blue-700">{c.status || "Active"}</div>
                </div>
                <button
                  onClick={() => {
                    const norm = (s) => String(s || "").trim().toLowerCase();
                    const keyId = norm(c.course_id);
                    const keyName = norm(c.course_name || c.course_id);
                    const price = coursePriceMap[keyId] ?? coursePriceMap[keyName];
                    const qs = new URLSearchParams({
                      name: String(c.course_name || c.course_id || ""),
                      ...(price != null ? { price: String(price) } : {}),
                    }).toString();
                    navigate(`/enrollments/${encodeURIComponent(c.course_id)}?${qs}`);
                  }}
                  className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;