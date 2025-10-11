import { Calendar, Car, MessageSquare, CheckCircle, Clock, User } from "lucide-react";

export default function LessonProgressCard({ lesson, onEdit, onDelete }) {
  const getStatusBadge = (status) => {
    if (status === "Completed")
      return <div className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">{status}</div>;
    if (status === "Pending")
      return <div className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">{status}</div>;
    return <div className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">{status}</div>;
  };

  const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-bold text-gray-800">Lesson #{lesson.lesson_number}</h4>
              {getStatusBadge(lesson.status)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Course: <span className="font-medium text-gray-700">{lesson.vehicle_type}</span></div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">Student</div>
          <div className="font-semibold text-gray-800">{lesson.student_id}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <span className="font-medium text-gray-700">Instructor:</span>
          <span className="text-gray-600">{lesson.instructor_id}</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span className="font-medium text-gray-700">Date:</span>
          <span className="text-gray-600">{formatDateTime(lesson.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Course ID:</span>
          <span className="text-gray-600">{lesson.student_course_id}</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <span className="font-medium text-gray-700">Status:</span>
          <span className="text-gray-600">{lesson.status}</span>
        </div>
      </div>

      {lesson.feedback && (
        <div className="mt-4 p-4 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
          <div className="flex items-center gap-2 font-semibold text-indigo-700 text-sm mb-1">
            <MessageSquare className="w-4 h-4" />
            Instructor Feedback
          </div>
          <p className="text-sm italic">{lesson.feedback}</p>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        {onEdit && (
          <button
            onClick={() => onEdit(lesson)}
            className="px-4 py-2 text-sm rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition"
          >
            View
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(lesson._id)}
            className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
