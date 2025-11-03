import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = notificationService.getUserNotifications(
      currentUser.uid,
      (notifs) => {
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // You can add navigation logic here based on notification type
    setShowDropdown(false);
  };

  return (
    <div className="notification-bell">
      <div 
        className="notification-icon" 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ position: 'relative', cursor: 'pointer', marginRight: '15px' }}
      >
        <i className="fas fa-bell" style={{ fontSize: '1.2rem', color: 'var(--dark)' }}></i>
        {unreadCount > 0 && (
          <span 
            className="badge badge-danger"
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              fontSize: '0.7rem',
              minWidth: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      {showDropdown && (
        <div 
          className="notification-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            backgroundColor: 'white',
            border: '1px solid var(--gray-light)',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow-lg)',
            width: '350px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
          <div className="notification-header" style={{ 
            padding: '1rem', 
            borderBottom: '1px solid var(--gray-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h4 className="mb-0">Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="btn btn-sm btn-outline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="text-center p-3">
                <p className="text-muted">No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--gray-light)',
                    cursor: 'pointer',
                    backgroundColor: !notification.read ? 'var(--light)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div className="notification-content">
                    <h6 className="mb-1" style={{ 
                      color: !notification.read ? 'var(--primary)' : 'var(--dark)',
                      fontWeight: !notification.read ? '600' : '400'
                    }}>
                      {notification.title}
                    </h6>
                    <p className="mb-1" style={{ fontSize: '0.9rem' }}>
                      {notification.message}
                    </p>
                    <small className="text-muted">
                      {formatDate(notification.createdAt)}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default NotificationBell;