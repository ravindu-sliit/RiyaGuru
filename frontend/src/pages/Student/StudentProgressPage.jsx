// src/pages/Student/StudentProgressPage.jsx
import { useEffect, useState } from "react";
import { BookOpen, CheckCircle, Award, TrendingUp, X, ChevronDown, ChevronUp } from "lucide-react";
import { lessonProgressService } from "../../services/lessonProgressService";
import InstructorAPI from "../../api/instructorApi";
import ProgressHero from "../../components/ProgressHero";
import { toast } from "react-toastify";

export default function StudentProgressPage() {
  const [studentId, setStudentId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Expanded cards state: { [courseName]: { open, loading, lessons, error } }
  const [expandedCourses, setExpandedCourses] = useState({});
  // Cache for instructor names: { [instructorId]: { name, error } }
  const [instructorCache, setInstructorCache] = useState({});
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // ✅ Step 1: fetch logged-in student profile
        const profileRes = await fetch(
          "http://localhost:5000/api/students/me/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("rg_token")}`,
            },
          }
        );
        if (!profileRes.ok) throw new Error("Failed to fetch student profile");

        const { student } = await profileRes.json();
        setStudentId(student.studentId);

        // ✅ Step 2: fetch progress reports
        const res = await fetch(
          `http://localhost:5000/api/progress-reports/student/${student.studentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("rg_token")}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch progress");

        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <div className="animate-spin h-10 w-10 border-4 border-blue-300 border-t-blue-600 rounded-full"></div>
        <p className="ml-3 font-medium">Loading progress…</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-xl rounded-2xl p-6 text-red-600 font-semibold">
          Error: {error}
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-xl rounded-2xl p-6 text-gray-500">
          No data available.
        </div>
      </div>
    );

  const { student_id, full_name, courses = [] } = data;

  // ✅ Stats
  const totalCourses = courses.length;
  const lessonsCompleted = courses.reduce(
    (sum, c) => sum + (c.completed_lessons || 0),
    0
  );
  const certificatesIssued = courses.filter(
    (c) => c.certificate_status === "Issued"
  ).length;
  const avgProgress =
    totalCourses > 0
      ? Math.round(
          courses.reduce((sum, c) => sum + (c.progress_percent || 0), 0) /
            totalCourses
        )
      : 0;

  // Helper: toggle expansion for a course card (fetch completed lessons when opening)
  async function handleToggleExpand(course) {
    const name = course.course_name;
    const existing = expandedCourses[name];
    // If already open, collapse
    if (existing && existing.open) {
      setExpandedCourses((prev) => ({ ...prev, [name]: { ...existing, open: false } }));
      return;
    }

    // Open and set loading
    setExpandedCourses((prev) => ({ ...prev, [name]: { open: true, loading: true, lessons: [] } }));

    try {
      const all = await lessonProgressService.getLessonsByStudentAndCourse(studentId, name);
      const completed = Array.isArray(all) ? all.filter((l) => l.status === "Completed") : [];
      setExpandedCourses((prev) => ({ ...prev, [name]: { open: true, loading: false, lessons: completed } }));

      // Fetch instructor names for lessons (cache by instructor_id)
      const instructorIds = [...new Set(completed.map((l) => l.instructor_id).filter(Boolean))];
      const missing = instructorIds.filter((id) => !instructorCache[id]);
      if (missing.length > 0) {
        // fetch in parallel and update cache
        const promises = missing.map((id) =>
          InstructorAPI.getById(id)
            .then((res) => res.data || res)
            .then((inst) => ({ id, name: inst?.name || inst?.fullName || inst?.instructorId || id }))
            .catch((err) => ({ id, name: id, error: err.message || String(err) }))
        );

        const results = await Promise.all(promises);
        setInstructorCache((prev) => {
          const next = { ...prev };
          for (const r of results) next[r.id] = { name: r.name, error: r.error };
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to load lessons for", name, err);
      setExpandedCourses((prev) => ({ ...prev, [name]: { open: true, loading: false, lessons: [], error: err.message || String(err) } }));
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero (full width like other pages) */}
      <div className="px-4 pt-4">
        <ProgressHero title="Student Dashboard" subtitle={`${full_name} (ID: ${student_id})`} padY="py-6">
          <div>
            <button
              onClick={async () => {
                try {
                  toast.info("Generating report, please wait...");
                  const res = await fetch("/api/reports/student/progress", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${localStorage.getItem("rg_token")}` },
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.message || "Failed to generate report");
                  toast.success("Report generated and emailed to your address");
                  if (json.previewUrl) {
                    // open Ethereal preview in a new tab for developer debugging
                    toast.info("Preview available (dev): opening in new tab");
                    try { window.open(json.previewUrl, "_blank"); } catch (e) { console.log("Preview URL:", json.previewUrl); }
                  }
                } catch (err) {
                  console.error(err);
                  toast.error(err.message || "Failed to generate report");
                }
              }}
              className="bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-md text-sm"
            >
              Generate Report
            </button>
          </div>
        </ProgressHero>
      </div>

      {/* Page content wrapper */}
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* Stats Cards (landing style) */}
        <div className="-mt-2 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <StatCard
              title="Courses Enrolled"
              value={totalCourses}
              subtitle="Active courses"
              icon={<BookOpen size={20} />}
              gradient="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
              textColor="text-blue-600"
              change="+2 since last month"
              positive={true}
            />
            <StatCard
              title="Lessons Completed"
              value={lessonsCompleted}
              subtitle="Completed lessons"
              icon={<CheckCircle size={20} />}
              gradient="from-green-500 to-emerald-600"
              bgColor="bg-green-50"
              textColor="text-green-600"
              change="+8% this week"
              positive={true}
            />
            <StatCard
              title="Certificates Issued"
              value={certificatesIssued}
              subtitle="Available certificates"
              icon={<Award size={20} />}
              gradient="from-yellow-500 to-orange-500"
              bgColor="bg-yellow-50"
              textColor="text-yellow-600"
              change="+1 recently"
              positive={true}
            />
            <StatCard
              title="Average Progress"
              value={`${avgProgress}%`}
              subtitle="Average across courses"
              icon={<TrendingUp size={20} />}
              gradient="from-purple-500 to-indigo-600"
              bgColor="bg-purple-50"
              textColor="text-purple-600"
              change="Stable"
              positive={true}
            />
          </div>
        </div>

        {/* Course Cards */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
            No active courses found.
          </div>
        ) : (
          courses.map((c) => {
            const pct = Number(c?.progress_percent || 0);

            // Build certificate file path if issued
            let certificateHref = "";
            if (c?.certificate_file) {
              const idx = String(c.certificate_file).lastIndexOf("uploads");
              if (idx !== -1) {
                certificateHref = `http://localhost:5000/${c.certificate_file
                  .slice(idx)
                  .replaceAll("\\", "/")}`;
              }
            }

            return (
              <div
                key={c.course_name}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-3 hover:shadow-xl transition"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {c.course_name}
                  </h3>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                    {c.completed_lessons}/{c.total_lessons} lessons
                  </span>
                </div>

                {/* Progress Bar (click to view completed lessons) */}
                <div className="mb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div
                        className="h-2 bg-gray-200 rounded-full overflow-hidden"
                        title={`${pct}% completed`}
                      >
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-medium">{pct}% completed</p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          if (!studentId) return alert("Student not loaded yet.");
                          handleToggleExpand(c);
                        }}
                        aria-expanded={expandedCourses[c.course_name] && expandedCourses[c.course_name].open}
                        className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md transition border ${
                          expandedCourses[c.course_name] && expandedCourses[c.course_name].open
                            ? "bg-white text-orange-700 border-orange-200"
                            : "bg-orange-600 text-white hover:bg-orange-700 border-orange-600"
                        }`}
                      >
                        <span className="sr-only">Toggle lessons</span>
                        {expandedCourses[c.course_name] && expandedCourses[c.course_name].open ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Expanded area: show completed lessons inline when the card is expanded (animated) */}
                {
                  (() => {
                    const key = c.course_name;
                    const state = expandedCourses[key] || { open: false, loading: false, lessons: [] };
                    const isOpen = !!state.open;
                    return (
                      <div
                        className={`mt-4 border-t pt-4 overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                          isOpen ? "max-h-96" : "max-h-0"
                        }`}
                        aria-hidden={!isOpen}
                      >
                        {state.loading ? (
                          <p className="text-sm text-gray-500">Loading completed lessons...</p>
                        ) : state.error ? (
                          <p className="text-sm text-red-600">Error: {state.error}</p>
                        ) : state.lessons.length === 0 ? (
                          <p className="text-sm text-gray-500">No completed lessons found for this course.</p>
                        ) : (
                          <div className="space-y-2">
                            {/* Header row */}
                            <div className="hidden md:grid grid-cols-12 gap-3 text-xs text-gray-500 px-3 py-2 border-b">
                              <div className="col-span-1 font-medium">#</div>
                              <div className="col-span-3">Date</div>
                              <div className="col-span-3">Instructor</div>
                              <div className="col-span-5">Feedback</div>
                            </div>

                            {/* Rows */}
                            {state.lessons
                              .sort((a, b) => a.lesson_number - b.lesson_number)
                              .map((l) => (
                                <div key={l._id} className="grid grid-cols-12 gap-3 items-center px-3 py-2 bg-gray-50 border rounded-lg">
                                  <div className="col-span-1 font-semibold">{l.lesson_number}</div>
                                  <div className="col-span-3 text-xs text-gray-600">{new Date(l.date).toLocaleString()}</div>
                                  <div className="col-span-3 text-xs text-gray-800">{(instructorCache[l.instructor_id] && instructorCache[l.instructor_id].name) || l.instructor_id}</div>
                                  <div className="col-span-5 text-xs text-gray-700 truncate">{l.feedback || "No feedback"}</div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })()
                }

                {/* Last Lesson (hidden when the card is expanded) */}
                {!expandedCourses[c.course_name]?.open && (
                  c.last_lesson ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        Last Lesson:{" "}
                        <span className="font-semibold">
                          #{c.last_lesson.lesson_number}
                        </span>{" "}
                        on{" "}
                        {new Date(c.last_lesson.date).toLocaleDateString()} –{" "}
                        <em>{c.last_lesson.feedback || "No feedback"}</em>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">
                      No lessons recorded yet.
                    </p>
                  )
                )}

                {/* Certificate Section */}
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700">
                    Certificate Status:{" "}
                    {c.certificate_status === "Issued" && certificateHref ? (
                      <span className="text-green-600">Available</span>
                    ) : c.certificate_status === "Eligible" ? (
                      <span className="text-green-600">
                        Eligible (ready to generate)
                      </span>
                    ) : (
                      <span className="text-gray-500">Not eligible yet</span>
                    )}
                  </p>

                  {/* Download button */}
                  {c.certificate_status === "Issued" && certificateHref && (
                    <a
                      href={certificateHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition"
                    >
                      Download
                    </a>
                  )}

                  {/* Generate button */}
                  {c.certificate_status === "Eligible" && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `http://localhost:5000/api/certificates/issue/${studentId}/${c.course_name}`,
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                  "rg_token"
                                )}`,
                              },
                            }
                          );
                          const json = await res.json();
                          if (!res.ok)
                            throw new Error(
                              json.message || "Failed to generate"
                            );

                          alert("Certificate generated!");

                          // Update state so button changes to "Download"
                          setData((prev) => ({
                            ...prev,
                            courses: prev.courses.map((course) =>
                              course.course_name === c.course_name
                                ? {
                                    ...course,
                                    certificate_status: "Issued",
                                    certificate_file:
                                      json.certificate?.file_url || "",
                                  }
                                : course
                            ),
                          }));
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
                    >
                      Generate Certificate
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* Styled Stat Card */
function StatCard({ title, value, icon, gradient }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-3 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-500">{title}</span>
        <div
          className={`p-2 rounded-md text-white bg-gradient-to-r ${gradient}`}
        >
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
