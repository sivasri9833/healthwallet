import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import Vitals from './pages/Vitals';
import SharedReports from './pages/SharedReports';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <UploadReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/vitals"
              element={
                <PrivateRoute>
                  <Vitals />
                </PrivateRoute>
              }
            />
            <Route
              path="/shared"
              element={
                <PrivateRoute>
                  <SharedReports />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
