import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { progressTrackingService } from "../../services/progressTrackingService";
import {
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import ProgressChart from "../../components/ProgressChart";

const ProgressTrackingDashboard = () => {
  const [progressRecords, setProgressRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    eligibleForCertificate: 0,
    certificatesIssued: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    fetchProgressRecords();
  }, []);

  const fetchProgressRecords = async () => {
    try {
      setLoading(true);
      const data = await progressTrackingService.getAllProgress();
      setProgressRecords(data);

      const statsData = {
        totalStudents: data.length,
        eligibleForCertificate: data.filter(
          (p) => p.certificate_status === "Eligible"
        ).length,
        certificatesIssued: data.filter(
          (p) => p.certificate_status === "Issued"
        ).length,
        averageProgress:
          data.length > 0
            ? Math.round(
                data.reduce((sum, p) => sum + p.progress_percent, 0) /
                  data.length
              )
            : 0,
      };
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to fetch progress records");
      console.error("Error fetching progress records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (studentId, courseName) => {
    try {
      await progressTrackingService.manualUpdateProgress(studentId, courseName);
      toast.success("Progress updated successfully");
      fetchProgressRecords();
    } catch (error) {
      toast.error(error.message || "Failed to update progress");
    }
  };

  const handleIssueCertificate = async (studentId, courseName) => {
    try {
      await progressTrackingService.issueCertificate(studentId, courseName);
      toast.success("Certificate issued successfully");
      fetchProgressRecords();
    } catch (error) {
      toast.error(error.message || "Failed to issue certificate");
    }
  };

  const filteredRecords = progressRecords.filter(record => {
  const studentId = record.student_id || "";
  const courseName = record.course_name || "";
  return (
    studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );
});


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full mb-4"></div>
        <p>Loading progress tracking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Progress Tracking Dashboard
        </h1>

        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search students or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter (future use) */}
          <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500">
              Total Students
            </h3>
            <Users className="text-blue-500" size={20} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.totalStudents}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500">
              Eligible for Certificate
            </h3>
            <Award className="text-green-500" size={20} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.eligibleForCertificate}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500">
              Certificates Issued
            </h3>
            <Award className="text-yellow-500" size={20} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.certificatesIssued}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500">
              Average Progress
            </h3>
            <TrendingUp className="text-purple-500" size={20} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.averageProgress}%
          </p>
        </div>
      </div>

      {/* Progress Records */}
      <div className="p-6">
        {filteredRecords.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredRecords.map((record) => (
              <ProgressChart
                key={`${record.student_id}-${record.course_name}`}
                progress={record}
                onUpdateProgress={() =>
                  handleUpdateProgress(record.student_id, record.course_name)
                }
                onIssueCertificate={() =>
                  handleIssueCertificate(record.student_id, record.course_name)
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl text-center text-gray-500 shadow">
            <TrendingUp size={40} className="mx-auto mb-3 text-gray-400" />
            {searchTerm
              ? "No progress records match your search"
              : "No progress records found"}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Certificate Action Banner */}
      {stats.eligibleForCertificate > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">
                Certificate Action Required
              </h3>
              <p className="text-xs text-yellow-700">
                {stats.eligibleForCertificate} student(s) are eligible for
                certificates
              </p>
            </div>
            <Award size={20} className="text-yellow-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTrackingDashboard;
