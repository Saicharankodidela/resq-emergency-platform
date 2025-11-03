import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import RequestCard from "./RequestCard";
import LoadingSpinner from "./LoadingSpinner";
import WeatherWidget from "./WeatherWidget";
import EmergencyInfo from "./EmergencyInfo";

export default function CitizenDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "requests"),
      where("citizenId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(requestsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  // View request details
  const viewRequestDetails = async (request) => {
    let requestWithDetails = { ...request };
    
    // Fetch volunteer details if volunteer is assigned
    if (request.volunteerId) {
      try {
        const volunteerDoc = await getDoc(doc(db, "users", request.volunteerId));
        if (volunteerDoc.exists()) {
          requestWithDetails.volunteerDetails = volunteerDoc.data();
        }
      } catch (error) {
        console.error("Error fetching volunteer details:", error);
      }
    }

    setSelectedRequest(requestWithDetails);
    setShowRequestModal(true);
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "Submitted").length,
    assigned: requests.filter(r => r.status === "Assigned").length,
    completed: requests.filter(r => r.status === "Completed").length
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="container">
          <h1>Citizen Dashboard</h1>
          <p>Submit emergency requests and track their progress</p>
        </div>
      </div>
      
      <div className="container">
        {/* Top Section: Weather and Emergency Info Side by Side */}
        <div className="dashboard-top-section">
          <div className="weather-widget-container">
            <WeatherWidget />
          </div>
          <div className="emergency-info-container">
            <EmergencyInfo />
          </div>
        </div>

        {/* Stats Section */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-list"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Requests</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon warning">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.assigned}</h3>
              <p>Assigned</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Requests Section - Full Width */}
        <div className="card">
          <div className="card-header">
            <h3 className="mb-0">Your Requests</h3>
            <Link to="/citizen/request" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              New Request
            </Link>
          </div>
          
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : requests.length === 0 ? (
              <div className="text-center p-4">
                <i className="fas fa-inbox" style={{ fontSize: '3rem', color: 'var(--gray)', marginBottom: '1rem' }}></i>
                <h4>No requests yet</h4>
                <p>Submit your first request for assistance</p>
                <Link to="/citizen/request" className="btn btn-primary">
                  Create Request
                </Link>
              </div>
            ) : (
              <div className="requests-grid">
                {requests.map(request => (
                  <div 
                    key={request.id} 
                    className="request-card-clickable"
                    onClick={() => viewRequestDetails(request)}
                  >
                    <RequestCard 
                      request={request} 
                      showAdminActions={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className={`fas ${getRequestIcon(selectedRequest.type)}`} style={{ marginRight: '10px' }}></i>
                Request Details
              </h3>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedRequest(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Request Information */}
              <div className="detail-section">
                <h4>Request Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Request ID:</label>
                    <span className="request-id">{selectedRequest.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Type:</label>
                    <span className="request-type capitalize">{selectedRequest.type}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedRequest.status?.toLowerCase()}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Urgency:</label>
                    <span className={`priority-badge ${selectedRequest.urgency || 'medium'}`}>
                      {selectedRequest.urgency || 'Medium'}
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Location:</label>
                    <span>{selectedRequest.location || 'Not specified'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Description:</label>
                    <span className="request-description">{selectedRequest.description || 'No description provided'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="detail-section">
                <h4>Request Timeline</h4>
                <div className="timeline">
                  {/* Requested Time */}
                  <div className="timeline-item">
                    <div className="timeline-marker requested"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <label>Request Submitted</label>
                        <span className="timeline-time">
                          {selectedRequest.createdAt?.toDate?.().toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <p className="timeline-description">
                        Your emergency request was submitted and is awaiting volunteer assignment.
                      </p>
                    </div>
                  </div>

                  {/* Accepted Time */}
                  {selectedRequest.assignedAt && (
                    <div className="timeline-item">
                      <div className="timeline-marker accepted"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <label>Request Accepted</label>
                          <span className="timeline-time">
                            {selectedRequest.assignedAt?.toDate?.().toLocaleString()}
                          </span>
                        </div>
                        <p className="timeline-description">
                          A volunteer has accepted your request and is on the way to assist you.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Completed Time */}
                  {selectedRequest.completedAt && (
                    <div className="timeline-item">
                      <div className="timeline-marker completed"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <label>Request Completed</label>
                          <span className="timeline-time">
                            {selectedRequest.completedAt?.toDate?.().toLocaleString()}
                          </span>
                        </div>
                        <p className="timeline-description">
                          Your request has been successfully completed by the volunteer.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Volunteer Information */}
              {selectedRequest.volunteerId && (
                <div className="detail-section">
                  <h4>Volunteer Information</h4>
                  <div className="volunteer-contact-card">
                    <div className="volunteer-avatar">
                      <i className="fas fa-user-circle"></i>
                    </div>
                    <div className="volunteer-details">
                      <h5>{selectedRequest.volunteerName || selectedRequest.volunteerDetails?.name || 'Volunteer'}</h5>
                      <p className="volunteer-role">Emergency Response Volunteer</p>
                      
                      <div className="contact-info">
                        {selectedRequest.volunteerDetails?.email && (
                          <div className="contact-item">
                            <i className="fas fa-envelope"></i>
                            <span>{selectedRequest.volunteerDetails.email}</span>
                          </div>
                        )}
                        {selectedRequest.volunteerDetails?.phone && (
                          <div className="contact-item">
                            <i className="fas fa-phone"></i>
                            <span>{selectedRequest.volunteerDetails.phone}</span>
                          </div>
                        )}
                        {!selectedRequest.volunteerDetails?.phone && !selectedRequest.volunteerDetails?.email && (
                          <p className="no-contact-info">
                            Contact information not available. The volunteer will contact you directly.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedRequest.volunteerDetails?.phone && (
                    <div className="contact-actions">
                      <a 
                        href={`tel:${selectedRequest.volunteerDetails.phone}`}
                        className="btn btn-primary"
                      >
                        <i className="fas fa-phone"></i>
                        Call Volunteer
                      </a>
                      {selectedRequest.volunteerDetails?.email && (
                        <a 
                          href={`mailto:${selectedRequest.volunteerDetails.email}`}
                          className="btn btn-outline-primary"
                        >
                          <i className="fas fa-envelope"></i>
                          Send Email
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Status-specific Messages */}
              <div className="status-message">
                {selectedRequest.status === "Submitted" && (
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle"></i>
                    <strong>Your request is pending.</strong> Volunteers in your area are being notified and one will accept your request soon.
                  </div>
                )}
                {selectedRequest.status === "Assigned" && (
                  <div className="alert alert-warning">
                    <i className="fas fa-user-check"></i>
                    <strong>Your request has been assigned!</strong> A volunteer is on their way to assist you. Please wait for their arrival.
                  </div>
                )}
                {selectedRequest.status === "Completed" && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i>
                    <strong>Request completed successfully!</strong> We hope you received the assistance you needed. Thank you for using ResQ.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedRequest(null);
                }}
              >
                Close
              </button>
              
              {selectedRequest.status === "Assigned" && selectedRequest.volunteerDetails?.phone && (
                <a 
                  href={`tel:${selectedRequest.volunteerDetails.phone}`}
                  className="btn btn-primary"
                >
                  <i className="fas fa-phone"></i>
                  Call Volunteer Now
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for request icons
function getRequestIcon(type) {
  switch (type) {
    case 'food': return 'fa-utensils';
    case 'medicine': return 'fa-pills';
    case 'rescue': return 'fa-life-ring';
    case 'shelter': return 'fa-home';
    case 'transport': return 'fa-car';
    default: return 'fa-question-circle';
  }
}