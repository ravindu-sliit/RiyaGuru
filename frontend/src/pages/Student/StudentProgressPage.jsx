// src/pages/Student/StudentProgressPage.jsx
import { useEffect, useState } from "react";
import { BookOpen, CheckCircle, Award, TrendingUp, X } from "lucide-react";
import { lessonProgressService } from "../../services/lessonProgressService";

export default function StudentProgressPage() {
  const [studentId, setStudentId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Modal state for showing completed lessons
  const [showModal, setShowModal] = useState(false);
  const [modalLessons, setModalLessons] = useState([]);
  const [modalCourseName, setModalCourseName] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

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

  // Completed Lessons Modal (renders when showModal is true)
  const CompletedLessonsModal = (
    showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setShowModal(false)}
        />
        <div className="bg-white rounded-2xl shadow-xl p-6 z-10 w-11/12 max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Completed lessons — {modalCourseName}</h3>
            <button onClick={() => setShowModal(false)} className="p-2">
              <X />
            </button>
          </div>

          {modalLessons.length === 0 ? (
            modalLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <p className="text-sm text-gray-500">No completed lessons found.</p>
            )
          ) : (
            <div className="grid gap-3">
              {modalLessons.map((l) => (
                <div key={l._id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">Lesson #{l.lesson_number}</div>
                      <div className="text-sm text-gray-600">{new Date(l.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-gray-700">{l.feedback || "No feedback"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {CompletedLessonsModal}
        {/* Header - match landing page hero */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Student Dashboard</h2>
          <p className="text-blue-200 font-medium">
            {full_name} <span className="text-white/80">(ID: {student_id})</span>
          </p>
        </div>

        {/* Stats Cards (landing style) */}
        <div className="px-6 -mt-6 relative z-10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Courses Enrolled"
              value={totalCourses}
              subtitle="Active courses"
              icon={<BookOpen size={24} />}
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
              icon={<CheckCircle size={24} />}
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
              icon={<Award size={24} />}
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
              icon={<TrendingUp size={24} />}
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
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 hover:shadow-2xl transition"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {c.course_name}
                  </h3>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-lg text-gray-700">
                    {c.completed_lessons}/{c.total_lessons} lessons
                  </span>
                </div>

                {/* Progress Bar (click to view completed lessons) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div
                        className="h-3 bg-gray-200 rounded-full overflow-hidden"
                        title={`${pct}% completed`}
                      >
                        <div
                          className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2 font-medium">{pct}% completed</p>
                    </div>
                    <div>
                      <button
                        onClick={async () => {
                          if (!studentId) return alert("Student not loaded yet.");
                          try {
                            setModalLoading(true);
                            const filtered = await lessonProgressService.getLessonsByStudentAndCourse(
                              studentId,
                              c.course_name
                            );
                            setModalCourseName(c.course_name);
                            setModalLessons(filtered);
                            setShowModal(true);
                          } catch (err) {
                            console.error("Failed to load lessons:", err);
                            alert("Failed to load lessons: " + err.message);
                          } finally {
                            setModalLoading(false);
                          }
                        }}
                        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                      >
                        View Lessons
                      </button>
                    </div>
                  </div>
                </div>

                {/* Last Lesson */}
                {c.last_lesson ? (
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
                )}

                {/* Certificate Section */}
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700">
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
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
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
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div
          className={`p-3 rounded-lg text-white bg-gradient-to-r ${gradient}`}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
