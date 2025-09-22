import React, { useState, useEffect } from 'react';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';
import './PaymentDashboard.css';

const PaymentDashboard = () => {
  const [activeTab, setActiveTab] = useState('payment');
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    pendingPayments: 0,
    completedPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/payments');
      const data = await response.json();
      
      if (data.success) {
        const payments = data.data;
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const completedPayments = payments.filter(p => p.status === 'completed').length;
        const pendingPayments = payments.filter(p => p.status === 'pending').length;

        setStats({
          totalPayments: payments.length,
          totalAmount,
          pendingPayments,
          completedPayments
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="payment-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Payment Management System</h1>
        <p>Driving School Payment Portal</p>
      </div>

      {/* Quick Stats */}
      {!loading && (
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-icon">💳</div>
            <div className="stat-info">
              <h3>Total Payments</h3>
              <p>{stats.totalPayments}</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p>{formatAmount(stats.totalAmount)}</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Completed</h3>
              <p>{stats.completedPayments}</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending</h3>
              <p>{stats.pendingPayments}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          <span className="tab-icon">💳</span>
          Make Payment
        </button>
        
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">📊</span>
          Payment History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'payment' && <PaymentForm />}
        {activeTab === 'history' && <PaymentHistory />}
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>© 2024 Driving School Management System. All rights reserved.</p>
        <div className="security-info">
          <span>🔒 Secure Payment Processing</span>
          <span>🛡️ SSL Protected</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;