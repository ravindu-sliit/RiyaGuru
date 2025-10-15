import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CourseAPI } from "../../api/courseApi";
import { AlertCircle, BookOpen, Loader2, DollarSign, Clock, Users, Award } from "lucide-react";
import { StudentCourseAPI } from "../../api/studentCourseApi";
import ProgressHero from "../../components/ProgressHero";

const EnrollmentDetails = () => {
  const { id } = useParams(); // course id
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [fallbackName, setFallbackName] = useState("");
  const [resolvedPrice, setResolvedPrice] = useState(null);

  // Function to get course image based on course name/id
  const getCourseImage = (courseName, courseId) => {
    const name = (courseName || courseId || '').toLowerCase();
    if (name.includes('van')) {
      return '/images/courses/van.jpeg';
    } else if (name.includes('car')) {
      return '/images/courses/car.jpeg';
    } else if (name.includes('motorcycle') || name.includes('bike')) {
      return '/images/courses/motorcycle.jpeg';
    }
    return '/images/courses/car.jpeg'; // default fallback
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        // read optional name from query for fallback matching
        const urlParams = new URLSearchParams(window.location.search);
        const qName = urlParams.get("name") || "";
        const qPrice = urlParams.get("price");
        setFallbackName(qName);
        if (qPrice != null && qPrice !== "") {
          const parsed = parseFloat(String(qPrice).replace(/[^0-9.\-]/g, ""));
          if (!Number.isNaN(parsed)) setResolvedPrice(parsed);
        }

        // List-based relaxed search
        {
          const all = await CourseAPI.getAll();
          const list = Array.isArray(all?.courses) ? all.courses : Array.isArray(all) ? all : [];
          const norm = (s) => String(s || "").trim().toLowerCase();
          const targets = [id, qName]
            .filter(Boolean)
            .map(norm)
            .filter((v) => v.length > 0);
          const found = list.find((c) => {
            const candidates = [c?._id, c?.id, c?.course_id, c?.name, c?.course_name, c?.title]
              .filter(Boolean)
              .map(norm);
            return targets.some((t) =>
              candidates.some((cand) => cand === t || cand.includes(t) || t.includes(cand))
            );
          });
          if (found) {
            setCourse(found);
            const pRaw = [
              found?.price,
              found?.amount,
              found?.fee,
              found?.fees,
              found?.cost,
              found?.course_price,
            ].find((v) => v != null && v !== "");
            if (pRaw != null) {
              const pNum = parseFloat(String(pRaw).replace(/[^0-9.\-]/g, ""));
              if (!Number.isNaN(pNum)) setResolvedPrice(pNum);
            }
          } else {
            // fallback minimal: set course with just name so page shows info without price
            setCourse({ name: qName || id, price: null, description: null });
          }
        }
      } catch (err) {
        if (err?.request) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError("Failed to load course details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Secondary price resolver: look into student's enrolled courses for this id/name
  useEffect(() => {
    const resolveFromEnrollments = async () => {
      try {
        if (resolvedPrice != null) return; // already have a price
        const studentId = localStorage.getItem("rg_userId");
        if (!studentId) return;
        const sc = await StudentCourseAPI.getByStudentId(studentId);
        const list = Array.isArray(sc) ? sc : sc?.data || [];
        const urlParams = new URLSearchParams(window.location.search);
        const qName = urlParams.get("name") || "";
        const match = list.find((c) => {
          const cid = c?.course_id;
          const cname = c?.course_name || c?.courseId || c?.title;
          return (
            String(cid).toLowerCase() === String(id).toLowerCase() ||
            (qName && String(cname).toLowerCase() === String(qName).toLowerCase())
          );
        });
        const cd = match?.courseData?.[0] || {};
        const possible = [
          cd.price,
          cd.amount,
          cd.fee,
          cd.fees,
          cd.cost,
          match?.price,
          match?.amount,
          match?.fee,
          match?.fees,
          match?.cost,
        ].find((v) => v != null && v !== "");
        if (possible != null) setResolvedPrice(possible);
      } catch (e) {
        // ignore
      }
    };
    resolveFromEnrollments();
  }, [id, resolvedPrice]);

  const toCurrency = (amount) => {
    const a = parseFloat(String(amount)) || 0;
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const price = resolvedPrice ?? course?.price ?? course?.amount ?? 0;
  const courseName = course?.name || course?.course_name || course?.title || fallbackName || id;
  const category = course?.category || course?.type || "General";
  const description = course?.description || "This course provides comprehensive training to help you master safe driving skills and prepare for licensing.";
  const duration = course?.duration || "Flexible schedule";
  const requirements = course?.requirements || ["You must meet the minimum age requirement (usually 16–18).", "You need to provide valid documents such as an ID card, birth certificate, or passport along with proof of address.", "A medical or vision test is required to ensure you are physically fit to drive safely.","You must pass a written or computer-based theory test that covers road signs, traffic rules, and safe driving practices."];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero — match Progress/My Enrollments */}
      <div className="px-6 pt-6">
        <ProgressHero
          title={courseName}
          subtitle={`Course ID: ${id} • Category: ${category}`}
          icon={<BookOpen className="w-8 h-8 text-white" />}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Course Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 rounded-xl p-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "#0A1A2F" }}>About this course</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{description}</p>
            </div>

            {/* Requirements Section */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 rounded-xl p-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: "#0A1A2F" }}>Requirements</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {Array.isArray(requirements) ? requirements.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{r}</span>
                  </div>
                )) : (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{requirements}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Why Choose Us Section - moved here */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl shadow-lg p-6">
              <h4 className="text-lg font-bold mb-3 text-orange-800">Why Choose Us?</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-orange-700">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Professional instructors</span>
                </div>
                <div className="flex items-center gap-2 text-orange-700">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Modern training vehicles</span>
                </div>
                <div className="flex items-center gap-2 text-orange-700">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Flexible scheduling</span>
                </div>
                <div className="flex items-center gap-2 text-orange-700">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">High success rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-6" style={{ color: "#0A1A2F" }}>Course Details</h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700 font-medium">Duration</span>
                  </div>
                  <div className="text-lg font-bold text-blue-800">{duration}</div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Price</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">{toCurrency(price)}</div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-purple-700 font-medium">Category</span>
                  </div>
                  <div className="text-lg font-bold text-purple-800">{category}</div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
              <div className="text-center mb-4">
                <h4 className="text-lg font-bold mb-2" style={{ color: "#0A1A2F" }}>Ready to Start?</h4>
                <p className="text-gray-600">Complete your payment to begin this course</p>
              </div>
              <button
                onClick={() => {
                  navigate(`/create-payment?totalAmount=${price}&courseName=${encodeURIComponent(courseName)}&courseId=${id}`);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Pay Now - {toCurrency(price)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetails;