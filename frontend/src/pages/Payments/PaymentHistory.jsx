import React, { useState, useEffect } from 'react';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/payments');
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'status-completed',
      pending: 'status-pending',
      failed: 'status-failed',
      cancelled: 'status-cancelled'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'status-pending'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = 
      payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="payment-history-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-container">
      <div className="payment-history-header">
        <h2>Payment History</h2>
        <p>View and manage all payment transactions</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Student ID, Course ID, or Payment Method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={filter === 'failed' ? 'active' : ''}
            onClick={() => setFilter('failed')}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>Total Payments</h3>
          <p className="stat-number">{payments.length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number completed">
            {payments.filter(p => p.status === 'completed').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">
            {payments.filter(p => p.status === 'pending').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Amount</h3>
          <p className="stat-number">
            {formatAmount(payments.reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>
      </div>

      {/* Payment Table */}
      <div className="payments-table-container">
        {filteredPayments.length === 0 ? (
          <div className="no-payments">
            <p>No payments found matching your criteria.</p>
          </div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Student ID</th>
                <th>Course ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id}>
                  <td className="payment-id">
                    {payment._id.slice(-8).toUpperCase()}
                  </td>
                  <td>{payment.studentId}</td>
                  <td>{payment.courseId}</td>
                  <td className="amount">{formatAmount(payment.amount)}</td>
                  <td>
                    <span className="payment-method">
                      {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn" title="View Details">
                        👁️
                      </button>
                      <button className="download-btn" title="Download Receipt">
                        📄
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Refresh Button */}
      <div className="refresh-section">
        <button className="refresh-btn" onClick={fetchPayments}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default PaymentHistory;