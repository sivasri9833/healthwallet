import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './SharedReports.css';

const SharedReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState({
    reportId: '',
    shared_with_email: ''
  });
  const [sharedAccess, setSharedAccess] = useState({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.myReports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedAccess = async (reportId) => {
    try {
      const response = await api.get(`/share/report/${reportId}`);
      setSharedAccess(prev => ({ ...prev, [reportId]: response.data }));
    } catch (error) {
      console.error('Error fetching shared access:', error);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/share/report/${shareData.reportId}`, {
        shared_with_email: shareData.shared_with_email
      });
      alert('Report shared successfully!');
      setShareData({ reportId: '', shared_with_email: '' });
      fetchSharedAccess(shareData.reportId);
    } catch (error) {
      alert(error.response?.data?.message || 'Error sharing report');
    }
  };

  const handleRevoke = async (reportId, userId) => {
    if (window.confirm('Are you sure you want to revoke access?')) {
      try {
        await api.delete(`/share/report/${reportId}/user/${userId}`);
        fetchSharedAccess(reportId);
      } catch (error) {
        alert('Error revoking access');
      }
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Share Reports</h1>

      <div className="card">
        <h2>Share a Report</h2>
        <form onSubmit={handleShare}>
          <div className="form-group">
            <label>Select Report</label>
            <select
              value={shareData.reportId}
              onChange={(e) => {
                const reportId = e.target.value;
                setShareData({ ...shareData, reportId });
                if (reportId) {
                  fetchSharedAccess(reportId);
                }
              }}
              required
            >
              <option value="">Select a report</option>
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.report_type} - {new Date(report.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Share with (Email)</label>
            <input
              type="email"
              value={shareData.shared_with_email}
              onChange={(e) => setShareData({ ...shareData, shared_with_email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Share Report</button>
        </form>
      </div>

      {shareData.reportId && sharedAccess[shareData.reportId] && (
        <div className="card">
          <h2>Shared Access for Selected Report</h2>
          {sharedAccess[shareData.reportId].length === 0 ? (
            <p>No one has access to this report yet.</p>
          ) : (
            <div className="shared-access-list">
              {sharedAccess[shareData.reportId].map(access => (
                <div key={access.id} className="access-item">
                  <div>
                    <strong>{access.name}</strong> ({access.email})
                    <br />
                    <small>Access Type: {access.access_type}</small>
                  </div>
                  <button
                    onClick={() => handleRevoke(shareData.reportId, access.shared_with_id)}
                    className="btn btn-danger"
                  >
                    Revoke Access
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>My Reports</h2>
        {reports.length === 0 ? (
          <p>No reports available to share.</p>
        ) : (
          <div className="reports-list">
            {reports.map(report => (
              <div key={report.id} className="report-item">
                <div>
                  <h3>{report.report_type}</h3>
                  <p>Date: {new Date(report.date).toLocaleDateString()}</p>
                  <p>File: {report.file_name}</p>
                </div>
                <button
                  onClick={() => {
                    setShareData({ ...shareData, reportId: report.id });
                    fetchSharedAccess(report.id);
                  }}
                  className="btn btn-primary"
                >
                  Manage Sharing
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedReports;

