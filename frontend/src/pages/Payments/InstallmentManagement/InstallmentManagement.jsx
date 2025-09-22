// src/pages/Payments/InstallmentManagement/InstallmentManagement.jsx
import React, { useState, useEffect } from 'react';
import './InstallmentManagement.css';

const InstallmentManagement = () => {
  const [installmentPlans, setInstallmentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInstallmentPlans();
  }, []);

  const fetchInstallmentPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/installments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Mock data for demo
        const mockPlans = [
          {
            _id: '673f2a1b4c8d9e1234567890',
            studentId: 'S001',
            courseId: 'C001',
            totalAmount: 50000,
            downPayment: 10000,
            remainingAmount: 40000,
            totalInstallments: 4,
            startDate: '2024-11-01',
            schedule: [
              {
                installmentNumber: 1,
                amount: 10000,
                dueDate: '2024-12-01',
                status: 'Approved',
                paidDate: '2024-11-30'
              },
              {
                installmentNumber: 2,
                amount: 10000,
                dueDate: '2025-01-01',
                status: 'Pending'
              },
              {
                installmentNumber: 3,
                amount: 10000,
                dueDate: '2025-02-01',
                status: 'Pending'
              },
              {
                installmentNumber: 4,
                amount: 10000,
                dueDate: '2025-03-01',
                status: 'Pending'
              }
            ],
            createdAt: '2024-11-01T10:00:00Z'
          },
          {
            _id: '673f2a1b4c8d9e1234567891',
            studentId: 'S002',
            courseId: 'C002',
            totalAmount: 75000,
            downPayment: 25000,
            remainingAmount: 25000,
            totalInstallments: 2,
            startDate: '2024-11-15',
            schedule: [
              {
                installmentNumber: 1,
                amount: 25000,
                dueDate: '2024-12-15',
                status: 'Overdue'
              },
              {
                installmentNumber: 2,
                amount: 25000,
                dueDate: '2025-01-15',
                status: 'Pending'
              }
            ],
            createdAt: '2024-11-15T14:30:00Z'
          }
        ];
        setInstallmentPlans(mockPlans);
      } else {
        setError('Failed to fetch installment plans');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: installmentPlans.length,
      active: 0,
      overdue: 0,
      completed: 0
    };

    installmentPlans.forEach(plan => {
      const hasOverdue = plan.schedule.some(item => item.status === 'Overdue');
      const allCompleted = plan.schedule.every(item => item.status === 'Approved');
      
      if (hasOverdue) counts.overdue++;
      else if (allCompleted) counts.completed++;
      else counts.active++;
    });

    return counts;
  };

  const getFilteredPlans = () => {
    if (filter === 'all') return installmentPlans;
    
    return installmentPlans.filter(plan => {
      const hasOverdue = plan.schedule.some(item => item.status === 'Overdue');
      const allCompleted = plan.schedule.every(item => item.status === 'Approved');
      
      switch (filter) {
        case 'overdue': return hasOverdue;
        case 'completed': return allCompleted;
        case 'active': return !hasOverdue && !allCompleted;
        default: return true;
      }
    });
  };

  const getPlanStatus = (plan) => {
    const hasOverdue = plan.schedule.some(item => item.status === 'Overdue');
    const allCompleted = plan.schedule.every(item => item.status === 'Approved');
    
    if (hasOverdue) return { status: 'overdue', text: 'Overdue', class: 'overdue' };
    if (allCompleted) return { status: 'completed', text: 'Completed', class: 'completed' };
    return { status: 'active', text: 'Active', class: 'active' };
  };

  const getInstallmentStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'pending', icon: '⏳', text: 'Pending' },
      'Approved': { class: 'approved', icon: '✅', text: 'Paid' },
      'Overdue': { class: 'overdue', icon: '⚠️', text: 'Overdue' }
    };
    return statusConfig[status] || statusConfig['Pending'];
  };

  if (loading) {
    return (
      <div className="installment-admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading installment plans...</p>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();
  const filteredPlans = getFilteredPlans();

  return (
    <div className="installment-admin-container">
      <div className="admin-header">
        <h1>Installment Management</h1>
        <p>Monitor and manage student installment plans</p>
      </div>

      <div className="admin-content">
        <div className="admin-filters">
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All Plans', count: statusCounts.all },
              { key: 'active', label: 'Active', count: statusCounts.active },
              { key: 'overdue', label: 'Overdue', count: statusCounts.overdue },
              { key: 'completed', label: 'Completed', count: statusCounts.completed }
            ].map(tab => (
              <button
                key={tab.key}
                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                <span className="count">({tab.count})</span>
              </button>
            ))}
          </div>
          <button onClick={fetchInstallmentPlans} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="plans-grid">
          {filteredPlans.map((plan) => {
            const planStatus = getPlanStatus(plan);
            const completedInstallments = plan.schedule.filter(item => item.status === 'Approved').length;
            const progress = (completedInstallments / plan.totalInstallments) * 100;

            return (
              <div key={plan._id} className="plan-card">
                <div className="plan-header">
                  <div className="plan-info">
                    <h4>Plan #{plan._id.slice(-8)}</h4>
                    <p className="student-info">Student: {plan.studentId} | Course: {plan.courseId}</p>
                  </div>
                  <div className={`plan-status ${planStatus.class}`}>
                    {planStatus.text}
                  </div>
                </div>

                <div className="plan-summary">
                  <div className="summary-row">
                    <span>Total Amount:</span>
                    <span className="amount">LKR {plan.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Down Payment:</span>
                    <span>LKR {plan.downPayment?.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Remaining:</span>
                    <span className="remaining">LKR {plan.remainingAmount?.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Progress:</span>
                    <span>{completedInstallments}/{plan.totalInstallments} installments</span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  <span className="progress-text">{Math.round(progress)}% Complete</span>
                </div>

                <div className="installment-preview">
                  <h5>Next Due Installments:</h5>
                  {plan.schedule
                    .filter(item => item.status !== 'Approved')
                    .slice(0, 2)
                    .map((installment, index) => {
                      const status = getInstallmentStatusBadge(installment.status);
                      const isOverdue = new Date(installment.dueDate) < new Date() && installment.status === 'Pending';
                      
                      return (
                        <div key={index} className={`installment-row ${isOverdue ? 'overdue' : ''}`}>
                          <span className="installment-num">#{installment.installmentNumber}</span>
                          <span className="installment-amount">LKR {installment.amount?.toLocaleString()}</span>
                          <span className="installment-date">{new Date(installment.dueDate).toLocaleDateString()}</span>
                          <span className={`installment-status ${status.class}`}>
                            {status.icon} {status.text}
                          </span>
                        </div>
                      );
                    })}
                </div>

                <div className="plan-actions">
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="view-details-btn"
                  >
                    📋 View Details
                  </button>
                  <span className="created-date">
                    Created: {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPlans.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No installment plans found</h3>
            <p>No plans match the selected filter criteria.</p>
          </div>
        )}
      </div>

      {/* Plan Detail Modal */}
      {selectedPlan && (
        <div className="modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Installment Plan Details</h3>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="plan-overview">
                <div className="overview-grid">
                  <div className="overview-item">
                    <span className="label">Plan ID:</span>
                    <span className="value">#{selectedPlan._id}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Student ID:</span>
                    <span className="value">{selectedPlan.studentId}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Course ID:</span>
                    <span className="value">{selectedPlan.courseId}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Total Amount:</span>
                    <span className="value amount">LKR {selectedPlan.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Down Payment:</span>
                    <span className="value">LKR {selectedPlan.downPayment?.toLocaleString()}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Remaining Amount:</span>
                    <span className="value remaining">LKR {selectedPlan.remainingAmount?.toLocaleString()}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Total Installments:</span>
                    <span className="value">{selectedPlan.totalInstallments}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Start Date:</span>
                    <span className="value">{new Date(selectedPlan.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="installment-schedule">
                <h4>Payment Schedule</h4>
                <div className="schedule-table">
                  <div className="schedule-header">
                    <span>Installment</span>
                    <span>Amount</span>
                    <span>Due Date</span>
                    <span>Status</span>
                    <span>Paid Date</span>
                  </div>
                  
                  {selectedPlan.schedule.map((installment, index) => {
                    const status = getInstallmentStatusBadge(installment.status);
                    const isOverdue = new Date(installment.dueDate) < new Date() && installment.status === 'Pending';
                    
                    return (
                      <div key={index} className={`schedule-row ${isOverdue ? 'overdue' : ''}`}>
                        <span className="installment-num">#{installment.installmentNumber}</span>
                        <span className="amount">LKR {installment.amount?.toLocaleString()}</span>
                        <span className="due-date">{new Date(installment.dueDate).toLocaleDateString()}</span>
                        <span className={`status ${status.class}`}>
                          {status.icon} {status.text}
                        </span>
                        <span className="paid-date">
                          {installment.paidDate ? new Date(installment.paidDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="plan-statistics">
                <h4>Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Completed Payments:</span>
                    <span className="stat-value">
                      {selectedPlan.schedule.filter(item => item.status === 'Approved').length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Pending Payments:</span>
                    <span className="stat-value pending">
                      {selectedPlan.schedule.filter(item => item.status === 'Pending').length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Overdue Payments:</span>
                    <span className="stat-value overdue">
                      {selectedPlan.schedule.filter(item => item.status === 'Overdue').length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Amount Paid:</span>
                    <span className="stat-value amount">
                      LKR {selectedPlan.schedule
                        .filter(item => item.status === 'Approved')
                        .reduce((sum, item) => sum + item.amount, selectedPlan.downPayment)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallmentManagement;