import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  updateDoc,
  doc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import RequestCard from "./RequestCard";
import LoadingSpinner from "./LoadingSpinner";
import WeatherWidget from "./WeatherWidget";
import EmergencyInfo from "./EmergencyInfo";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const baseQuery = collection(db, "requests");
    const filteredQuery =
      filter === "all"
        ? query(baseQuery, orderBy("createdAt", "desc"))
        : query(baseQuery, where("status", "==", filter), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      filteredQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setRequests(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
      }
    );

    // Fetch volunteers
    const volunteersQuery = query(collection(db, "users"), where("role", "==", "volunteer"));
    const unsubscribeVolunteers = onSnapshot(volunteersQuery, (snapshot) => {
      const volunteersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVolunteers(volunteersData);
    });

    return () => {
      unsubscribe();
      unsubscribeVolunteers();
    };
  }, [filter]);

  // Show alert banner
  const showAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 5000);
  };

  // Admin Actions
  const assignToVolunteer = async (requestId, volunteerId) => {
    try {
      const volunteer = volunteers.find(v => v.id === volunteerId);
      await updateDoc(doc(db, "requests", requestId), {
        status: "Assigned",
        volunteerId: volunteerId,
        volunteerName: volunteer?.name || 'Unknown Volunteer',
        assignedAt: new Date(),
        assignedBy: "admin"
      });
      showAlert("Request assigned to volunteer successfully!", "success");
      setShowRequestModal(false);
    } catch (error) {
      console.error("Error assigning request:", error);
      showAlert("Failed to assign request", "danger");
    }
  };

  const toggleUrgent = async (requestId, currentPriority) => {
    try {
      const newPriority = currentPriority === "urgent" ? "normal" : "urgent";
      await updateDoc(doc(db, "requests", requestId), {
        priority: newPriority,
        priorityUpdatedAt: new Date()
      });
      showAlert(`Request marked as ${newPriority} priority!`, "success");
    } catch (error) {
      console.error("Error updating priority:", error);
      showAlert("Failed to update priority", "danger");
    }
  };

  const deleteRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to delete this request? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "requests", requestId));
        showAlert("Request deleted successfully!", "success");
        setShowRequestModal(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error("Error deleting request:", error);
        showAlert("Failed to delete request", "danger");
      }
    }
  };

  const markAsCompleted = async (requestId) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "Completed",
        completedAt: new Date()
      });
      showAlert("Request marked as completed!", "success");
      setShowRequestModal(false);
    } catch (error) {
      console.error("Error completing request:", error);
      showAlert("Failed to mark request as completed", "danger");
    }
  };

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

    // Fetch citizen details
    if (request.citizenId) {
      try {
        const citizenDoc = await getDoc(doc(db, "users", request.citizenId));
        if (citizenDoc.exists()) {
          requestWithDetails.citizenDetails = citizenDoc.data();
        }
      } catch (error) {
        console.error("Error fetching citizen details:", error);
      }
    }

    setSelectedRequest(requestWithDetails);
    setShowRequestModal(true);
  };

  const stats = {
    all: requests.length,
    submitted: requests.filter((r) => r.status === "Submitted").length,
    assigned: requests.filter((r) => r.status === "Assigned").length,
    completed: requests.filter((r) => r.status === "Completed").length,
    urgent: requests.filter((r) => r.priority === "urgent").length
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <h1>Authority Dashboard</h1>
          <p>Monitor and manage all emergency requests</p>
        </div>
      </div>

      <div className="container">
        {/* Success/Error Alert */}
        {alertMessage && (
          <div className={`alert alert-${alertType} alert-dismissible fade show`}>
            {alertMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setAlertMessage("")}
            ></button>
          </div>
        )}

        {/* Main Layout */}
        <div className="dashboard-main-layout">
          {/* Left Column - Main Content */}
          <div className="dashboard-content">
            {/* Stats Overview */}
            <div className="dashboard-stats">
              {[
                { label: "Total Requests", value: stats.all, icon: "fa-list", color: "primary", key: "all" },
                { label: "Pending", value: stats.submitted, icon: "fa-clock", color: "warning", key: "Submitted" },
                { label: "Assigned", value: stats.assigned, icon: "fa-user-check", color: "primary", key: "Assigned" },
                { label: "Completed", value: stats.completed, icon: "fa-check-circle", color: "success", key: "Completed" },
                { label: "Urgent", value: stats.urgent, icon: "fa-exclamation-triangle", color: "danger", key: "urgent" }
              ].map((stat) => (
                <div
                  key={stat.key}
                  className="stat-card"
                  onClick={() => setFilter(stat.key === "all" || stat.key === "urgent" ? "all" : stat.key)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`stat-icon ${stat.color}`}>
                    <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter Controls */}
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Request Management</h3>
                <div className="d-flex align-items-center">
                  <span className="mr-2">Filter:</span>
                  <select
                    className="form-control form-control-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ width: "auto" }}
                  >
                    <option value="all">All Requests</option>
                    <option value="Submitted">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Requests Grid */}
            <div className="requests-grid">
              {loading ? (
                <LoadingSpinner />
              ) : requests.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center p-5">
                    <i
                      className="fas fa-inbox"
                      style={{
                        fontSize: "3rem",
                        color: "var(--gray)",
                        marginBottom: "1rem"
                      }}
                    ></i>
                    <h4>No requests found</h4>
                    <p>There are no requests matching your current filter</p>
                  </div>
                </div>
              ) : (
                requests.map((request) => (
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
                ))
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="dashboard-sidebar">
            <div className="sidebar-widget">
              <WeatherWidget />
            </div>
            <div className="sidebar-widget">
              <EmergencyInfo />
            </div>
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
                <h4>Timeline</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <label>Request Created:</label>
                      <span>{selectedRequest.createdAt?.toDate?.().toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                  {selectedRequest.assignedAt && (
                    <div className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <label>Assigned to Volunteer:</label>
                        <span>{selectedRequest.assignedAt?.toDate?.().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  {selectedRequest.completedAt && (
                    <div className="timeline-item">
                      <div className="timeline-marker completed"></div>
                      <div className="timeline-content">
                        <label>Completed:</label>
                        <span>{selectedRequest.completedAt?.toDate?.().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Volunteer Information */}
              {selectedRequest.volunteerId && (
                <div className="detail-section">
                  <h4>Volunteer Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Volunteer ID:</label>
                      <span>{selectedRequest.volunteerId}</span>
                    </div>
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedRequest.volunteerName || selectedRequest.volunteerDetails?.name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedRequest.volunteerDetails?.email || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedRequest.volunteerDetails?.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen Information */}
              <div className="detail-section">
                <h4>Citizen Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Citizen ID:</label>
                    <span>{selectedRequest.citizenId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedRequest.citizenDetails?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedRequest.citizenDetails?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedRequest.citizenDetails?.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="action-buttons">
                {/* Priority Toggle */}
                <button 
                  className={`btn ${selectedRequest.priority === 'urgent' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => toggleUrgent(selectedRequest.id, selectedRequest.priority)}
                >
                  <i className={`fas ${selectedRequest.priority === 'urgent' ? 'fa-star' : 'fa-star'}`}></i>
                  {selectedRequest.priority === 'urgent' ? 'Mark as Normal' : 'Mark as Urgent'}
                </button>

                {/* Assign to Volunteer Dropdown */}
                {selectedRequest.status === "Submitted" && volunteers.length > 0 && (
                  <div className="assign-dropdown">
                    <select
                      className="form-control"
                      onChange={(e) => assignToVolunteer(selectedRequest.id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Assign to Volunteer</option>
                      {volunteers.map(volunteer => (
                        <option key={volunteer.id} value={volunteer.id}>
                          {volunteer.name} ({volunteer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Complete Button */}
                {selectedRequest.status === "Assigned" && (
                  <button 
                    className="btn btn-success"
                    onClick={() => markAsCompleted(selectedRequest.id)}
                  >
                    <i className="fas fa-check"></i>
                    Mark Complete
                  </button>
                )}

                {/* Delete Button */}
                {selectedRequest.status === "Submitted" && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteRequest(selectedRequest.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Delete Request
                  </button>
                )}

                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedRequest(null);
                  }}
                >
                  Close
                </button>
              </div>
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