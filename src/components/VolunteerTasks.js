import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import LoadingSpinner from "./LoadingSpinner";

export default function VolunteerTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query for all submitted tasks
    const q = query(
      collection(db, "requests"), 
      where("status", "==", "Submitted"),
      orderBy("createdAt", "desc")
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      console.log("Available tasks snapshot:", snapshot.docs.length);
      const tasksData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });
    
    return () => unsub();
  }, []);

  const acceptTask = async (id) => {
    try {
      await updateDoc(doc(db, "requests", id), {
        status: "Assigned",
        volunteerId: auth.currentUser.uid,
        assignedAt: new Date()
      });
      alert("Task accepted successfully!");
    } catch (error) {
      console.error("Error accepting task:", error);
      alert("Failed to accept task. Please try again.");
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="container">
          <h1>Available Tasks</h1>
          <p>Find requests that need your assistance</p>
        </div>
      </div>
      
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h3 className="mb-0">Open Requests</h3>
            <span className="badge badge-primary">{tasks.length}</span>
          </div>
          
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : tasks.length === 0 ? (
              <div className="text-center p-4">
                <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '1rem' }}></i>
                <h4>No open tasks</h4>
                <p>All requests are currently being handled. Check back later for new requests.</p>
              </div>
            ) : (
              <div className="requests-grid">
                {tasks.map(task => (
                  <div key={task.id} className="request-card">
                    <div className="request-header">
                      <div className="d-flex align-items-center">
                        <i className={`fas ${getRequestIcon(task.type)} mr-2`} style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                        <h4 className="mb-0" style={{ textTransform: 'capitalize' }}>{task.type}</h4>
                      </div>
                      <span className="badge badge-submitted">
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
                        onClick={() => acceptTask(task.id)} 
                        className="btn btn-primary"
                      >
                        <i className="fas fa-check-circle"></i>
                        Accept Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}