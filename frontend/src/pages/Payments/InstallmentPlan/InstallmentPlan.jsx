// src/pages/Payments/InstallmentPlan/InstallmentPlan.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './InstallmentPlan.css';

const InstallmentPlan = () => {
  const { enrollmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    totalInstallments: 3,
    downPayment: 0,
    startDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState([]);

  const enrollment = location.state?.enrollment;
  const coursePrice = location.state?.coursePrice || 0;
  const courseName = location.state?.courseName || '';
  const studentId = 'S001'; // Replace with actual auth

  useEffect(() => {
    if (coursePrice) {
      const defaultDown = Math.floor(coursePrice * 0.2); // 20% down payment
      setFormData(prev => ({
        ...prev,
        downPayment: defaultDown,
        startDate: new Date().toISOString().split('T')[0]
      }));
      calculateSchedule(defaultDown, 3);
    }
  }, [coursePrice]);

  const calculateSchedule = (downPayment, installments) => {
    const remainingAmount = coursePrice - downPayment;
    const monthlyAmount = remainingAmount / installments;
    const startDate = new Date(formData.startDate || new Date());
    
    const newSchedule = [];
    for (let i = 1; i <= installments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      newSchedule.push({
        installmentNumber: i,
        amount: monthlyAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Pending'
      });
    }
    setSchedule(newSchedule);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalInstallments' ? parseInt(value) : 
              name === 'downPayment' ? parseFloat(value) : value
    }));

    if (name === 'totalInstallments' || name === 'downPayment') {
      const installments = name === 'totalInstallments' ? parseInt(value) : formData.totalInstallments;
      const downPayment = name === 'downPayment' ? parseFloat(value) : formData.downPayment;
      calculateSchedule(downPayment, installments);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const planData = {
        studentId,
        courseId: enrollment?.course_id,
        totalAmount: coursePrice,
        downPayment: formData.downPayment,
        totalInstallments: formData.totalInstallments,
        startDate: formData.startDate
      };

      const response = await fetch('/api/installments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(planData)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/payments/history');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create installment plan');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="installment-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Installment Plan Created Successfully!</h2>
          <p>Your payment plan has been set up.</p>
          <div className="plan-summary">
            <p><strong>Down Payment:</strong> LKR {formData.downPayment?.toLocaleString()}</p>
            <p><strong>Monthly Installments:</strong> {formData.totalInstallments}</p>
            <p><strong>Monthly Amount:</strong> LKR {((coursePrice - formData.downPayment) / formData.totalInstallments).toLocaleString()}</p>
          </div>
          <p className="redirect-msg">Redirecting to payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="installment-container">
      <div className="installment-header">
        <button 
          className="back-btn"
          onClick={() => navigate(`/payments/form/${enrollmentId}`, { 
            state: { enrollment, coursePrice, courseName }
          })}
        >
          ← Back to Payment
        </button>
        <h1>Setup Installment Plan</h1>
        <p>Configure your payment schedule</p>
      </div>

      <div className="installment-content">
        <div className="plan-summary">
          <h3>Course Details</h3>
          <div className="summary-item">
            <span>Course:</span>
            <span>{courseName}</span>
          </div>
          <div className="summary-item">
            <span>Total Amount:</span>
            <span>LKR {coursePrice?.toLocaleString()}</span>
          </div>
          <div className="summary-item highlight">
            <span>Down Payment:</span>
            <span>LKR {formData.downPayment?.toLocaleString()}</span>
          </div>
          <div className="summary-item highlight">
            <span>Remaining:</span>
            <span>LKR {(coursePrice - formData.downPayment)?.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="installment-form">
          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="downPayment">Down Payment (LKR)</label>
            <input
              type="number"
              id="downPayment"
              name="downPayment"
              value={formData.downPayment}
              onChange={handleInputChange}
              min={coursePrice * 0.1}
              max={coursePrice * 0.8}
              step="1000"
              required
              className="amount-input"
            />
            <small>Minimum 10% - Maximum 80% of course fee</small>
          </div>

          <div className="form-group">
            <label htmlFor="totalInstallments">Number of Installments</label>
            <select
              id="totalInstallments"
              name="totalInstallments"
              value={formData.totalInstallments}
              onChange={handleInputChange}
              className="installment-select"
            >
              <option value={2}>2 Months</option>
              <option value={3}>3 Months</option>
              <option value={4}>4 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Payment Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="date-input"
            />
            <small>First installment will be due one month from this date</small>
          </div>

          <div className="payment-schedule">
            <h3>Payment Schedule Preview</h3>
            <div className="schedule-grid">
              <div className="schedule-header">
                <span>Installment</span>
                <span>Amount</span>
                <span>Due Date</span>
                <span>Status</span>
              </div>
              
              <div className="schedule-item down-payment">
                <span className="installment-num">Down Payment</span>
                <span className="amount">LKR {formData.downPayment?.toLocaleString()}</span>
                <span className="due-date">Today</span>
                <span className="status pending">Required Now</span>
              </div>

              {schedule.map((item, index) => (
                <div key={index} className="schedule-item">
                  <span className="installment-num">#{item.installmentNumber}</span>
                  <span className="amount">LKR {item.amount?.toLocaleString()}</span>
                  <span className="due-date">{new Date(item.dueDate).toLocaleDateString()}</span>
                  <span className="status pending">Pending</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="create-plan-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">
                <div className="btn-spinner"></div>
                Creating Plan...
              </span>
            ) : (
              'Create Installment Plan'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstallmentPlan;