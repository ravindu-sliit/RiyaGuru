// src/pages/Instructor/InstructorLessonProgressHome.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Users,
  TrendingUp,
  BarChart3,
  ClipboardList,
} from "lucide-react";

export default function InstructorLessonProgressHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-5xl w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Instructor Lesson Progress
          </h1>
          <p className="text-lg text-gray-600">
            Manage lessons, track student progress, and issue certificates.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Lesson Dashboard */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Lesson Dashboard
                </h2>
                <p className="text-gray-600">
                  Overview of all lessons and stats
                </p>
              </div>
            </div>
            <Link
              to="/lesson-progress"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <BarChart3 className="w-5 h-5" />
              View Dashboard
            </Link>
          </div>

          {/* Add Lesson */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-orange-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Plus className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Lesson
                </h2>
                <p className="text-gray-600">
                  Record new lesson progress for students
                </p>
              </div>
            </div>
            <Link
              to="/instructor/lesson-entry"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              <ClipboardList className="w-5 h-5" />
              Add Lesson Progress
            </Link>
          </div>

          {/* View by Student */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-green-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Student Lessons
                </h2>
                <p className="text-gray-600">
                  Manage lessons for each student individually
                </p>
              </div>
            </div>
            <Link
              to="/lesson-progress/students"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
            >
              <Users className="w-5 h-5" />
              View Students
            </Link>
          </div>

          {/* Progress Tracking */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-purple-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Progress Tracking
                </h2>
                <p className="text-gray-600">
                  Monitor course completion & issue certificates
                </p>
              </div>
            </div>
            <Link
              to="/progress-tracking"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <TrendingUp className="w-5 h-5" />
              Track Progress
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>DriveSchool Instructor Panel</p>
        </div>
      </div>
    </div>
  );
}
