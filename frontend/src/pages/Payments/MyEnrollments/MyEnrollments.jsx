// src/pages/Payments/MyEnrollments/MyEnrollments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyEnrollments.css';

const MyEnrollments = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock student ID - replace with actual auth
  const studentId = 'S001';

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/studentcourses/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Mock course details since we don't have course API yet
        const enrichedEnrollments = data.courses.map(course => ({
          ...course,
          courseName: `Course ${course.course_id}`,
          coursePrice: Math.floor(Math.random() * 50000) + 10000,
          hasPendingPayment: Math.random() > 0.5
        }));
        setEnrollments(enrichedEnrollments);
      } else {
        setError('Failed to fetch enrollments');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (enrollment) => {
    navigate(`/payments/form/${enrollment._id}`, {
      state: {
        enrollment,
        coursePrice: enrollment.coursePrice,
        courseName: enrollment.courseName
      }
    });
  };

  if (loading) {
    return (
      <div className="enrollments-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your enrollments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enrollments-container">
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchEnrollments} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollments-container">
      <div className="enrollments-header">
        <h1>My Course Enrollments</h1>
        <p>Manage your enrolled courses and payments</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No enrollments found</h3>
          <p>You haven't enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="enrollments-grid">
          {enrollments.map((enrollment) => (
            <div key={enrollment._id} className="enrollment-card">
              <div className="course-header">
                <h3>{enrollment.courseName}</h3>
                <span className={`status-badge ${enrollment.status.toLowerCase()}`}>
                  {enrollment.status}
                </span>
              </div>

              <div className="course-details">
                <div className="detail-item">
                  <span className="label">Course ID:</span>
                  <span className="value">{enrollment.course_id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Enrollment ID:</span>
                  <span className="value">{enrollment.student_course_id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Enrolled Date:</span>
                  <span className="value">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Course Fee:</span>
                  <span className="value price">LKR {enrollment.coursePrice?.toLocaleString()}</span>
                </div>
              </div>

              <div className="card-actions">
                {enrollment.hasPendingPayment ? (
                  <button 
                    className="pay-btn primary"
                    onClick={() => handlePayNow(enrollment)}
                  >
                    💳 Pay Now
                  </button>
                ) : (
                  <button className="pay-btn paid" disabled>
                    ✅ Paid
                  </button>
                )}
                <button 
                  className="history-btn"
                  onClick={() => navigate('/payments/history')}
                >
                  📋 Payment History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="quick-actions">
        <button 
          className="action-btn"
          onClick={() => navigate('/payments/history')}
        >
          <div className="action-icon">📊</div>
          <div>
            <h4>Payment History</h4>
            <p>View all your payments</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MyEnrollments;