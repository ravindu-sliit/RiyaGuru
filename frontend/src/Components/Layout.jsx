import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, LayoutDashboard, Plus, List, Settings } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Car className="logo-icon" />
            <span className="logo-text">
              Drive<span className="logo-accent">School</span>
            </span>
          </div>
          
          <nav className="nav">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link 
              to="/vehicles" 
              className={`nav-link ${isActive('/vehicles') ? 'active' : ''}`}
            >
              <List size={18} />
              All Vehicles
            </Link>
            <Link 
              to="/vehicles/add" 
              className={`nav-link ${isActive('/vehicles/add') ? 'active' : ''}`}
            >
              <Plus size={18} />
              Add Vehicle
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;