import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { lessonProgressService } from "../../services/lessonProgressService";
import { BookOpen, ArrowLeft, Save, X } from "lucide-react";
import { toast } from "react-toastify";

export default function AddLessonProgress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    student_course_id: "",
    instructor_id: "",
    vehicle_type: "",
    lesson_number: "",
    status: "Completed",
    feedback: "",
  });

  const vehicleTypes = ["Car", "Motorcycle", "ThreeWheeler", "HeavyVehicle"];
  const statusOptions = ["Completed", "Pending"];

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !formData.student_id ||
      !formData.instructor_id ||
      !formData.vehicle_type ||
      !formData.lesson_number ||
      !formData.student_course_id
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const lessonData = {
        ...formData,
        lesson_number: parseInt(formData.lesson_number),
      };

      await lessonProgressService.addLessonProgress(lessonData);
      toast.success("Lesson progress added successfully!");
      navigate("/lesson-progress");
    } catch (error) {
      toast.error(error.message || "Failed to add lesson progress");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate("/lesson-progress");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2 text-blue-600 font-semibold">
          <BookOpen className="w-5 h-5" />
          <span>DriveSchool - Add Lesson Progress</span>
        </div>
        <Link
          to="/lesson-progress"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Add Lesson Progress
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Record a new lesson progress entry
        </p>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student ID *
            </label>
            <input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              placeholder="e.g., S001"
              required
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Student Course ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student Course ID *
            </label>
            <input
              type="text"
              name="student_course_id"
              value={formData.student_course_id}
              onChange={handleInputChange}
              placeholder="e.g., SC001"
              required
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Instructor ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Instructor ID *
            </label>
            <input
              type="text"
              name="instructor_id"
              value={formData.instructor_id}
              onChange={handleInputChange}
              placeholder="e.g., I001"
              required
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Type *
            </label>
            <select
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleInputChange}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Vehicle</option>
              {vehicleTypes.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Lesson Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lesson Number *
            </label>
            <input
              type="number"
              name="lesson_number"
              value={formData.lesson_number}
              onChange={handleInputChange}
              min="1"
              required
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              required
            >
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Feedback */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Instructor Feedback
            </label>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter feedback..."
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              <X size={16} /> Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {loading ? "Adding..." : <><Save size={16} /> Add Lesson</>}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="max-w-4xl mx-auto mt-6 bg-slate-50 border rounded-lg p-4 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Guidelines</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Ensure the Student ID and Instructor ID exist in the system</li>
          <li>Lesson numbers should be sequential for each student</li>
          <li>Duplicate lesson numbers for the same student will be rejected</li>
          <li>Feedback is optional but recommended</li>
          <li>The system will automatically update overall progress</li>
        </ul>
      </div>
    </div>
  );
}
