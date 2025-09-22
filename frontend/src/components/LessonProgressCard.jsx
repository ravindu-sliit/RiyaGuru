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
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-blue-600">
          Lesson #{lesson.lesson_number}
        </div>
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
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
      <div className="space-y-2 text-sm text-gray-700">
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
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 font-medium text-gray-700 text-sm mb-1">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Instructor Feedback
          </div>
          <p className="text-gray-600 text-sm italic">{lesson.feedback}</p>
        </div>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 mt-4">
          {onEdit && (
            <button
              onClick={() => onEdit(lesson)}
              className="px-3 py-1 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(lesson._id)}
              className="px-3 py-1 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
