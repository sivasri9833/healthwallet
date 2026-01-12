import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          Health Wallet
        </Link>
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/upload" className="navbar-link">Upload Report</Link>
          <Link to="/vitals" className="navbar-link">Vitals</Link>
          <Link to="/shared" className="navbar-link">Shared Reports</Link>
          <div className="navbar-user">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
