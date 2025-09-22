// src/pages/Payments/AdminPayments/AdminPayments.jsx
import React, { useState, useEffect } from 'react';
import './AdminPayments.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const queryParams = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/admin/payments${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Mock data for demo since we don't have admin endpoint
        const mockPayments = [
          {
            _id: '673f2a1b4c8d9e1234567890',
            studentId: 'S001',
            studentCourseId: 'SC001',
            amount: 45000,
            paymentType: 'Full',
            paymentMethod: 'Card',
            status: 'Pending',
            createdAt: '2024-11-21T10:30:00Z',
            transactionId: 'TXN123456789',
            cardDetails: {
              cardNumber: '**** **** **** 1234',
              cardHolder: 'John Doe'
            }
          },
          {
            _id: '673f2a1b4c8d9e1234567891',
            studentId: 'S002',
            studentCourseId: 'SC002',
            amount: 15000,
            paymentType: 'Installment',
            paymentMethod: 'Bank',
            status: 'Approved',
            createdAt: '2024-11-20T15:45:00Z',
            paidDate: '2024-11-20T16:00:00Z',
            slipURL: 'https://example.com/slip-123.jpg',
            adminComment: 'Payment verified successfully'
          },
          {
            _id: '673f2a1b4c8d9e1234567892',
            studentId: 'S003',
            studentCourseId: 'SC003',
            amount: 25000,
            paymentType: 'Full',
            paymentMethod: 'Cash',
            status: 'Rejected',
            createdAt: '2024-11-19T09:15:00Z',
            adminComment: 'Insufficient payment slip documentation'
          }
        ];
        setPayments(mockPayments);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId, action) => {
    setActionLoading(true);
    try {
      const endpoint = `/api/admin/payments/${paymentId}/${action}`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ adminComment })
      });

      if (response.ok) {
        await fetchPayments(); // Refresh the list
        setSelectedPayment(null);
        setAdminComment('');
        // Show success notification
      } else {
        setError(`Failed to ${action} payment`);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'pending', text: 'Pending Review' },
      'Approved': { class: 'approved', text: 'Approved' },
      'Rejected': { class: 'rejected', text: 'Rejected' }
    };
    return statusConfig[status] || statusConfig['Pending'];
  };

  const filteredPayments = payments.filter(payment => 
    filter === 'all' || payment.status === filter
  );

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Payment Management</h1>
        <p>Review and manage student payments</p>
      </div>

      <div className="admin-content">
        <div className="admin-filters">
          <div className="filter-tabs">
            {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All Payments' : status}
                <span className="count">
                  ({status === 'all' ? payments.length : payments.filter(p => p.status === status).length})
                </span>
              </button>
            ))}
          </div>
          <button onClick={fetchPayments} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const status = getStatusBadge(payment.status);
                return (
                  <tr key={payment._id}>
                    <td className="payment-id">#{payment._id.slice(-8)}</td>
                    <td>{payment.studentId}</td>
                    <td>{payment.studentCourseId}</td>
                    <td className="amount">LKR {payment.amount?.toLocaleString()}</td>
                    <td>
                      <span className={`type-badge ${payment.paymentType.toLowerCase()}`}>
                        {payment.paymentType}
                      </span>
                    </td>
                    <td>{payment.paymentMethod}</td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="view-btn"
                        >
                          👁️ View
                        </button>
                        {payment.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handlePaymentAction(payment._id, 'approve')}
                              className="approve-btn"
                              disabled={actionLoading}
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handlePaymentAction(payment._id, 'reject')}
                              className="reject-btn"
                              disabled={actionLoading}
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <div className="empty-table">
              <p>No payments found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Details</h3>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Payment ID:</span>
                  <span className="value">#{selectedPayment._id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Student ID:</span>
                  <span className="value">{selectedPayment.studentId}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Course ID:</span>
                  <span className="value">{selectedPayment.studentCourseId}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Amount:</span>
                  <span className="value amount">LKR {selectedPayment.amount?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Payment Type:</span>
                  <span className="value">{selectedPayment.paymentType}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Payment Method:</span>
                  <span className="value">{selectedPayment.paymentMethod}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className={`value status ${selectedPayment.status.toLowerCase()}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Created:</span>
                  <span className="value">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                </div>
                {selectedPayment.paidDate && (
                  <div className="detail-item">
                    <span className="label">Paid Date:</span>
                    <span className="value">{new Date(selectedPayment.paidDate).toLocaleString()}</span>
                  </div>
                )}
                {selectedPayment.transactionId && (
                  <div className="detail-item">
                    <span className="label">Transaction ID:</span>
                    <span className="value transaction-id">{selectedPayment.transactionId}</span>
                  </div>
                )}
              </div>

              {selectedPayment.cardDetails && (
                <div className="card-details-section">
                  <h4>Card Details</h4>
                  <div className="card-info">
                    <p><strong>Card Number:</strong> {selectedPayment.cardDetails.cardNumber}</p>
                    <p><strong>Cardholder:</strong> {selectedPayment.cardDetails.cardHolder}</p>
                  </div>
                </div>
              )}

              {selectedPayment.slipURL && (
                <div className="slip-section">
                  <h4>Payment Slip</h4>
                  <a href={selectedPayment.slipURL} target="_blank" rel="noopener noreferrer" className="slip-link">
                    📎 View Payment Slip
                  </a>
                </div>
              )}

              {selectedPayment.adminComment && (
                <div className="comment-section">
                  <h4>Admin Comment</h4>
                  <p className="existing-comment">{selectedPayment.adminComment}</p>
                </div>
              )}

              {selectedPayment.status === 'Pending' && (
                <div className="admin-actions">
                  <div className="comment-input">
                    <label htmlFor="adminComment">Admin Comment:</label>
                    <textarea
                      id="adminComment"
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Add a comment (optional)"
                      rows="3"
                    />
                  </div>
                  
                  <div className="action-buttons">
                    <button
                      onClick={() => handlePaymentAction(selectedPayment._id, 'approve')}
                      className="approve-btn"
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : '✅ Approve Payment'}
                    </button>
                    <button
                      onClick={() => handlePaymentAction(selectedPayment._id, 'reject')}
                      className="reject-btn"
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : '❌ Reject Payment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;