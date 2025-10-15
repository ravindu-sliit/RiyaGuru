// src/pages/Instructor/InstructorLessonEntryPage.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  BookOpen,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { lessonProgressService } from "../../services/lessonProgressService";
import ProgressHero from "../../components/ProgressHero";
import { getAuthToken } from "../../services/authHeader";
import { toast } from "react-toastify";

export default function InstructorLessonEntryPage() {
  const location = useLocation();
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
  const [errors, setErrors] = useState({});
  const [existingLessonNumbers, setExistingLessonNumbers] = useState([]);
  const [pendingValidation, setPendingValidation] = useState(false);
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    lessonsCompleted: 0,
    pendingEntries: 0,
  });
  const [selectedCompletedCount, setSelectedCompletedCount] = useState(0);

  // Load students
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch("http://localhost:5000/api/students");
        const data = await res.json();
        const list = Array.isArray(data?.students)
          ? data.students
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setStudents(list);
        setStats((prev) => ({
          ...prev,
          students: list.length,
        }));
      } catch (err) {
        console.error("Failed to load students", err);
      }
    }
    loadStudents();
  }, []);

  // Prefill student/course from query params (e.g., ?studentId=I001&student_course_id=SC123)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || window.location.search);
      const sid = params.get("studentId") || params.get("student_id");
      const scid = params.get("student_course_id") || params.get("courseId");
      if (sid) {
        setForm((f) => ({ ...f, student_id: sid, student_course_id: scid || f.student_course_id }));
        // clear related errors if any
        setErrors((prev) => ({ ...prev, student_id: undefined, student_course_id: undefined }));
      }
    } catch (e) {
      // ignore
    }
  }, [location.search]);

  // Load courses when student changes
  useEffect(() => {
    if (!form.student_id) {
      setCourses([]);
      setForm((f) => ({ ...f, student_course_id: "", vehicle_type: "" }));
      setSelectedCompletedCount(0);
      return;
    }
    async function loadCourses() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/studentcourses/${form.student_id}`
        );
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.courses)
          ? data.courses
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.studentCourses)
          ? data.studentCourses
          : [];
        setCourses(list);
        setStats((prev) => ({ ...prev, courses: list.length }));
      } catch (err) {
        console.error("Failed to load courses", err);
        setCourses([]);
      }
    }
    loadCourses();
  }, [form.student_id]);

  // When student + course selection changes, fetch existing completed lessons for uniqueness check
  useEffect(() => {
    async function loadExistingLessons() {
      setExistingLessonNumbers([]);
      if (!form.student_id || !form.vehicle_type) {
        setSelectedCompletedCount(0);
        setStats((prev) => ({ ...prev, lessonsCompleted: 0 }));
        return;
      }
      try {
        // vehicle_type holds the course_name
        const data = await lessonProgressService.getLessonsByStudentAndCourse(form.student_id, form.vehicle_type);
        // data may be array or object depending on API; normalize
        const lessons = Array.isArray(data) ? data : (data?.lessons || data || []);
        const nums = lessons.map((l) => Number(l.lesson_number)).filter((n) => !Number.isNaN(n));
        setExistingLessonNumbers(nums);
        const completedCount = lessons.filter((l) => String(l.status).toLowerCase() === "completed").length;
        setSelectedCompletedCount(completedCount);
        setStats((prev) => ({ ...prev, lessonsCompleted: completedCount }));
      } catch (err) {
        console.error("Failed to load existing lessons for uniqueness check", err);
        setExistingLessonNumbers([]);
        setSelectedCompletedCount(0);
        setStats((prev) => ({ ...prev, lessonsCompleted: 0 }));
      }
    }

    loadExistingLessons();
  }, [form.student_id, form.vehicle_type]);

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
    // clear field-specific error when user changes it
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setMessage("");
  // Validate and collect field level errors
  const valid = validateForm();
  if (!valid) return;

  try {
    // quick client-side check for token
    const token = getAuthToken();
    if (!token) {
      setMessage('❌ You are not authenticated. Please sign in again.');
      return;
    }
    const data = await lessonProgressService.addLessonProgress(form);
    // success
    setErrors({});
    setMessage("");
    toast.success("Lesson saved and progress updated!");
    setStats((prev) => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + (form.status === "Completed" ? 1 : 0),
    }));
    if (form.status === "Completed") {
      setSelectedCompletedCount((c) => c + 1);
    }
  } catch (err) {
    const serverMsg = err?.message || "Failed to save";
    // If server indicates a duplicate lesson, show it inline on lesson_number
    if (serverMsg && /lesson\s*#?\d+/i.test(serverMsg) && /already/i.test(serverMsg)) {
      setErrors((prev) => ({ ...prev, lesson_number: serverMsg }));
      setMessage("");
    } else if (serverMsg === 'Unauthorized' || /401/.test(serverMsg)) {
      // token missing/expired
      setMessage('❌ Unauthorized. Please login again.');
    } else {
      if (!errors.lesson_number) setMessage("❌ " + serverMsg);
    }

    setStats((prev) => ({
      ...prev,
      pendingEntries: prev.pendingEntries + 1,
    }));
  }
}

function validateForm() {
  const next = {};
  if (!form.student_id) next.student_id = "Please select a student.";
  if (!form.student_course_id) next.student_course_id = "Please select a course.";

  // lesson number must be a positive integer
  const ln = parseInt(form.lesson_number, 10);
  if (Number.isNaN(ln) || ln < 1) next.lesson_number = "Lesson number must be an integer >= 1.";

  if (!form.instructor_id) next.instructor_id = "Instructor ID missing. Please re-login.";

  if (form.status === "Completed" && !String(form.feedback || "").trim()) {
    next.feedback = "Please provide feedback for a completed lesson.";
  }

  setErrors(next);
  // if next has any keys with truthy values, invalid
  return Object.keys(next).length === 0;
}

// Check that lesson_number is unique for selected student+course
async function validateLessonNumberUnique() {
  // quick client-side check from cached numbers
  setErrors((prev) => ({ ...prev, lesson_number: undefined }));
  const ln = parseInt(form.lesson_number, 10);
  if (Number.isNaN(ln) || ln < 1) {
    setErrors((prev) => ({ ...prev, lesson_number: "Lesson number must be an integer >= 1." }));
    return false;
  }

  if (!form.student_id || !form.vehicle_type) {
    // can't validate uniqueness until student+course selected
    return true;
  }

  setPendingValidation(true);
  try {
    // use cached list where possible
    if (existingLessonNumbers.includes(ln)) {
      setErrors((prev) => ({ ...prev, lesson_number: `Lesson #${ln} already exists for this course.` }));
      return false;
    }

    // As a fallback, check server (in case cache is stale)
    try {
      const data = await lessonProgressService.getLessonsByStudentAndCourse(form.student_id, form.vehicle_type);
      const lessons = Array.isArray(data) ? data : (data?.lessons || data || []);
      const nums = lessons.map((l) => Number(l.lesson_number)).filter((n) => !Number.isNaN(n));
      setExistingLessonNumbers(nums);
      if (nums.includes(ln)) {
        setErrors((prev) => ({ ...prev, lesson_number: `Lesson #${ln} already exists for this course.` }));
        return false;
      }
    } catch (e) {
      // non-fatal: assume unique if server check fails
      console.warn("Server uniqueness check failed, proceeding optimistically", e);
    }

    // unique
    setErrors((prev) => ({ ...prev, lesson_number: undefined }));
    return true;
  } finally {
    setPendingValidation(false);
  }
}


  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressHero
        title="Instructor Lesson Entry"
        subtitle="Record lessons, track student progress, and update reports"
      />

      <div className="max-w-7xl mx-auto p-6 mt-6 md:mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Left: Lesson Form */}
          <div className="md:col-span-2 h-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
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
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${errors.student_id ? 'border-red-500 focus:ring-red-300' : ''}`}
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
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${errors.student_course_id ? 'border-red-500 focus:ring-red-300' : ''}`}
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
            {form.student_id && form.vehicle_type && (
              <div className="text-sm text-gray-700 mt-1">
                Completed lessons for this course: <span className="font-semibold">{selectedCompletedCount}</span>
              </div>
            )}

            {/* Lesson number */}
            <input
              type="number"
              name="lesson_number"
              value={form.lesson_number}
              onChange={handleChange}
              onBlur={async () => { await validateLessonNumberUnique(); }}
              placeholder="Lesson Number"
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${errors.lesson_number ? 'border-red-500 focus:ring-red-300' : ''}`}
              min="1"
              required
            />
            {errors.lesson_number && <div className="text-sm text-red-600 mt-1">{errors.lesson_number}</div>}

            {/* Status */}
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${errors.status ? 'border-red-500 focus:ring-red-300' : ''}`}
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
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${errors.feedback ? 'border-red-500 focus:ring-red-300' : ''}`}
            />
            {errors.feedback && <div className="text-sm text-red-600 mt-1">{errors.feedback}</div>}

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
              disabled={Object.keys(errors).some((k) => errors[k]) || pendingValidation}
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

          {/* Right: Compact sticky overview panel */}
          <div className="h-full md:sticky md:top-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 h-full md:max-w-xs ml-auto">
              <div className="text-sm font-semibold text-gray-700 mb-3">Overview</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <div className="text-xs font-medium text-gray-600 uppercase">Students</div>
                  </div>
                  <div className="text-lg font-bold text-gray-800">{stats.students}</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <BookOpen size={18} />
                    </div>
                    <div className="text-xs font-medium text-gray-600 uppercase">Courses</div>
                  </div>
                  <div className="text-lg font-bold text-gray-800">{stats.courses}</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                      <CheckCircle size={18} />
                    </div>
                    <div className="text-xs font-medium text-gray-600 uppercase">Lessons Completed</div>
                  </div>
                  <div className="text-lg font-bold text-gray-800">{stats.lessonsCompleted}</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <ClipboardList size={18} />
                    </div>
                    <div className="text-xs font-medium text-gray-600 uppercase">Pending Entries</div>
                  </div>
                  <div className="text-lg font-bold text-gray-800">{stats.pendingEntries}</div>
                </div>
              </div>
            </div>
          </div>
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
