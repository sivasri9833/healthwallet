const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Share report with another user
router.post('/report/:reportId', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { shared_with_email } = req.body;
    const ownerId = req.user.id;

    if (!shared_with_email) {
      return res.status(400).json({ message: 'Email of user to share with is required' });
    }

    // Check if report exists and user owns it
    const report = await db.getAsync('SELECT * FROM reports WHERE id = ? AND user_id = ?', [reportId, ownerId]);
    if (!report) {
      return res.status(404).json({ message: 'Report not found or access denied' });
    }

    // Find user to share with
    const sharedUser = await db.getAsync('SELECT * FROM users WHERE email = ?', [shared_with_email]);
    if (!sharedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (sharedUser.id === ownerId) {
      return res.status(400).json({ message: 'Cannot share with yourself' });
    }

    // Check if already shared
    const existing = await db.getAsync(
      'SELECT * FROM shared_access WHERE report_id = ? AND shared_with_id = ?',
      [reportId, sharedUser.id]
    );

    if (existing) {
      return res.status(400).json({ message: 'Report already shared with this user' });
    }

    // Create share access
    await db.runAsync(
      'INSERT INTO shared_access (report_id, owner_id, shared_with_id, access_type) VALUES (?, ?, ?, ?)',
      [reportId, ownerId, sharedUser.id, 'read']
    );

    res.json({
      message: 'Report shared successfully',
      sharedWith: {
        id: sharedUser.id,
        name: sharedUser.name,
        email: sharedUser.email
      }
    });
  } catch (error) {
    console.error('Share report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shared access list for a report
router.get('/report/:reportId', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    // Check if user owns the report
    const report = await db.getAsync('SELECT * FROM reports WHERE id = ? AND user_id = ?', [reportId, userId]);
    if (!report) {
      return res.status(404).json({ message: 'Report not found or access denied' });
    }

    const sharedAccess = await db.allAsync(`
      SELECT sa.*, u.name, u.email
      FROM shared_access sa
      INNER JOIN users u ON sa.shared_with_id = u.id
      WHERE sa.report_id = ? AND sa.owner_id = ?
    `, [reportId, userId]);

    res.json(sharedAccess);
  } catch (error) {
    console.error('Get shared access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Revoke access
router.delete('/report/:reportId/user/:userId', auth, async (req, res) => {
  try {
    const { reportId, userId } = req.params;
    const ownerId = req.user.id;

    // Check if user owns the report
    const report = await db.getAsync('SELECT * FROM reports WHERE id = ? AND user_id = ?', [reportId, ownerId]);
    if (!report) {
      return res.status(404).json({ message: 'Report not found or access denied' });
    }

    await db.runAsync(
      'DELETE FROM shared_access WHERE report_id = ? AND shared_with_id = ? AND owner_id = ?',
      [reportId, userId, ownerId]
    );

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

