import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [sharedReports, setSharedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    totalShared: 0,
    recentReports: 0
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.myReports || []);
      setSharedReports(response.data.sharedReports || []);
      
      setStats({
        totalReports: response.data.myReports?.length || 0,
        totalShared: response.data.sharedReports?.length || 0,
        recentReports: response.data.myReports?.filter(r => {
          const reportDate = new Date(r.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return reportDate >= weekAgo;
        }).length || 0
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await api.delete(`/reports/${id}`);
        fetchReports();
      } catch (error) {
        alert('Error deleting report');
      }
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Reports</h3>
          <p className="stat-number">{stats.totalReports}</p>
        </div>
        <div className="stat-card">
          <h3>Shared Reports</h3>
          <p className="stat-number">{stats.totalShared}</p>
        </div>
        <div className="stat-card">
          <h3>Recent (7 days)</h3>
          <p className="stat-number">{stats.recentReports}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/upload" className="btn btn-primary">
          Upload New Report
        </Link>
        <Link to="/vitals" className="btn btn-secondary">
          View Vitals
        </Link>
      </div>

      <div className="reports-section">
        <h2>My Reports</h2>
        {reports.length === 0 ? (
          <p>No reports yet. <Link to="/upload">Upload your first report</Link></p>
        ) : (
          <div className="reports-grid">
            {reports.map(report => (
              <div key={report.id} className="report-card">
                <h3>{report.report_type}</h3>
                <p><strong>Date:</strong> {new Date(report.date).toLocaleDateString()}</p>
                <p><strong>File:</strong> {report.file_name}</p>
                {report.vitals && report.vitals.length > 0 && (
                  <div className="vitals-preview">
                    <strong>Vitals:</strong>
                    {report.vitals.map((v, idx) => (
                      <span key={idx} className="vital-tag">
                        {v.type}: {v.value}
                      </span>
                    ))}
                  </div>
                )}
                <div className="report-actions">
                  <a
                    href={`http://localhost:5000${report.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sharedReports.length > 0 && (
        <div className="reports-section">
          <h2>Shared With Me</h2>
          <div className="reports-grid">
            {sharedReports.map(report => (
              <div key={report.id} className="report-card shared">
                <h3>{report.report_type}</h3>
                <p><strong>Owner:</strong> {report.owner_name}</p>
                <p><strong>Date:</strong> {new Date(report.date).toLocaleDateString()}</p>
                <p><strong>File:</strong> {report.file_name}</p>
                <a
                  href={`http://localhost:5000${report.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

