import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './UploadReport.css';

const UploadReport = () => {
  const [formData, setFormData] = useState({
    file: null,
    report_type: '',
    date: '',
    vitals: []
  });
  const [vitalInput, setVitalInput] = useState({
    vital_type: '',
    value: '',
    unit: '',
    date: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const reportTypes = [
    'Blood Test',
    'X-Ray',
    'CT Scan',
    'MRI',
    'Ultrasound',
    'ECG',
    'Urine Test',
    'Other'
  ];

  const vitalTypes = [
    'Blood Pressure',
    'Sugar',
    'Heart Rate',
    'Temperature',
    'Weight',
    'Cholesterol',
    'Hemoglobin',
    'Other'
  ];

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addVital = () => {
    if (vitalInput.vital_type && vitalInput.value && vitalInput.date) {
      setFormData({
        ...formData,
        vitals: [...formData.vitals, { ...vitalInput }]
      });
      setVitalInput({ vital_type: '', value: '', unit: '', date: '' });
    }
  };

  const removeVital = (index) => {
    setFormData({
      ...formData,
      vitals: formData.vitals.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!formData.file) {
      setMessage('Please select a file');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('file', formData.file);
    data.append('report_type', formData.report_type);
    data.append('date', formData.date);
    data.append('vitals', JSON.stringify(formData.vitals));

    try {
      await api.post('/reports/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Report uploaded successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error uploading report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Upload Health Report</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Report File (PDF/Image)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Report Type</label>
            <select
              name="report_type"
              value={formData.report_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select report type</option>
              {reportTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Report Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="vitals-section">
            <h3>Associated Vitals (Optional)</h3>
            <div className="vital-input">
              <select
                value={vitalInput.vital_type}
                onChange={(e) => setVitalInput({ ...vitalInput, vital_type: e.target.value })}
              >
                <option value="">Select vital type</option>
                {vitalTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Value"
                value={vitalInput.value}
                onChange={(e) => setVitalInput({ ...vitalInput, value: e.target.value })}
              />
              <input
                type="text"
                placeholder="Unit (e.g., mg/dL)"
                value={vitalInput.unit}
                onChange={(e) => setVitalInput({ ...vitalInput, unit: e.target.value })}
              />
              <input
                type="date"
                value={vitalInput.date}
                onChange={(e) => setVitalInput({ ...vitalInput, date: e.target.value })}
              />
              <button type="button" onClick={addVital} className="btn btn-secondary">
                Add Vital
              </button>
            </div>

            {formData.vitals.length > 0 && (
              <div className="vitals-list">
                {formData.vitals.map((vital, index) => (
                  <div key={index} className="vital-item">
                    <span>{vital.vital_type}: {vital.value} {vital.unit} ({vital.date})</span>
                    <button
                      type="button"
                      onClick={() => removeVital(index)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className={message.includes('success') ? 'success' : 'error'}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadReport;

