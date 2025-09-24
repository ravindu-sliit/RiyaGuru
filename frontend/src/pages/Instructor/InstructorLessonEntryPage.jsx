// src/pages/Instructor/InstructorLessonEntryPage.jsx
import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  CheckCircle,
  ClipboardList,
} from "lucide-react";

export default function InstructorLessonEntryPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    student_id: "",
    student_course_id: "",
    instructor_id: localStorage.getItem("rg_userId") || "",
    vehicle_type: "",
    lesson_number: 1,
    status: "Completed",
    feedback: "",
  });

  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    lessonsCompleted: 0,
    pendingEntries: 0,
  });

  // Load students
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch("http://localhost:5000/api/students");
        const data = await res.json();
        setStudents(data.students || []);
        setStats((prev) => ({
          ...prev,
          students: data.students?.length || 0,
        }));
      } catch (err) {
        console.error("Failed to load students", err);
      }
    }
    loadStudents();
  }, []);

  // Load courses when student changes
  useEffect(() => {
    if (!form.student_id) {
      setCourses([]);
      setForm((f) => ({ ...f, student_course_id: "", vehicle_type: "" }));
      return;
    }
    async function loadCourses() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/studentcourses/${form.student_id}`
        );
        const data = await res.json();
        const courseList = Array.isArray(data) ? data : data.courses || [];
        setCourses(courseList);
        setStats((prev) => ({ ...prev, courses: courseList.length }));
      } catch (err) {
        console.error("Failed to load courses", err);
        setCourses([]);
      }
    }
    loadCourses();
  }, [form.student_id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "student_course_id") {
        const selectedCourse = courses.find(
          (c) => c.student_course_id === value
        );
        if (selectedCourse) {
          updated.vehicle_type = selectedCourse.course_name;
        }
      }
      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/lesson-progress/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setMessage("✅ Lesson saved and progress updated!");
      setStats((prev) => ({
        ...prev,
        lessonsCompleted: prev.lessonsCompleted + 1,
      }));
    } catch (err) {
      setMessage("❌ " + err.message);
      setStats((prev) => ({
        ...prev,
        pendingEntries: prev.pendingEntries + 1,
      }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Instructor Lesson Entry</h1>
          <p className="text-blue-200">
            Record lessons, track student progress, and update reports
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 -mt-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Students"
            value={stats.students}
            icon={<Users size={22} />}
            gradient="from-blue-500 to-blue-600"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            title="Courses"
            value={stats.courses}
            icon={<BookOpen size={22} />}
            gradient="from-green-500 to-emerald-600"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatCard
            title="Lessons Completed"
            value={stats.lessonsCompleted}
            icon={<CheckCircle size={22} />}
            gradient="from-yellow-500 to-orange-500"
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />
          <StatCard
            title="Pending Entries"
            value={stats.pendingEntries}
            icon={<ClipboardList size={22} />}
            gradient="from-purple-500 to-indigo-600"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>

        {/* Lesson Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardList className="text-blue-600" size={20} />
            Record a Lesson
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Dropdown */}
            <select
              name="student_id"
              value={form.student_id}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.full_name} ({s.studentId})
                </option>
              ))}
            </select>

            {/* Course Dropdown */}
            <select
              name="student_course_id"
              value={form.student_course_id}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
              disabled={!courses.length}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.student_course_id} value={c.student_course_id}>
                  {c.course_name} ({c.student_course_id})
                </option>
              ))}
            </select>

            {/* Lesson number */}
            <input
              type="number"
              name="lesson_number"
              value={form.lesson_number}
              onChange={handleChange}
              placeholder="Lesson Number"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />

            {/* Status */}
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Feedback */}
            <textarea
              name="feedback"
              value={form.feedback}
              onChange={handleChange}
              placeholder="Feedback"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Save Lesson
            </button>
          </form>

          {form.vehicle_type && (
            <div className="mt-4 text-sm text-gray-600">
              Selected Vehicle:{" "}
              <span className="font-semibold">{form.vehicle_type}</span>
            </div>
          )}

          {message && (
            <div className="mt-4 text-center text-sm font-medium text-gray-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Modern Stat Card */
function StatCard({
  title,
  value,
  icon,
  gradient,
  bgColor,
  textColor,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <div className={`${textColor}`}>{icon}</div>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase">
        {title}
      </h3>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
