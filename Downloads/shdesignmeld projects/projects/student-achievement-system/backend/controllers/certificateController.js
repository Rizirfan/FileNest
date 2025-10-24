const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Get all certificates for user
exports.getCertificates = async (req, res) => {
  try {
    const certificates = await pool.query(
      'SELECT * FROM certificates WHERE user_id = $1 ORDER BY issue_date DESC',
      [req.user.id]
    );

    res.json(certificates.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single certificate
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await pool.query(
      'SELECT * FROM certificates WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (certificate.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json(certificate.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create certificate
exports.createCertificate = async (req, res) => {
  try {
    const { title, description, issuer, issue_date, category } = req.body;
    const file_path = req.file ? req.file.path : null;

    const newCertificate = await pool.query(
      'INSERT INTO certificates (user_id, title, description, issuer, issue_date, file_path, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, title, description, issuer, issue_date, file_path, category]
    );

    res.status(201).json(newCertificate.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update certificate
exports.updateCertificate = async (req, res) => {
  try {
    const { title, description, issuer, issue_date, category } = req.body;
    const file_path = req.file ? req.file.path : null;

    // Check if certificate exists
    const certificate = await pool.query(
      'SELECT * FROM certificates WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (certificate.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Delete old file if new file is uploaded
    if (file_path && certificate.rows[0].file_path) {
      fs.unlinkSync(certificate.rows[0].file_path);
    }

    const updatedCertificate = await pool.query(
      'UPDATE certificates SET title = $1, description = $2, issuer = $3, issue_date = $4, category = $5, file_path = COALESCE($6, file_path) WHERE id = $7 AND user_id = $8 RETURNING *',
      [title, description, issuer, issue_date, category, file_path, req.params.id, req.user.id]
    );

    res.json(updatedCertificate.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await pool.query(
      'SELECT * FROM certificates WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (certificate.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Delete file if exists
    if (certificate.rows[0].file_path) {
      fs.unlinkSync(certificate.rows[0].file_path);
    }

    await pool.query(
      'DELETE FROM certificates WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Certificate deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};