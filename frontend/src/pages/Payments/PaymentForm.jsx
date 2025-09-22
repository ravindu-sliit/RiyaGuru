import React, { useState, useEffect } from 'react';
import './PaymentForm.css';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    courseName: '',
    amount: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    description: ''
  });

  const [studentCourses, setStudentCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch student courses on component mount
  useEffect(() => {
    fetchStudentCourses();
  }, []);

  const fetchStudentCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student-courses');
      const data = await response.json();
      if (data.success) {
        setStudentCourses(data.data);
        // Auto-fill first student course if available
        if (data.data.length > 0) {
          const firstCourse = data.data[0];
          setFormData(prev => ({
            ...prev,
            studentId: firstCourse.studentId,
            courseId: firstCourse.courseId,
            courseName: firstCourse.courseName,
            amount: firstCourse.price
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching student courses:', error);
      setMessage({ type: 'error', text: 'Failed to load student courses' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseSelect = (e) => {
    const selectedCourseId = e.target.value;
    const selectedCourse = studentCourses.find(course => course.courseId === selectedCourseId);
    
    if (selectedCourse) {
      setFormData(prev => ({
        ...prev,
        courseId: selectedCourse.courseId,
        courseName: selectedCourse.courseName,
        amount: selectedCourse.price,
        studentId: selectedCourse.studentId
      }));
    }
  };

  const validateForm = () => {
    if (!formData.studentId || !formData.courseId || !formData.amount) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return false;
    }

    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardHolderName) {
        setMessage({ type: 'error', text: 'Please fill in all card details' });
        return false;
      }

      // Basic card number validation (should be 16 digits)
      if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        setMessage({ type: 'error', text: 'Card number must be 16 digits' });
        return false;
      }

      // CVV validation (3 or 4 digits)
      if (formData.cvv.length < 3 || formData.cvv.length > 4) {
        setMessage({ type: 'error', text: 'CVV must be 3 or 4 digits' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const paymentData = {
        studentId: formData.studentId,
        courseId: formData.courseId,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        description: formData.description || `Payment for ${formData.courseName}`,
        cardDetails: formData.paymentMethod === 'credit_card' ? {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardHolderName: formData.cardHolderName
        } : null
      };

      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Payment processed successfully!' });
        // Reset form
        setFormData({
          studentId: '',
          courseId: '',
          courseName: '',
          amount: '',
          paymentMethod: 'credit_card',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolderName: '',
          description: ''
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Payment failed' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Payment Portal</h2>
          <p>Secure payment for your driving course</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form">
          {/* Course Selection Section */}
          <div className="form-section">
            <h3>Course Information</h3>
            
            <div className="form-group">
              <label htmlFor="courseSelect">Select Course</label>
              <select
                id="courseSelect"
                value={formData.courseId}
                onChange={handleCourseSelect}
                required
              >
                <option value="">Select a course</option>
                {studentCourses.map((course) => (
                  <option key={course._id} value={course.courseId}>
                    {course.courseName} - Student ID: {course.studentId}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="studentId">Student ID</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  readOnly
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="courseName">Course Name</label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  readOnly
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (LKR)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="form-section">
            <h3>Payment Method</h3>
            
            <div className="payment-methods">
              <label className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={formData.paymentMethod === 'credit_card'}
                  onChange={handleInputChange}
                />
                <span>Credit Card</span>
              </label>
              
              <label className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="debit_card"
                  checked={formData.paymentMethod === 'debit_card'}
                  onChange={handleInputChange}
                />
                <span>Debit Card</span>
              </label>
              
              <label className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={formData.paymentMethod === 'bank_transfer'}
                  onChange={handleInputChange}
                />
                <span>Bank Transfer</span>
              </label>
            </div>
          </div>

          {/* Card Details Section */}
          {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') && (
            <div className="form-section">
              <h3>Card Details</h3>
              
              <div className="form-group">
                <label htmlFor="cardHolderName">Card Holder Name</label>
                <input
                  type="text"
                  id="cardHolderName"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={handleInputChange}
                  placeholder="Enter full name as on card"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="month"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="description">Payment Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional notes about this payment"
                rows="3"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay LKR ${formData.amount || '0.00'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;