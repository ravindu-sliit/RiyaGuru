import { useEffect, useState } from "react";
//soori

export default function InstructorDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    lessons: 0,
    certificates: 0,
  });
  const [recentLessons, setRecentLessons] = useState([]);

  useEffect(() => {
    // TODO: Replace with real API calls
    async function loadData() {
      try {
        // Example: call backend endpoints
        // const res = await fetch("http://localhost:5000/api/instructor/stats");
        // const data = await res.json();
        setStats({
          students: 18,
          lessons: 45,
          certificates: 12,
        });

        setRecentLessons([
          {
            id: 1,
            student: "John Doe",
            course: "Car",
            lesson: 6,
            status: "Completed",
            date: "2025-09-21",
          },
          {
            id: 2,
            student: "Jane Smith",
            course: "Motorcycle",
            lesson: 3,
            status: "Completed",
            date: "2025-09-20",
          },
        ]);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          RiyaGuru.lk
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, <span className="font-semibold">Instructor I001</span>
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
          <p className="text-gray-500">Students Taught</p>
          <p className="text-3xl font-bold text-blue-600">{stats.students}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
          <p className="text-gray-500">Lessons Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.lessons}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
          <p className="text-gray-500">Certificates Issued</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.certificates}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow hover:bg-blue-700 transition">
            ➕ Add Lesson Progress
          </button>
          <button className="bg-green-600 text-white px-5 py-3 rounded-xl shadow hover:bg-green-700 transition">
            👀 View Student Progress
          </button>
          <button className="bg-purple-600 text-white px-5 py-3 rounded-xl shadow hover:bg-purple-700 transition">
            📊 Generate Reports
          </button>
        </div>
      </div>

      {/* Recent Lessons */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Lessons</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-left text-gray-700">
                <th className="p-3">Student</th>
                <th className="p-3">Course</th>
                <th className="p-3">Lesson</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{lesson.student}</td>
                  <td className="p-3">{lesson.course}</td>
                  <td className="p-3">#{lesson.lesson}</td>
                  <td
                    className={`p-3 font-semibold ${
                      lesson.status === "Completed"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {lesson.status}
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(lesson.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
