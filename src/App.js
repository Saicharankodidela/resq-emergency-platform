import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import CitizenDashboard from "./components/CitizenDashboard";
import VolunteerDashboard from "./components/VolunteerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import RequestHelp from "./components/RequestHelp";
import VolunteerTasks from "./components/VolunteerTasks";
import WeatherWidget from "./components/WeatherWidget";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public routes with weather widget */}
            <Route path="/login" element={
              <div className="auth-layout-container">
                <div className="weather-side">
                  <WeatherWidget />
                </div>
                <div className="auth-side">
                  <Login />
                </div>
              </div>
            } />

            <Route path="/register" element={
              <div className="auth-layout-container">
                <div className="weather-side">
                  <WeatherWidget />
                </div>
                <div className="auth-side">
                  <Register />
                </div>
              </div>
            } />

            {/* Protected routes — widgets removed here */}
            <Route path="/citizen" element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <CitizenDashboard />
              </ProtectedRoute>
            } />

            <Route path="/citizen/request" element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <RequestHelp />
              </ProtectedRoute>
            } />

            <Route path="/volunteer" element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/volunteer/tasks" element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerTasks />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={
              <div className="container">
                <div className="error-page">
                  <h1>404</h1>
                  <p>Page not found</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
