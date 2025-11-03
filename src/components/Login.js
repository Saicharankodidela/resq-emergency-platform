import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import LoadingSpinner from "./LoadingSpinner";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const userCred = await signInWithEmailAndPassword(auth, form.email, form.password);
      const uid = userCred.user.uid;
      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (!userDoc.exists()) {
        setError("User details not found.");
        setLoading(false);
        return;
      }
      
      const role = userDoc.data().role || "citizen";
      if (role === "citizen") navigate("/citizen");
      else if (role === "volunteer") navigate("/volunteer");
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
          <h2>Welcome Back</h2>
          <p>Sign in to your ResQ account</p>
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
          
          <form onSubmit={handleLogin}>
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
              <label className="form-label">Password</label>
              <input 
                required 
                type="password" 
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})} 
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
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="auth-footer">
          <p className="mb-0">
            Don't have an account?{" "}
            <Link to="/register" className="link" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}