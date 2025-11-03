import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const getDashboardPath = () => {
    if (!userData) return '/';
    switch (userData.role) {
      case 'citizen': return '/citizen';
      case 'volunteer': return '/volunteer';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-hands-helping"></i>
          ResQ
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>

        <ul className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
          {currentUser ? (
            <>
              <li>
                <Link to={getDashboardPath()} className="nav-link">
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard
                </Link>
              </li>
              
              {userData?.role === 'citizen' && (
                <li>
                  <Link to="/citizen/request" className="nav-link">
                    <i className="fas fa-plus-circle"></i>
                    Request Help
                  </Link>
                </li>
              )}
              
              {userData?.role === 'volunteer' && (
                <li>
                  <Link to="/volunteer/tasks" className="nav-link">
                    <i className="fas fa-tasks"></i>
                    Available Tasks
                  </Link>
                </li>
              )}

              {/* Notification Bell */}
              <li style={{ position: 'relative' }}>
                <NotificationBell />
              </li>

              <li className="nav-user">
                <div className="user-avatar">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>
                    {userData?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                    {userData?.role}
                  </div>
                </div>
              </li>
              
              <li>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="nav-link">
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <i className="fas fa-user-plus"></i>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;