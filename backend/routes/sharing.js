const express = require('express');
const { getDb } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Share report with another user
router.post('/share', authenticate, (req, res) => {
  try {
    const { report_id, shared_with_email, access_type } = req.body;

    if (!report_id || !shared_with_email) {
      return res.status(400).json({ error: 'Report ID and shared with email are required' });
    }

    const db = getDb();

    // First, verify the report belongs to the current user
    db.get(
      'SELECT user_id FROM reports WHERE id = ?',
      [report_id],
      (err, report) => {
        if (err) {
          console.error('Error checking report:', err);
          return res.status(500).json({ error: 'Error checking report' });
        }

        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }

        if (report.user_id !== req.userId) {
          return res.status(403).json({ error: 'You can only share your own reports' });
        }

        // Find the user to share with
        db.get(
          'SELECT id FROM users WHERE email = ?',
          [shared_with_email],
          (err, sharedUser) => {
            if (err) {
              console.error('Error finding user:', err);
              return res.status(500).json({ error: 'Error finding user' });
            }

            if (!sharedUser) {
              return res.status(404).json({ error: 'User not found' });
            }

            if (sharedUser.id === req.userId) {
              return res.status(400).json({ error: 'Cannot share report with yourself' });
            }

            // Check if already shared
            db.get(
              'SELECT * FROM shared_access WHERE report_id = ? AND shared_with_id = ?',
              [report_id, sharedUser.id],
              (err, existing) => {
                if (err) {
                  console.error('Error checking existing share:', err);
                  return res.status(500).json({ error: 'Error checking existing share' });
                }

                if (existing) {
                  // Update existing share
                  db.run(
                    'UPDATE shared_access SET access_type = ? WHERE report_id = ? AND shared_with_id = ?',
                    [access_type || 'read', report_id, sharedUser.id],
                    (err) => {
                      if (err) {
                        console.error('Error updating share:', err);
                        return res.status(500).json({ error: 'Error updating share' });
                      }

                      res.json({ message: 'Share access updated successfully' });
                    }
                  );
                } else {
                  // Create new share
                  db.run(
                    'INSERT INTO shared_access (report_id, owner_id, shared_with_id, access_type) VALUES (?, ?, ?, ?)',
                    [report_id, req.userId, sharedUser.id, access_type || 'read'],
                    function(err) {
                      if (err) {
                        console.error('Error sharing report:', err);
                        return res.status(500).json({ error: 'Error sharing report' });
                      }

                      res.status(201).json({
                        message: 'Report shared successfully',
                        share_id: this.lastID
                      });
                    }
                  );
                }
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error sharing report:', error);
    res.status(500).json({ error: 'Error sharing report' });
  }
});

// Get shared reports (reports shared with me)
router.get('/shared-with-me', authenticate, (req, res) => {
  const db = getDb();

  db.all(
    `SELECT r.*, u.name as owner_name, u.email as owner_email, sa.access_type, sa.created_at as shared_at
     FROM reports r
     JOIN shared_access sa ON r.id = sa.report_id
     JOIN users u ON sa.owner_id = u.id
     WHERE sa.shared_with_id = ?
     ORDER BY sa.created_at DESC`,
    [req.userId],
    (err, reports) => {
      if (err) {
        console.error('Error fetching shared reports:', err);
        return res.status(500).json({ error: 'Error fetching shared reports' });
      }

      res.json({ reports });
    }
  );
});

// Get reports I've shared
router.get('/shared-by-me', authenticate, (req, res) => {
  const db = getDb();

  db.all(
    `SELECT r.*, u.name as shared_with_name, u.email as shared_with_email, sa.access_type, sa.created_at as shared_at
     FROM reports r
     JOIN shared_access sa ON r.id = sa.report_id
     JOIN users u ON sa.shared_with_id = u.id
     WHERE sa.owner_id = ?
     ORDER BY sa.created_at DESC`,
    [req.userId],
    (err, shares) => {
      if (err) {
        console.error('Error fetching my shares:', err);
        return res.status(500).json({ error: 'Error fetching my shares' });
      }

      res.json({ shares });
    }
  );
});

// Revoke access
router.delete('/revoke/:report_id/:shared_with_id', authenticate, (req, res) => {
  const db = getDb();
  const { report_id, shared_with_id } = req.params;

  // Verify ownership
  db.get(
    'SELECT user_id FROM reports WHERE id = ?',
    [report_id],
    (err, report) => {
      if (err) {
        console.error('Error checking report:', err);
        return res.status(500).json({ error: 'Error checking report' });
      }

      if (!report || report.user_id !== req.userId) {
        return res.status(403).json({ error: 'You can only revoke access to your own reports' });
      }

      db.run(
        'DELETE FROM shared_access WHERE report_id = ? AND shared_with_id = ?',
        [report_id, shared_with_id],
        function(err) {
          if (err) {
            console.error('Error revoking access:', err);
            return res.status(500).json({ error: 'Error revoking access' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Share not found' });
          }

          res.json({ message: 'Access revoked successfully' });
        }
      );
    }
  );
});

module.exports = router;

