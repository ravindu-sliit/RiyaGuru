import { useEffect, useState } from "react";
import { BookOpen, CheckCircle, Award, TrendingUp } from "lucide-react";

export default function StudentProgressPage() {
  const STUDENT_ID = "S063"; // replace with logged-in student
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/progress-reports/student/${STUDENT_ID}`
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
        <p className="ml-3">Loading progress…</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-lg rounded-xl p-6 text-red-600">
          Error: {error}
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-lg rounded-xl p-6 text-gray-500">
          No data available.
        </div>
      </div>
    );

  const { student_id, full_name, courses = [] } = data;

  // ✅ Calculate stats
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Student Dashboard
          </h2>
          <p className="text-gray-600">{full_name} (ID: {student_id})</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Courses Enrolled"
            value={totalCourses}
            icon={<BookOpen size={20} />}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Lessons Completed"
            value={lessonsCompleted}
            icon={<CheckCircle size={20} />}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Certificates Issued"
            value={certificatesIssued}
            icon={<Award size={20} />}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            title="Average Progress"
            value={`${avgProgress}%`}
            icon={<TrendingUp size={20} />}
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Course Cards */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
            No active courses found.
          </div>
        ) : (
          courses.map((c) => {
            const pct = Number(c?.progress_percent || 0);

            // Generate certificate link if exists
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
                className="bg-white rounded-xl shadow p-6 mb-6"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {c.course_name}
                  </h3>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-lg text-gray-700">
                    {c.completed_lessons}/{c.total_lessons} lessons
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-3 bg-gray-200 rounded-full">
                    <div
                      className="h-3 bg-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{pct}% completed</p>
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

                {/* Certificate */}
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700">
                    Certificate Status:{" "}
                    {c.certificate_status === "Issued" && certificateHref ? (
                      <span className="text-green-600">🎓 Available</span>
                    ) : c.certificate_status === "Eligible" ? (
                      <span className="text-green-600">
                        ✅ Eligible (waiting for issuance)
                      </span>
                    ) : (
                      <span className="text-gray-500">Not eligible yet</span>
                    )}
                  </p>

                  {c.certificate_status === "Issued" && certificateHref && (
                    <a
                      href={certificateHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Download
                    </a>
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

/* Reusable Stat Card */
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
