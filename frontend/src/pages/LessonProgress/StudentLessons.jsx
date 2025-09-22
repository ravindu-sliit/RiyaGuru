import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { lessonProgressService } from "../../services/lessonProgressService";
import { BookOpen, ArrowLeft, User, Filter } from "lucide-react";
import { toast } from "react-toastify";
import LessonProgressCard from "../../components/LessonProgressCard";

export default function StudentLessons() {
  const { studentId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterVehicle, setFilterVehicle] = useState("All");

  useEffect(() => {
    if (studentId) fetchStudentLessons();
  }, [studentId]);

  async function fetchStudentLessons() {
    try {
      setLoading(true);
      const data = await lessonProgressService.getLessonsByStudent(studentId);
      setLessons(data);
    } catch (error) {
      toast.error("Failed to fetch student lessons");
      console.error("Error fetching student lessons:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteLesson(lessonId) {
    if (!window.confirm("Are you sure you want to delete this lesson progress?"))
      return;

    try {
      await lessonProgressService.deleteLessonProgress(lessonId);
      toast.success("Lesson progress deleted successfully");
      fetchStudentLessons();
    } catch (error) {
      toast.error("Failed to delete lesson progress");
    }
  }

  // Apply filters
  const filteredLessons = lessons.filter((lesson) => {
    const statusMatch =
      filterStatus === "All" || lesson.status === filterStatus;
    const vehicleMatch =
      filterVehicle === "All" || lesson.vehicle_type === filterVehicle;
    return statusMatch && vehicleMatch;
  });

  const uniqueVehicleTypes = [...new Set(lessons.map((l) => l.vehicle_type))];
  const statusOptions = ["All", "Completed", "Pending"];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <div className="animate-spin h-10 w-10 border-4 border-blue-300 border-t-blue-600 rounded-full mb-4"></div>
        <p>Loading student lessons...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav Header */}
      <div className="bg-white shadow flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2 text-blue-600 font-semibold">
          <BookOpen className="w-5 h-5" />
          <span>DriveSchool - Student Lessons</span>
        </div>
        <Link
          to="/lesson-progress"
          className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="px-6 py-6 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <User className="w-6 h-6 text-gray-600" />
            Student {studentId} - Lessons
          </h1>
          <p className="text-gray-600 text-sm">
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} recorded
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mt-4 md:mt-0 items-center">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm"
          >
            <option value="All">All Vehicles</option>
            {uniqueVehicleTypes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary per vehicle */}
      <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {uniqueVehicleTypes.map((vehicleType) => {
          const vehicleLessons = lessons.filter(
            (l) => l.vehicle_type === vehicleType
          );
          const completed = vehicleLessons.filter(
            (l) => l.status === "Completed"
          ).length;

          return (
            <div
              key={vehicleType}
              className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500"
            >
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {vehicleType}
              </h3>
              <p className="text-xs text-gray-500">
                {completed} of {vehicleLessons.length} completed
              </p>
            </div>
          );
        })}
      </div>

      {/* Lessons List */}
      <div className="px-6 pb-10">
        {filteredLessons.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredLessons
              .sort((a, b) => a.lesson_number - b.lesson_number)
              .map((lesson) => (
                <LessonProgressCard
                  key={lesson._id}
                  lesson={lesson}
                  onDelete={handleDeleteLesson}
                />
              ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
            <BookOpen className="mx-auto mb-3 text-gray-400" size={40} />
            <p>
              {filterStatus !== "All" || filterVehicle !== "All"
                ? "No lessons match the selected filters"
                : "No lessons recorded for this student yet"}
            </p>
            {(filterStatus !== "All" || filterVehicle !== "All") && (
              <button
                onClick={() => {
                  setFilterStatus("All");
                  setFilterVehicle("All");
                }}
                className="mt-4 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
