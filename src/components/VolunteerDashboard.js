import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";
import WeatherWidget from "./WeatherWidget";
import EmergencyInfo from "./EmergencyInfo";

export default function VolunteerDashboard() {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    
    console.log("Current User UID:", currentUser.uid);
    
    // Query for ALL tasks assigned to current volunteer (both assigned and completed)
    const assignedQuery = query(
      collection(db, "requests"), 
      where("volunteerId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    
    const unsub = onSnapshot(assignedQuery, 
      (snapshot) => {
        console.log("Raw tasks from Firestore:", snapshot.docs.length);
        const allTasks = snapshot.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          // Ensure dates are properly handled
          createdAt: d.data().createdAt,
          assignedAt: d.data().assignedAt,
          completedAt: d.data().completedAt
        }));
        
        console.log("All tasks:", allTasks);
        
        // Filter on client side
        const assigned = allTasks.filter(task => 
          task.status === "Assigned" || task.status === "In Progress"
        );
        const completed = allTasks.filter(task => task.status === "Completed");
        
        console.log("Assigned tasks:", assigned);
        console.log("Completed tasks:", completed);
        
        setAssignedTasks(assigned);
        setCompletedTasks(completed);
        setLoading(false);
      }, 
      (error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    );
    
    return () => unsub();
  }, [currentUser]);

  // View task details
  const viewTaskDetails = async (task) => {
    let taskWithDetails = { ...task };
    
    // Fetch citizen details
    if (task.citizenId) {
      try {
        const citizenDoc = await getDoc(doc(db, "users", task.citizenId));
        if (citizenDoc.exists()) {
          taskWithDetails.citizenDetails = citizenDoc.data();
        }
      } catch (error) {
        console.error("Error fetching citizen details:", error);
      }
    }

    setSelectedTask(taskWithDetails);
    setShowTaskModal(true);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await updateDoc(doc(db, "requests", taskId), {
        status: "Completed",
        completedAt: new Date()
      });
      alert("Task marked as completed!");
      setShowTaskModal(false);
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Failed to complete task");
    }
  };

  const stats = {
    assigned: assignedTasks.length,
    completed: completedTasks.length
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="container">
          <h1>Volunteer Dashboard</h1>
          <p>Manage your assigned tasks and help those in need</p>
        </div>
      </div>
      
      <div className="container">
        {/* Debug Information - Remove in production */}
        <div style={{ display: 'none' }}>
          <p>Debug: Assigned Tasks: {assignedTasks.length}, Completed Tasks: {completedTasks.length}</p>
          <p>User UID: {currentUser?.uid}</p>
        </div>

        {/* Main Layout */}
        <div className="dashboard-main-layout">
          {/* Left Column - Main Content */}
          <div className="dashboard-content">
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon primary">
                  <i className="fas fa-tasks"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.assigned}</h3>
                  <p>Assigned Tasks</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon success">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.completed}</h3>
                  <p>Completed Tasks</p>
                </div>
              </div>
            </div>
            
            {/* Assigned Tasks Section */}
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="mb-0">Your Assigned Tasks</h3>
                <div>
                  <span className="badge badge-primary" style={{marginRight: '10px'}}>{assignedTasks.length}</span>
                  <a href="/volunteer/tasks" className="btn btn-primary btn-sm">
                    <i className="fas fa-list"></i>
                    View Available Tasks
                  </a>
                </div>
              </div>
              
              <div className="card-body">
                {loading ? (
                  <LoadingSpinner />
                ) : assignedTasks.length === 0 ? (
                  <div className="text-center p-4">
                    <i className="fas fa-inbox" style={{ fontSize: '3rem', color: 'var(--gray)', marginBottom: '1rem' }}></i>
                    <h4>No assigned tasks</h4>
                    <p>Check available tasks to find requests you can help with</p>
                    <a href="/volunteer/tasks" className="btn btn-primary">
                      <i className="fas fa-list"></i>
                      View Available Tasks
                    </a>
                  </div>
                ) : (
                  <div className="requests-grid">
                    {assignedTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="request-card-clickable"
                        onClick={() => viewTaskDetails(task)}
                      >
                        <div className="request-card">
                          <div className="request-header">
                            <div className="d-flex align-items-center">
                              <i className={`fas ${getRequestIcon(task.type)} mr-2`} style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                              <h4 className="mb-0" style={{ textTransform: 'capitalize' }}>{task.type}</h4>
                            </div>
                            <span className={`badge ${getStatusClass(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          
                          <div className="request-body">
                            <div className="request-meta">
                              <div className="request-meta-item">
                                <i className="fas fa-map-marker-alt"></i>
                                {task.location || 'Location not specified'}
                              </div>
                              <div className="request-meta-item">
                                <i className="fas fa-clock"></i>
                                {formatDate(task.createdAt)}
                              </div>
                              {task.urgency && (
                                <div className="request-meta-item">
                                  <i className="fas fa-exclamation-circle"></i>
                                  Urgency: {task.urgency}
                                </div>
                              )}
                            </div>
                            
                            <p className="request-description">
                              {task.description || 'No description provided.'}
                            </p>
                          </div>
                          
                          <div className="request-footer">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteTask(task.id);
                              }} 
                              className="btn btn-success"
                            >
                              <i className="fas fa-check"></i>
                              Mark as Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Completed Tasks Section - Always show if there are completed tasks */}
            {completedTasks.length > 0 ? (
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0">Completed Tasks</h3>
                  <span className="badge badge-success">{completedTasks.length}</span>
                </div>
                
                <div className="card-body">
                  <div className="requests-grid">
                    {completedTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="request-card-clickable"
                        onClick={() => viewTaskDetails(task)}
                      >
                        <div className="request-card">
                          <div className="request-header">
                            <div className="d-flex align-items-center">
                              <i className={`fas ${getRequestIcon(task.type)} mr-2`} style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                              <h4 className="mb-0" style={{ textTransform: 'capitalize' }}>{task.type}</h4>
                            </div>
                            <span className="badge badge-completed">
                              Completed
                            </span>
                          </div>
                          
                          <div className="request-body">
                            <div className="request-meta">
                              <div className="request-meta-item">
                                <i className="fas fa-map-marker-alt"></i>
                                {task.location || 'Location not specified'}
                              </div>
                              <div className="request-meta-item">
                                <i className="fas fa-clock"></i>
                                Created: {formatDate(task.createdAt)}
                              </div>
                              {task.assignedAt && (
                                <div className="request-meta-item">
                                  <i className="fas fa-user-check"></i>
                                  Accepted: {formatDate(task.assignedAt)}
                                </div>
                              )}
                              {task.completedAt && (
                                <div className="request-meta-item">
                                  <i className="fas fa-check-circle"></i>
                                  Completed: {formatDate(task.completedAt)}
                                </div>
                              )}
                            </div>
                            
                            <p className="request-description">
                              {task.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              !loading && (
                <div className="card">
                  <div className="card-body text-center p-4">
                    <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: 'var(--gray)', marginBottom: '1rem' }}></i>
                    <h4>No completed tasks yet</h4>
                    <p>Complete your assigned tasks to see them here</p>
                  </div>
                </div>
              )
            )}
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

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className={`fas ${getRequestIcon(selectedTask.type)}`} style={{ marginRight: '10px' }}></i>
                Task Details
              </h3>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTask(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Task Information */}
              <div className="detail-section">
                <h4>Task Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Request ID:</label>
                    <span className="request-id">{selectedTask.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Type:</label>
                    <span className="request-type capitalize">{selectedTask.type}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedTask.status?.toLowerCase()}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Urgency:</label>
                    <span className={`priority-badge ${selectedTask.urgency || 'medium'}`}>
                      {selectedTask.urgency || 'Medium'}
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Location:</label>
                    <span>{selectedTask.location || 'Not specified'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Description:</label>
                    <span className="request-description">{selectedTask.description || 'No description provided'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="detail-section">
                <h4>Task Timeline</h4>
                <div className="timeline">
                  {/* Requested Time */}
                  <div className="timeline-item">
                    <div className="timeline-marker requested"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <label>Request Submitted</label>
                        <span className="timeline-time">
                          {selectedTask.createdAt?.toDate?.().toLocaleString() || formatDate(selectedTask.createdAt)}
                        </span>
                      </div>
                      <p className="timeline-description">
                        Citizen submitted this emergency request for assistance.
                      </p>
                    </div>
                  </div>

                  {/* Accepted Time */}
                  {selectedTask.assignedAt && (
                    <div className="timeline-item">
                      <div className="timeline-marker accepted"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <label>You Accepted</label>
                          <span className="timeline-time">
                            {selectedTask.assignedAt?.toDate?.().toLocaleString() || formatDate(selectedTask.assignedAt)}
                          </span>
                        </div>
                        <p className="timeline-description">
                          You accepted this request and are responsible for providing assistance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Completed Time */}
                  {selectedTask.completedAt && (
                    <div className="timeline-item">
                      <div className="timeline-marker completed"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <label>Task Completed</label>
                          <span className="timeline-time">
                            {selectedTask.completedAt?.toDate?.().toLocaleString() || formatDate(selectedTask.completedAt)}
                          </span>
                        </div>
                        <p className="timeline-description">
                          You successfully completed this emergency assistance request.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Citizen Information */}
              {selectedTask.citizenDetails && (
                <div className="detail-section">
                  <h4>Citizen Information</h4>
                  <div className="citizen-contact-card">
                    <div className="citizen-avatar">
                      <i className="fas fa-user-circle"></i>
                    </div>
                    <div className="citizen-details">
                      <h5>{selectedTask.citizenDetails.name || 'Citizen'}</h5>
                      <p className="citizen-role">Requester</p>
                      
                      <div className="contact-info">
                        {selectedTask.citizenDetails.email && (
                          <div className="contact-item">
                            <i className="fas fa-envelope"></i>
                            <span>{selectedTask.citizenDetails.email}</span>
                          </div>
                        )}
                        {selectedTask.citizenDetails.phone && (
                          <div className="contact-item">
                            <i className="fas fa-phone"></i>
                            <span>{selectedTask.citizenDetails.phone}</span>
                          </div>
                        )}
                        {!selectedTask.citizenDetails.phone && !selectedTask.citizenDetails.email && (
                          <p className="no-contact-info">
                            Contact information not available. Please coordinate through the platform.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedTask.citizenDetails.phone && (
                    <div className="contact-actions">
                      <a 
                        href={`tel:${selectedTask.citizenDetails.phone}`}
                        className="btn btn-primary"
                      >
                        <i className="fas fa-phone"></i>
                        Call Citizen
                      </a>
                      {selectedTask.citizenDetails.email && (
                        <a 
                          href={`mailto:${selectedTask.citizenDetails.email}`}
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
                {selectedTask.status === "Assigned" && (
                  <div className="alert alert-warning">
                    <i className="fas fa-user-check"></i>
                    <strong>This task is assigned to you.</strong> Please contact the citizen and provide the necessary assistance.
                  </div>
                )}
                {selectedTask.status === "Completed" && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i>
                    <strong>Task completed successfully!</strong> Thank you for your service to the community.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTask(null);
                }}
              >
                Close
              </button>
              
              {selectedTask.status === "Assigned" && (
                <button 
                  className="btn btn-success"
                  onClick={() => handleCompleteTask(selectedTask.id)}
                >
                  <i className="fas fa-check"></i>
                  Mark as Complete
                </button>
              )}
              
              {selectedTask.status === "Assigned" && selectedTask.citizenDetails?.phone && (
                <a 
                  href={`tel:${selectedTask.citizenDetails.phone}`}
                  className="btn btn-primary"
                >
                  <i className="fas fa-phone"></i>
                  Call Citizen
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
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

function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return 'badge-submitted';
    case 'assigned':
    case 'in progress':
      return 'badge-assigned';
    case 'completed':
      return 'badge-completed';
    case 'cancelled':
      return 'badge-cancelled';
    default:
      return 'badge-submitted';
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  try {
    // Handle both Firestore Timestamp and regular Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error, timestamp);
    return 'Date Error';
  }
}