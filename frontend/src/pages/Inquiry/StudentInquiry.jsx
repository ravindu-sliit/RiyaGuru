import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import InquiryForm from "./InquiryForm";
import { create as createInquiry } from "../../services/inquiryAPI";
import ProgressHero from "../../components/ProgressHero";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const StudentInquiry = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  // Fetch student and user information on mount
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const studentId = localStorage.getItem("rg_userId");
        if (!studentId) {
          showNotification("Please log in to submit an inquiry", "error");
          setLoadingStudent(false);
          return;
        }

        const token = localStorage.getItem("rg_token");
        
        // Fetch student details
        const studentResponse = await fetch(`${API_BASE}/api/students/${studentId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!studentResponse.ok) {
          throw new Error("Failed to fetch student information");
        }

        const studentData = await studentResponse.json();
        
        // Fetch user record to get MongoDB _id
        const userResponse = await fetch(`${API_BASE}/api/users?userId=${studentId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user information");
        }

        const userData = await userResponse.json();
        const user = userData.users?.find(u => u.userId === studentId) || userData;
        
        // Combine student and user data
        setStudentInfo({
          ...studentData.student,
          userMongoId: user._id || user.id, // MongoDB ObjectId for inquiry
        });
      } catch (err) {
        console.error("Error fetching student info:", err);
        showNotification("Failed to load student information", "error");
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudentInfo();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      await createInquiry(payload);
      showNotification("Inquiry submitted successfully");
    } catch (err) {
      showNotification(err?.message || "Failed to submit inquiry", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingStudent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 pt-6">
          <ProgressHero
            title="Inquiries"
            subtitle="Submit your inquiry"
            icon={<BookOpen className="w-8 h-8 text-white" />}
          />
        </div>
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-6">
        <ProgressHero
          title="Inquiries"
          subtitle="Submit your inquiry"
          icon={<BookOpen className="w-8 h-8 text-white" />}
        />
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {notification.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <InquiryForm
            item={null}
            users={[]}
            onSubmit={handleSubmit}
            onCancel={() => { /* no list for students */ }}
            hideCancel
            loading={loading}
            studentInfo={studentInfo}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentInquiry;
