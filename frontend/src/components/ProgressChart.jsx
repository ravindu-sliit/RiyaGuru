import { TrendingUp, Award, BookOpen } from "lucide-react";

export default function ProgressChart({ progress, onUpdateProgress, onIssueCertificate }) {
  const getCertificateStatusStyles = (status) => {
    switch (status) {
      case "Eligible":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Issued":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const getCertificateStatusText = (status) => {
    switch (status) {
      case "Eligible":
        return "✅ Eligible for Certificate";
      case "Issued":
        return "🎓 Certificate Issued";
      default:
        return "Not Eligible";
    }
  };

  const getCertificateIcon = (status) => {
    switch (status) {
      case "Eligible":
      case "Issued":
        return <Award className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 flex flex-col gap-4 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {progress.course_name} — {progress.student_id}
          </h3>
          <div
            className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getCertificateStatusStyles(
              progress.certificate_status
            )}`}
          >
            {getCertificateIcon(progress.certificate_status)}
            {getCertificateStatusText(progress.certificate_status)}
          </div>
        </div>

        <div className="flex gap-2">
          {onUpdateProgress && (
            <button
              onClick={onUpdateProgress}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition"
            >
              <TrendingUp className="w-4 h-4" />
              Update
            </button>
          )}
          {onIssueCertificate && progress.certificate_status === "Eligible" && (
            <button
              onClick={onIssueCertificate}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              <Award className="w-4 h-4" />
              Issue
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress.progress_percent}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>
            {progress.completed_lessons} of {progress.total_lessons} lessons
          </span>
          <span className="font-semibold">{progress.progress_percent}%</span>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-right text-xs text-gray-500">
        Last updated:{" "}
        {new Date(progress.updated_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
