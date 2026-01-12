const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Add vital
router.post('/', auth, async (req, res) => {
  try {
    const { vital_type, value, unit, date } = req.body;
    const userId = req.user.id;

    if (!vital_type || !value || !date) {
      return res.status(400).json({ message: 'Vital type, value, and date are required' });
    }

    const result = await db.runAsync(
      `INSERT INTO vitals (user_id, vital_type, value, unit, date)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, vital_type, value, unit || null, date]
    );

    res.status(201).json({
      message: 'Vital added successfully',
      vital: {
        id: result.lastID,
        vital_type,
        value,
        unit,
        date
      }
    });
  } catch (error) {
    console.error('Add vital error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all vitals
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vital_type, start_date, end_date } = req.query;

    let query = 'SELECT * FROM vitals WHERE user_id = ?';
    const params = [userId];

    if (vital_type) {
      query += ' AND vital_type = ?';
      params.push(vital_type);
    }

    if (start_date) {
      query += ' AND date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY date DESC';

    const vitals = await db.allAsync(query, params);

    res.json(vitals);
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vitals grouped by type for charts
router.get('/trends', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT vital_type, value, unit, date
      FROM vitals
      WHERE user_id = ?
    `;
    const params = [userId];

    if (start_date) {
      query += ' AND date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY date ASC';

    const vitals = await db.allAsync(query, params);

    // Group by vital type
    const grouped = {};
    vitals.forEach(vital => {
      if (!grouped[vital.vital_type]) {
        grouped[vital.vital_type] = [];
      }
      grouped[vital.vital_type].push({
        date: vital.date,
        value: parseFloat(vital.value) || vital.value,
        unit: vital.unit
      });
    });

    res.json(grouped);
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vital
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { vital_type, value, unit, date } = req.body;

    // Check ownership
    const vital = await db.getAsync('SELECT * FROM vitals WHERE id = ? AND user_id = ?', [id, userId]);
    if (!vital) {
      return res.status(404).json({ message: 'Vital not found' });
    }

    await db.runAsync(
      `UPDATE vitals SET vital_type = ?, value = ?, unit = ?, date = ? WHERE id = ?`,
      [vital_type || vital.vital_type, value || vital.value, unit || vital.unit, date || vital.date, id]
    );

    res.json({ message: 'Vital updated successfully' });
  } catch (error) {
    console.error('Update vital error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete vital
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const vital = await db.getAsync('SELECT * FROM vitals WHERE id = ? AND user_id = ?', [id, userId]);
    if (!vital) {
      return res.status(404).json({ message: 'Vital not found' });
    }

    await db.runAsync('DELETE FROM vitals WHERE id = ?', [id]);

    res.json({ message: 'Vital deleted successfully' });
  } catch (error) {
    console.error('Delete vital error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
