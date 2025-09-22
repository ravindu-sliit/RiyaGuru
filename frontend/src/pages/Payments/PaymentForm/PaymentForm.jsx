// src/pages/Payments/PaymentForm/PaymentForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './PaymentForm.css';

const PaymentForm = () => {
  const { enrollmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'Full',
    paymentMethod: 'Card',
    slipURL: '',
    cardDetails: {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadingSlip, setUploadingSlip] = useState(false);

  // Get enrollment data from navigation state
  const enrollment = location.state?.enrollment;
  const coursePrice = location.state?.coursePrice || 0;
  const courseName = location.state?.courseName || '';

  useEffect(() => {
    if (enrollment && coursePrice) {
      setFormData(prev => ({
        ...prev,
        amount: coursePrice
      }));
    }
  }, [enrollment, coursePrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('card.')) {
      const cardField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        cardDetails: {
          ...prev.cardDetails,
          [cardField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingSlip(true);
    // Mock file upload - replace with actual upload logic
    setTimeout(() => {
      const mockURL = `https://storage.example.com/slips/${Date.now()}_${file.name}`;
      setFormData(prev => ({ ...prev, slipURL: mockURL }));
      setUploadingSlip(false);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const paymentData = {
        studentCourseId: enrollmentId,
        amount: parseFloat(formData.amount),
        paymentType: formData.paymentType,
        paymentMethod: formData.paymentMethod,
        slipURL: formData.slipURL,
        ...(formData.paymentMethod === 'Card' && {
          cardDetails: formData.cardDetails
        })
      };

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        setSuccess(true);
        
        // If installment payment, redirect to installment plan
        if (formData.paymentType === 'Installment') {
          setTimeout(() => {
            navigate(`/payments/installment/${enrollmentId}`, {
              state: { enrollment, coursePrice, courseName }
            });
          }, 2000);
        } else {
          setTimeout(() => {
            navigate('/payments/history');
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Payment failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="payment-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Payment Submitted Successfully!</h2>
          <p>Your payment has been submitted for review.</p>
          <div className="success-details">
            <p><strong>Amount:</strong> LKR {formData.amount?.toLocaleString()}</p>
            <p><strong>Type:</strong> {formData.paymentType}</p>
            <p><strong>Method:</strong> {formData.paymentMethod}</p>
          </div>
          {formData.paymentType === 'Installment' ? (
            <p className="redirect-msg">Redirecting to installment plan setup...</p>
          ) : (
            <p className="redirect-msg">Redirecting to payment history...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/payments/enrollments')}
        >
          ← Back to Enrollments
        </button>
        <h1>Payment Form</h1>
        <p>Complete your course payment</p>
      </div>

      <div className="payment-content">
        <div className="course-summary">
          <h3>Course Summary</h3>
          <div className="summary-item">
            <span>Course:</span>
            <span>{courseName}</span>
          </div>
          <div className="summary-item">
            <span>Enrollment ID:</span>
            <span>{enrollment?.student_course_id}</span>
          </div>
          <div className="summary-item total">
            <span>Total Amount:</span>
            <span>LKR {coursePrice?.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Payment Type</label>
            <div className="payment-type-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  name="paymentType"
                  value="Full"
                  checked={formData.paymentType === 'Full'}
                  onChange={handleInputChange}
                />
                <div className="radio-card">
                  <h4>Full Payment</h4>
                  <p>Pay the complete amount now</p>
                  <span className="amount">LKR {coursePrice?.toLocaleString()}</span>
                </div>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="paymentType"
                  value="Installment"
                  checked={formData.paymentType === 'Installment'}
                  onChange={handleInputChange}
                />
                <div className="radio-card">
                  <h4>Installment Payment</h4>
                  <p>Pay in monthly installments</p>
                  <span className="amount">Down payment required</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Payment Amount (LKR)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="1000"
              max={coursePrice}
              required
              className="amount-input"
            />
            {formData.paymentType === 'Installment' && (
              <small>Enter your down payment amount (minimum LKR 1,000)</small>
            )}
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="method-select"
            >
              <option value="Card">Credit/Debit Card</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cash">Cash Payment</option>
            </select>
          </div>

          {formData.paymentMethod === 'Card' && (
            <div className="card-details">
              <h4>Card Details</h4>
              <div className="card-grid">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="card.cardNumber"
                    value={formData.cardDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cardHolder">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardHolder"
                    name="card.cardHolder"
                    value={formData.cardDetails.cardHolder}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="card.expiryDate"
                    value={formData.cardDetails.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="card.cvv"
                    value={formData.cardDetails.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {(formData.paymentMethod === 'Bank' || formData.paymentMethod === 'Cash') && (
            <div className="form-group">
              <label htmlFor="paymentSlip">Upload Payment Slip</label>
              <div className="file-upload">
                <input
                  type="file"
                  id="paymentSlip"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <div className="file-upload-area">
                  {uploadingSlip ? (
                    <div className="uploading">
                      <div className="upload-spinner"></div>
                      <p>Uploading...</p>
                    </div>
                  ) : formData.slipURL ? (
                    <div className="uploaded">
                      <span className="check-icon">✅</span>
                      <p>Payment slip uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <span className="upload-icon">📎</span>
                      <p>Click to upload payment slip</p>
                      <small>Supports JPG, PNG, PDF (max 5MB)</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">
                <div className="btn-spinner"></div>
                Processing...
              </span>
            ) : (
              `Submit Payment - LKR ${formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;