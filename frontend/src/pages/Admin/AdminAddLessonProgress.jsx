import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lessonProgressService } from "../../services/lessonProgressService";
import InstructorAPI from "../../api/instructorApi";
import { studentService } from "../../services/studentService";
import { toast } from "react-toastify";

export default function AdminAddLessonProgress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ student_id: "", student_course_id: "", instructor_id: "", vehicle_type: "", lesson_number: "", status: "Completed", feedback: "" });

  useEffect(() => {
    InstructorAPI.getAll().then((res) => setInstructors(res.data || res)).catch(() => setInstructors([]));
    studentService.getAllStudents().then((data) => setStudents(data?.students || data || [])).catch(() => setStudents([]));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.student_id || !form.instructor_id || !form.vehicle_type || !form.lesson_number || !form.student_course_id) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const payload = { ...form, lesson_number: parseInt(form.lesson_number) };
      await lessonProgressService.addLessonProgress(payload);
      toast.success("Lesson added successfully");
      navigate("/admin/instructor/lesson-progress");
    } catch (err) {
      toast.error(err.message || "Failed to add lesson");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Add Lesson Progress (Admin)</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <label>Student *</label>
          <select name="student_id" value={form.student_id} onChange={handleChange} required className="border p-2 rounded">
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s.student_id}>{s.name || s.student_id}</option>
            ))}
          </select>

          <label>Student Course ID *</label>
          <input name="student_course_id" value={form.student_course_id} onChange={handleChange} className="border p-2 rounded" required />

          <label>Instructor *</label>
          <select name="instructor_id" value={form.instructor_id} onChange={handleChange} required className="border p-2 rounded">
            <option value="">Select instructor</option>
            {instructors.map((i) => (
              <option key={i._id} value={i.instructorId}>{i.name} ({i.instructorId})</option>
            ))}
          </select>

          <label>Vehicle Type *</label>
          <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} required className="border p-2 rounded">
            <option value="">Select vehicle</option>
            <option>Car</option>
            <option>Motorcycle</option>
            <option>ThreeWheeler</option>
            <option>HeavyVehicle</option>
          </select>

          <label>Lesson Number *</label>
          <input type="number" name="lesson_number" value={form.lesson_number} onChange={handleChange} min={1} required className="border p-2 rounded" />

          <label>Feedback</label>
          <textarea name="feedback" value={form.feedback} onChange={handleChange} className="border p-2 rounded" />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => window.history.back()} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Adding...' : 'Add Lesson'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
