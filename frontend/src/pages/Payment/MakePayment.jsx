import React, { useState, useEffect } from "react";
import { StudentCourseAPI } from "../../api/studentCourseApi";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  AlertCircle,
  Loader2,
  DollarSign,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const MakePayment = () => {
  const [studentCourses, setStudentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPending, setTotalPending] = useState(0);
  const navigate = useNavigate();

  const studentId = localStorage.getItem("rg_userId");

  useEffect(() => {
    if (!studentId) {
      setError("No student ID found. Please log in again.");
      setLoading(false);
      return;
    }
    fetchStudentCourses();
  }, [studentId]);

  const fetchStudentCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await StudentCourseAPI.getByStudentId(studentId);

      // Handle different response structures
      let coursesData = response;
      if (response.data) {
        coursesData = response.data;
      } else if (Array.isArray(response)) {
        coursesData = response;
      }

      setStudentCourses(coursesData || []);

      // Calculate total pending payments
      const pending = (coursesData || []).reduce((total, course) => {
        // Handle different property names for pending amount
        const pendingAmount = course.courseData?.[0]?.price ?? 0;
        const amountNum = parseFloat(String(pendingAmount)) || 0;
        console.log(`Pending amount ${amountNum}`);
        return total + amountNum;
      }, 0);

      setTotalPending(pending);
    } catch (err) {
      console.error("Error fetching student courses:", err);

      // More detailed error handling
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const message =
          err.response.data?.message ||
          err.response.data?.error ||
          "Server error";

        if (status === 401) {
          setError("Session expired. Please log in again.");
        } else if (status === 403) {
          setError("You don't have permission to access this information.");
        } else if (status === 404) {
          setError("No courses found for this student.");
        } else {
          setError(`Error ${status}: ${message}`);
        }
      } else if (err.request) {
        // Network error
        setError("Network error. Please check your connection and try again.");
      } else {
        // Other error
        setError("Failed to load payment information. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayCourse = (course) => {
    const amount = parseFloat(String(course?.courseData?.[0]?.price ?? 0)) || 0;
    const courseName =
      course.courseName ||
      course.course_name ||
      course.title ||
      `Course #${course.courseId || course.course_id || course.id}`;
    const courseId = course.courseId || course.course_id || course.id;

    navigate(
      `/create-payment?totalAmount=${amount}&courseName=${encodeURIComponent(
        courseName
      )}&courseId=${courseId}`
    );
    console.log(
      `Navigate to: /create-payment?totalAmount=${amount}&courseName=${encodeURIComponent(
        courseName
      )}&courseId=${courseId}`
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            Loading payment information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchStudentCourses}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8" style={{ color: "#F47C20" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#0A1A2F" }}>
              Payment Center
            </h1>
          </div>
          <p className="text-gray-600">
            Manage your course payments and outstanding balances
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Payment Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#F47C20" }}
              >
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0A1A2F" }}>
                  Total Outstanding
                </h2>
                <p className="text-gray-600">Amount due for enrolled courses</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold" style={{ color: "#F47C20" }}>
                {formatCurrency(totalPending)}
              </div>
              <p className="text-gray-500 mt-1">
                {studentCourses.length} course
                {studentCourses.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="space-y-4">
          <h3
            className="text-xl font-semibold mb-4"
            style={{ color: "#0A1A2F" }}
          >
            Course Breakdown
          </h3>

          {studentCourses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Enrolled Courses
              </h3>
              <p className="text-gray-500">
                You don't have any enrolled courses at the moment.
              </p>
            </div>
          ) : (
            studentCourses.map((course, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen
                        className="w-6 h-6"
                        style={{ color: "#2D74C4" }}
                      />
                    </div>
                    <div>
                      <h4
                        className="font-semibold text-lg"
                        style={{ color: "#0A1A2F" }}
                      >
                        {course.courseName ||
                          course.course_name ||
                          course.title ||
                          `Course #${
                            course.courseId || course.course_id || course.id
                          }`}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Course ID:{" "}
                          {course.courseId ||
                            course.course_id ||
                            course.id ||
                            "N/A"}
                        </span>
                        {(course.enrollmentDate ||
                          course.enrollment_date ||
                          course.created_at) && (
                          <span className="text-sm text-gray-500">
                            Enrolled:{" "}
                            {new Date(
                              course.enrollmentDate ||
                                course.enrollment_date ||
                                course.created_at
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {(() => {
                        const pendingAmount = course.courseData?.[0]?.price ?? 0;
                        const amount = parseFloat(String(pendingAmount)) || 0;
                        return (
                          <>
                            <div
                              className="text-xl font-bold"
                              style={{
                                color: amount > 0 ? "#F47C20" : "#28A745",
                              }}
                            >
                              {formatCurrency(amount)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  amount > 0 ? "bg-orange-400" : "bg-green-400"
                                }`}
                              ></div>
                              <span
                                className={`text-sm font-medium ${
                                  amount > 0
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}
                              >
                                {amount > 0 ? "Pending" : "Paid"}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    {(() => {
                      const amount = parseFloat(String(course.courseData?.[0]?.price ?? 0)) || 0;
                      return amount > 0 ? (
                        <button
                          onClick={() => handlePayCourse(course)}
                          className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay Now
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <div className="bg-green-100 text-green-800 font-semibold py-3 px-6 rounded-xl flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          Paid
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4" style={{ color: "#2D74C4" }} />
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: "#0A1A2F" }}>
                Secure Payment
              </h4>
              <p className="text-sm text-gray-600">
                Your payment information is protected with bank-level security.
                All transactions are encrypted and processed securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;
