// src/pages/Payments/PaymentHistory/PaymentHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    status: 'all',
    dateRange: '30'
  });

  const studentId = 'S001'; // Replace with actual auth

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filter.status !== 'all') {
        queryParams.append('status', filter.status);
      }
      
      if (filter.dateRange !== 'all') {
        const days = parseInt(filter.dateRange);
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        queryParams.append('from', fromDate.toISOString());
      }

      const response = await fetch(`/api/payments?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        setError('Failed to fetch payment history');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const response = await fetch(`/api/receipts/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'pending', icon: '⏳', text: 'Pending Review' },
      'Approved': { class: 'approved', icon: '✅', text: 'Approved' },
      'Rejected': { class: 'rejected', icon: '❌', text: 'Rejected' }
    };
    
    return statusConfig[status] || statusConfig['Pending'];
  };

  const getPaymentIcon = (method) => {
    const icons = {
      'Card': '💳',
      'Bank': '🏦',
      'Cash': '💵'
    };
    return icons[method] || '💰';
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/payments/enrollments')}
        >
          ← Back to Enrollments
        </button>
        <h1>Payment History</h1>
        <p>Track all your course payments and receipts</p>
      </div>

      <div className="history-content">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select
              id="status-filter"
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-filter">Date Range:</label>
            <select
              id="date-filter"
              value={filter.dateRange}
              onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="all">All time</option>
            </select>
          </div>

          <button onClick={fetchPayments} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={fetchPayments} className="retry-btn">Try Again</button>
          </div>
        )}

        {payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No payments found</h3>
            <p>You haven't made any payments yet or no payments match your filters.</p>
            <button 
              onClick={() => navigate('/payments/enrollments')} 
              className="start-payment-btn"
            >
              Make Your First Payment
            </button>
          </div>
        ) : (
          <div className="payments-grid">
            {payments.map((payment) => {
              const status = getStatusBadge(payment.status);
              const paymentIcon = getPaymentIcon(payment.paymentMethod);
              
              return (
                <div key={payment._id} className="payment-card">
                  <div className="payment-header">
                    <div className="payment-info">
                      <span className="payment-icon">{paymentIcon}</span>
                      <div>
                        <h4>Payment #{payment._id.slice(-8)}</h4>
                        <p className="payment-date">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`status-badge ${status.class}`}>
                      <span className="status-icon">{status.icon}</span>
                      {status.text}
                    </div>
                  </div>

                  <div className="payment-details">
                    <div className="detail-row">
                      <span className="label">Course ID:</span>
                      <span className="value">{payment.studentCourseId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Amount:</span>
                      <span className="value amount">LKR {payment.amount?.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Type:</span>
                      <span className="value">{payment.paymentType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Method:</span>
                      <span className="value">{payment.paymentMethod}</span>
                    </div>
                    {payment.transactionId && (
                      <div className="detail-row">
                        <span className="label">Transaction ID:</span>
                        <span className="value transaction-id">{payment.transactionId}</span>
                      </div>
                    )}
                    {payment.adminComment && (
                      <div className="detail-row comment">
                        <span className="label">Admin Note:</span>
                        <span className="value">{payment.adminComment}</span>
                      </div>
                    )}
                  </div>

                  <div className="payment-actions">
                    {payment.status === 'Approved' && payment.receiptURL && (
                      <button 
                        onClick={() => downloadReceipt(payment._id)}
                        className="download-btn"
                      >
                        📄 Download Receipt
                      </button>
                    )}
                    
                    {payment.paymentType === 'Installment' && (
                      <button 
                        onClick={() => navigate('/admin/installments')}
                        className="installments-btn"
                      >
                        📊 View Installments
                      </button>
                    )}

                    {payment.status === 'Pending' && (
                      <div className="pending-note">
                        <span className="pending-icon">⏳</span>
                        <small>Awaiting admin approval</small>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h4>Total Paid</h4>
              <p>LKR {payments
                .filter(p => p.status === 'Approved')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h4>Total Payments</h4>
              <p>{payments.length}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h4>Pending</h4>
              <p>{payments.filter(p => p.status === 'Pending').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;