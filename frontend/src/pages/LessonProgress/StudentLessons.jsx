// src/pages/LessonProgress/StudentLessons.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { lessonProgressService } from "../../services/lessonProgressService";
import {
  BookOpen,
  ArrowLeft,
  User,
  Filter,
} from "lucide-react";
import InstructorNav from "../../components/InstructorNav";
import { toast } from "react-toastify";
import LessonProgressCard from "../../components/LessonProgressCard";
import ProgressHero from "../../components/ProgressHero";

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

  // Filters
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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-600">
        <div className="animate-spin h-12 w-12 border-4 border-orange-200 border-t-orange-500 rounded-full mb-4"></div>
        <p className="font-medium">Loading student lessons...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <InstructorNav />
      <ProgressHero title={`Student ${studentId} - Lessons`} subtitle={`${lessons.length} lesson${lessons.length !== 1 ? "s" : ""} recorded`}>
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
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
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="All">All Vehicles</option>
            {uniqueVehicleTypes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </ProgressHero>

      {/* Summary per vehicle */}
      {uniqueVehicleTypes.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition transform hover:-translate-y-1"
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
      )}

      {/* Lessons List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
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
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500 border border-gray-100">
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
