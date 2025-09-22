import { useEffect, useState } from "react";

export default function StudentProgressPage() {
  const STUDENT_ID = "S037"; // replace with logged-in student
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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
        <div className="text-lg text-gray-600">Loading progress…</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
        <div className="text-red-600 text-xl font-semibold">Error: {error}</div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-gray-600">No data.</div>
      </div>
    </div>
  );

  const { student_id, full_name, courses = [] } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
    Student Progress
  </h2>

  <div className="space-y-1 text-gray-700">
    <p className="text-lg font-semibold">{full_name}</p>
    <p>ID: <span className="font-medium">{student_id}</span></p>
  </div>
</div>


        {courses.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="text-gray-500 text-lg">No active courses found.</div>
          </div>
        )}

        {courses.map((c) => {
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
              className="bg-white shadow-xl border border-white/20 rounded-3xl p-8 mb-8 hover:shadow-2xl transition-all duration-300"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {c.course_name}
                </h3>
                <span className="bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 rounded-xl text-gray-700 font-medium shadow-inner">
                  {c.completed_lessons}/{c.total_lessons} lessons
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-out shadow-lg rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-lg font-semibold text-gray-700 mt-3">{pct}% completed</p>
              </div>

              {/* Last lesson */}
              {c.last_lesson ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                  <div className="text-gray-700 space-y-2">
                    <p className="font-semibold">
                      Last lesson: <span className="text-blue-600">#{c.last_lesson.lesson_number}</span>
                    </p>
                    <p className="font-medium">
                      Date: <span className="text-gray-600">{new Date(c.last_lesson.date).toLocaleDateString()}</span>
                    </p>
                    <div className="mt-4 p-4 bg-white/70 rounded-xl border border-blue-200">
                      <p className="font-semibold text-blue-800">Feedback:</p>
                      <p className="text-blue-700 italic mt-1">{c.last_lesson.feedback || "-"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 text-center">
                  <p className="text-gray-500 text-lg">No lessons recorded yet.</p>
                </div>
              )}

              {/* Certificate */}
              <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Certificate Status</p>
                  {c.certificate_status === "Issued" && certificateHref ? (
                    <span className="text-green-600 font-medium">🎓 Certificate Available</span>
                  ) : c.certificate_status === "Eligible" ? (
                    <span className="text-green-600 font-medium">✅ Eligible — waiting for issuance</span>
                  ) : (
                    <span className="text-gray-500">Not eligible yet</span>
                  )}
                </div>
                
                {c.certificate_status === "Issued" && certificateHref && (
                  <a
                    href={certificateHref}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    🎓 Download Certificate ({c.certificateId})
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}