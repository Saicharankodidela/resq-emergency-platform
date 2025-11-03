import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import LoadingSpinner from "./LoadingSpinner";

export default function Register() {
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "",
    role: "citizen", 
    name: "",
    phone: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (form.password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = userCred.user.uid;
      
      await setDoc(doc(db, "users", uid), {
        name: form.name || "",
        email: form.email,
        phone: form.phone || "",
        role: form.role,
        createdAt: new Date()
      });
      
      if (form.role === "citizen") navigate("/citizen");
      else if (form.role === "volunteer") navigate("/volunteer");
      else navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join ResQ to request or provide help</p>
        </div>
        
        <div className="auth-body">
          {error && (
            <div className="alert alert-danger" role="alert" style={{ 
              padding: '12px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--danger)', 
              borderRadius: 'var(--border-radius)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              {error}
            </div>
          )}
          
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                required 
                type="email" 
                className="form-control"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input 
                type="tel" 
                className="form-control"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select 
                className="form-control"
                value={form.role} 
                onChange={(e) => setForm({...form, role: e.target.value})}
              >
                <option value="citizen">Citizen (Need Help)</option>
                <option value="volunteer">Volunteer (Provide Help)</option>
                <option value="admin">Authority/Admin</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                required 
                type="password" 
                className="form-control"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                required 
                type="password" 
                className="form-control"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({...form, confirmPassword: e.target.value})} 
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="auth-footer">
          <p className="mb-0">
            Already have an account?{" "}
            <Link to="/login" className="link" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}