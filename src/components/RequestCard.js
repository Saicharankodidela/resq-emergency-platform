import React from 'react';
import StatusBadge from './StatusBadge';

const RequestCard = ({ request, onAccept, onComplete, showActions = false }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRequestIcon = (type) => {
    switch (type) {
      case 'food': return 'fa-utensils';
      case 'medicine': return 'fa-pills';
      case 'rescue': return 'fa-life-ring';
      case 'shelter': return 'fa-home';
      default: return 'fa-question-circle';
    }
  };

  return (
    <div className="request-card">
      <div className="request-header">
        <div className="d-flex align-items-center">
          <i className={`fas ${getRequestIcon(request.type)} mr-2`} style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
          <h4 className="mb-0" style={{ textTransform: 'capitalize' }}>{request.type}</h4>
        </div>
        <StatusBadge status={request.status} />
      </div>
      
      <div className="request-body">
        <div className="request-meta">
          <div className="request-meta-item">
            <i className="fas fa-map-marker-alt"></i>
            {request.location || 'Location not specified'}
          </div>
          <div className="request-meta-item">
            <i className="fas fa-clock"></i>
            {formatDate(request.createdAt)}
          </div>
        </div>
        
        <p className="request-description">
          {request.description || 'No description provided.'}
        </p>
      </div>
      
      {showActions && request.status === 'Submitted' && (
        <div className="request-footer">
          <button onClick={() => onAccept(request.id)} className="btn btn-primary">
            <i className="fas fa-check-circle"></i>
            Accept Task
          </button>
        </div>
      )}
      
      {showActions && request.status === 'Assigned' && (
        <div className="request-footer">
          <button onClick={() => onComplete(request.id)} className="btn btn-success">
            <i className="fas fa-check"></i>
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;