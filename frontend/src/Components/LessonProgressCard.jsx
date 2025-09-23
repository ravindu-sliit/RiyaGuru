import { Calendar, Car, MessageSquare, CheckCircle, Clock } from "lucide-react";

export default function LessonProgressCard({ lesson, onEdit, onDelete }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 
      hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 font-bold text-gray-800 text-lg">
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm">
            {lesson.student_id?.slice(0, 2).toUpperCase()}
          </span>
          Lesson #{lesson.lesson_number}
        </div>
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
            lesson.status === "Completed"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {getStatusIcon(lesson.status)}
          {lesson.status}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm text-gray-700 mb-4">
        <p>
          <span className="font-medium">Student:</span> {lesson.student_id}
        </p>
        <p>
          <span className="font-medium">Instructor:</span> {lesson.instructor_id}
        </p>
        <p className="flex items-center gap-2">
          <Car className="w-4 h-4 text-gray-500" />
          {lesson.vehicle_type}
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          {formatDate(lesson.date)}
        </p>
      </div>

      {/* Feedback */}
      {lesson.feedback && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 font-semibold text-gray-700 text-sm mb-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Instructor Feedback
          </div>
          <p className="text-gray-600 text-sm italic">"{lesson.feedback}"</p>
        </div>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 mt-6">
          {onEdit && (
            <button
              onClick={() => onEdit(lesson)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 
              hover:bg-gray-100 transition"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(lesson._id)}
              className="px-4 py-2 text-sm rounded-lg border border-red-500 text-red-600 
              hover:bg-red-50 transition"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
