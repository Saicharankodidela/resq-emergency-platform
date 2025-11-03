import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

export default function RequestHelp() {
  const [form, setForm] = useState({ 
    type: "", 
    description: "", 
    location: "",
    urgency: "medium" 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, "requests"), {
        type: form.type,
        description: form.description,
        location: form.location,
        urgency: form.urgency,
        status: "Submitted",
        citizenId: auth.currentUser.uid,
        createdAt: new Date()
      });
      
      navigate("/citizen");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Submit Emergency Request</h2>
          <p>Provide details about the assistance you need</p>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Request Type</label>
              <select 
                required 
                className="form-control"
                value={form.type} 
                onChange={(e) => setForm({...form, type: e.target.value})}
              >
                <option value="">Select request type</option>
                <option value="food">Food Supplies</option>
                <option value="medicine">Medical Assistance</option>
                <option value="rescue">Rescue Operation</option>
                <option value="shelter">Shelter/Housing</option>
                <option value="transport">Transportation</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Urgency Level</label>
              <select 
                required 
                className="form-control"
                value={form.urgency} 
                onChange={(e) => setForm({...form, urgency: e.target.value})}
              >
                <option value="low">Low - Not urgent</option>
                <option value="medium">Medium - Important</option>
                <option value="high">High - Urgent</option>
                <option value="critical">Critical - Emergency</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Location</label>
              <input 
                required 
                className="form-control"
                placeholder="Enter your current location or address"
                value={form.location}
                onChange={(e) => setForm({...form, location: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                required 
                className="form-control"
                placeholder="Please provide detailed information about your situation and the assistance you need"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})} 
              />
            </div>
            
            <div className="d-flex justify-content-between">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => navigate("/citizen")}
              >
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}