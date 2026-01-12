import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import './Vitals.css';

const Vitals = () => {
  const [vitals, setVitals] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    vital_type: '',
    start_date: '',
    end_date: ''
  });
  const [newVital, setNewVital] = useState({
    vital_type: '',
    value: '',
    unit: '',
    date: ''
  });

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

  useEffect(() => {
    fetchVitals();
    fetchTrends();
  }, []);

  const fetchVitals = async () => {
    try {
      const params = {};
      if (filters.vital_type) params.vital_type = filters.vital_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const response = await api.get('/vitals', { params });
      setVitals(response.data);
    } catch (error) {
      console.error('Error fetching vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const response = await api.get('/vitals/trends', { params });
      setTrends(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  useEffect(() => {
    fetchVitals();
    fetchTrends();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAddVital = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vitals', newVital);
      setNewVital({ vital_type: '', value: '', unit: '', date: '' });
      fetchVitals();
      fetchTrends();
    } catch (error) {
      alert('Error adding vital');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vital?')) {
      try {
        await api.delete(`/vitals/${id}`);
        fetchVitals();
        fetchTrends();
      } catch (error) {
        alert('Error deleting vital');
      }
    }
  };

  const formatChartData = (vitalType, data) => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      value: item.value,
      unit: item.unit
    }));
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Vitals Tracking</h1>

      <div className="card">
        <h2>Add New Vital</h2>
        <form onSubmit={handleAddVital} className="vital-form">
          <div className="form-group">
            <label>Vital Type</label>
            <select
              value={newVital.vital_type}
              onChange={(e) => setNewVital({ ...newVital, vital_type: e.target.value })}
              required
            >
              <option value="">Select vital type</option>
              {vitalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Value</label>
            <input
              type="text"
              value={newVital.value}
              onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input
              type="text"
              value={newVital.unit}
              onChange={(e) => setNewVital({ ...newVital, unit: e.target.value })}
              placeholder="e.g., mg/dL, bpm"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={newVital.date}
              onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Add Vital</button>
        </form>
      </div>

      <div className="card">
        <h2>Filters</h2>
        <div className="filters">
          <div className="form-group">
            <label>Vital Type</label>
            <select
              name="vital_type"
              value={filters.vital_type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {vitalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      <div className="charts-section">
        <h2>Vitals Trends</h2>
        {Object.keys(trends).length === 0 ? (
          <p>No vitals data available. Add vitals to see trends.</p>
        ) : (
          Object.keys(trends).map(vitalType => {
            const chartData = formatChartData(vitalType, trends[vitalType]);
            const unit = trends[vitalType][0]?.unit || '';
            
            return (
              <div key={vitalType} className="chart-card">
                <h3>{vitalType} {unit && `(${unit})`}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#007bff"
                      strokeWidth={2}
                      name={vitalType}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })
        )}
      </div>

      <div className="vitals-list-section">
        <h2>All Vitals</h2>
        {vitals.length === 0 ? (
          <p>No vitals recorded yet.</p>
        ) : (
          <div className="vitals-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vitals.map(vital => (
                  <tr key={vital.id}>
                    <td>{new Date(vital.date).toLocaleDateString()}</td>
                    <td>{vital.vital_type}</td>
                    <td>{vital.value}</td>
                    <td>{vital.unit || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(vital.id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vitals;

