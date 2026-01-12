const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const db = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Upload report
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { report_type, date, vitals } = req.body;
    const userId = req.user.id;

    if (!report_type || !date) {
      return res.status(400).json({ message: 'Report type and date are required' });
    }

    // Insert report
    const reportResult = await db.runAsync(
      `INSERT INTO reports (user_id, file_name, file_path, file_type, report_type, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        report_type,
        date
      ]
    );

    const reportId = reportResult.lastID;

    // Handle vitals if provided
    if (vitals) {
      try {
        const vitalsArray = JSON.parse(vitals);
        for (const vital of vitalsArray) {
          if (vital.vital_type && vital.value && vital.date) {
            // Insert or update vital
            const vitalResult = await db.runAsync(
              `INSERT INTO vitals (user_id, vital_type, value, unit, date)
               VALUES (?, ?, ?, ?, ?)`,
              [
                userId,
                vital.vital_type,
                vital.value,
                vital.unit || null,
                vital.date
              ]
            );

            // Link vital to report
            await db.runAsync(
              'INSERT INTO report_vitals (report_id, vital_id) VALUES (?, ?)',
              [reportId, vitalResult.lastID]
            );
          }
        }
      } catch (parseError) {
        console.error('Error parsing vitals:', parseError);
      }
    }

    res.status(201).json({
      message: 'Report uploaded successfully',
      report: {
        id: reportId,
        file_name: req.file.originalname,
        report_type,
        date
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reports for user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, report_type, vital_type } = req.query;

    let query = `
      SELECT r.*, 
             GROUP_CONCAT(v.vital_type || ':' || v.value) as vitals
      FROM reports r
      LEFT JOIN report_vitals rv ON r.id = rv.report_id
      LEFT JOIN vitals v ON rv.vital_id = v.id
      WHERE r.user_id = ?
    `;
    const params = [userId];

    if (date) {
      query += ' AND r.date = ?';
      params.push(date);
    }

    if (report_type) {
      query += ' AND r.report_type = ?';
      params.push(report_type);
    }

    query += ' GROUP BY r.id ORDER BY r.date DESC';

    const reports = await db.allAsync(query, params);

    // Also get shared reports
    const sharedReports = await db.allAsync(`
      SELECT r.*, 
             GROUP_CONCAT(v.vital_type || ':' || v.value) as vitals,
             u.name as owner_name
      FROM reports r
      LEFT JOIN report_vitals rv ON r.id = rv.report_id
      LEFT JOIN vitals v ON rv.vital_id = v.id
      LEFT JOIN users u ON r.user_id = u.id
      INNER JOIN shared_access sa ON r.id = sa.report_id
      WHERE sa.shared_with_id = ?
      GROUP BY r.id
      ORDER BY r.date DESC
    `, [userId]);

    res.json({
      myReports: reports.map(r => ({
        ...r,
        file_url: `/uploads/${path.basename(r.file_path)}`,
        vitals: r.vitals ? r.vitals.split(',').map(v => {
          const [type, value] = v.split(':');
          return { type, value };
        }) : []
      })),
      sharedReports: sharedReports.map(r => ({
        ...r,
        file_url: `/uploads/${path.basename(r.file_path)}`,
        vitals: r.vitals ? r.vitals.split(',').map(v => {
          const [type, value] = v.split(':');
          return { type, value };
        }) : []
      }))
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single report
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user owns the report or has shared access
    const report = await db.getAsync(`
      SELECT r.*, u.name as owner_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ? AND (r.user_id = ? OR EXISTS (
        SELECT 1 FROM shared_access sa 
        WHERE sa.report_id = r.id AND sa.shared_with_id = ?
      ))
    `, [id, userId, userId]);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Get associated vitals
    const vitals = await db.allAsync(`
      SELECT v.* FROM vitals v
      INNER JOIN report_vitals rv ON v.id = rv.vital_id
      WHERE rv.report_id = ?
    `, [id]);

    res.json({
      ...report,
      file_url: `/uploads/${path.basename(report.file_path)}`,
      vitals
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const report = await db.getAsync('SELECT * FROM reports WHERE id = ? AND user_id = ?', [id, userId]);
    if (!report) {
      return res.status(404).json({ message: 'Report not found or access denied' });
    }

    // Delete file
    if (fs.existsSync(report.file_path)) {
      fs.unlinkSync(report.file_path);
    }

    // Delete report (cascade will handle related records)
    await db.runAsync('DELETE FROM reports WHERE id = ?', [id]);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
