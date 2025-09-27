import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CourseAPI } from "../../api/courseApi";
import { AlertCircle, BookOpen, Loader2, DollarSign } from "lucide-react";
import { StudentCourseAPI } from "../../api/studentCourseApi";

const EnrollmentDetails = () => {
  const { id } = useParams(); // course id
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [fallbackName, setFallbackName] = useState("");
  const [resolvedPrice, setResolvedPrice] = useState(null);

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
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
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
  const requirements = course?.requirements || ["Valid NIC", "Minimum age as per category", "Basic literacy"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" style={{ color: "#2D74C4" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#0A1A2F" }}>{courseName}</h1>
          </div>
          <div className="text-sm text-gray-600 mb-6">Course ID: {id} • Category: {category}</div>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#0A1A2F" }}>About this course</h2>
              <p className="text-gray-700">{description}</p>
            </section>

            <section className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-500 text-sm">Duration</div>
                <div className="text-lg font-semibold" style={{ color: "#0A1A2F" }}>{duration}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-500 text-sm">Price</div>
                <div className="text-lg font-semibold" style={{ color: "#F47C20" }}>
                {toCurrency(price)}
              </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A1A2F" }}>Requirements</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {Array.isArray(requirements) ? requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                )) : (
                  <li>{requirements}</li>
                )}
              </ul>
            </section>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                navigate(`/create-payment?totalAmount=${price}&courseName=${encodeURIComponent(courseName)}&courseId=${id}`);
              }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetails;
