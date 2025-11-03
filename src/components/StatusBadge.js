import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'badge-submitted';
      case 'assigned':
        return 'badge-assigned';
      case 'completed':
        return 'badge-completed';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-submitted';
    }
  };

  return (
    <span className={`badge ${getStatusClass()}`}>
      {status || 'Submitted'}
    </span>
  );
};

export default StatusBadge;