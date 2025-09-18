import ProgressTracking from "../models/ProgressTracking.js";
import LessonProgress from "../models/LessonProgress.js";

export const updateProgress = async (studentCourseId) => {
  const totalLessons = await LessonProgress.countDocuments({ student_id: studentCourseId });
  const completedLessons = await LessonProgress.countDocuments({ 
    student_id: studentCourseId, 
    status: "Completed" 
  });

  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  let progress = await ProgressTracking.findOne({ student_course_id: studentCourseId });
  if (progress) {
    progress.completed_lessons = completedLessons;
    progress.progress_percent = progressPercent;
    progress.updated_at = new Date();
  } else {
    progress = new ProgressTracking({
      student_course_id: studentCourseId,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      progress_percent: progressPercent
    });
  }

  progress.certificate_status = progressPercent === 100 ? "Eligible" : "NotEligible";

  await progress.save();
  return progress;
};
