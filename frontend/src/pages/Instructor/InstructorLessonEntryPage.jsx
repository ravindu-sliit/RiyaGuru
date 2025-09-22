import { useState, useEffect } from "react";

export default function InstructorLessonEntryPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    student_id: "",
    student_course_id: "",
    instructor_id: "I001", // TODO: replace with logged-in instructor
    vehicle_type: "",       // now auto-filled when course is selected
    lesson_number: 1,
    status: "Completed",
    feedback: "",
  });

  const [message, setMessage] = useState("");

  // Load students when page mounts
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch("http://localhost:5000/api/students");
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error("Failed to load students", err);
      }
    }
    loadStudents();
  }, []);

  // Load courses whenever student changes
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

      // auto-fill vehicle_type when selecting a course
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
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">
          Instructor Lesson Entry
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Dropdown */}
          <select
            name="student_id"
            value={form.student_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
            required
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.studentId} value={s.studentId}>
                {s.full_name} ({s.studentId})
              </option>
            ))}
          </select>

          {/* Course Dropdown (populated after student selection) */}
          <select
            name="student_course_id"
            value={form.student_course_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
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
            className="w-full border rounded-lg px-4 py-2"
            min="1"
            required
          />

          {/* Status */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
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
            className="w-full border rounded-lg px-4 py-2"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Save Lesson
          </button>
        </form>

        {form.vehicle_type && (
          <div className="mt-4 text-sm text-gray-600">
            🚘 Selected Vehicle:{" "}
            <span className="font-semibold">{form.vehicle_type}</span>
          </div>
        )}

        {message && (
          <div className="mt-4 text-center text-sm font-medium">{message}</div>
        )}
      </div>
    </div>
  );
}
