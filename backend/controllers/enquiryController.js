// controllers/enquiryController.js
const pool = require('../config/db');

// @desc    Send an enquiry about a property (tenant only)
// @route   POST /api/enquiries/:propertyId
// @access  Private
const createEnquiry = async (req, res) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can send enquiries' });
    }

    const { propertyId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const property = await pool.query('SELECT id, owner_id FROM properties WHERE id = $1', [propertyId]);
    if (property.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const result = await pool.query(
      `INSERT INTO enquiries (tenant_id, property_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, propertyId, message]
    );

    res.status(201).json({ message: 'Enquiry sent successfully', enquiry: result.rows[0] });
  } catch (error) {
    console.error('Create enquiry error:', error.message);
    res.status(500).json({ message: 'Server error while sending enquiry' });
  }
};

// @desc    Get enquiries sent by the logged-in tenant
// @route   GET /api/enquiries/sent
// @access  Private
const getMyEnquiries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, p.title AS property_title
       FROM enquiries e
       JOIN properties p ON p.id = e.property_id
       WHERE e.tenant_id = $1
       ORDER BY e.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json({ count: result.rows.length, enquiries: result.rows });
  } catch (error) {
    console.error('Get my enquiries error:', error.message);
    res.status(500).json({ message: 'Server error while fetching enquiries' });
  }
};

// @desc    Get enquiries received on the logged-in owner's properties
// @route   GET /api/enquiries/received
// @access  Private
const getReceivedEnquiries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, p.title AS property_title, u.name AS tenant_name, u.phone AS tenant_phone
       FROM enquiries e
       JOIN properties p ON p.id = e.property_id
       JOIN users u ON u.id = e.tenant_id
       WHERE p.owner_id = $1
       ORDER BY e.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json({ count: result.rows.length, enquiries: result.rows });
  } catch (error) {
    console.error('Get received enquiries error:', error.message);
    res.status(500).json({ message: 'Server error while fetching enquiries' });
  }
};

// @desc    Update enquiry status (owner only)
// @route   PUT /api/enquiries/:id/status
// @access  Private
const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const enquiry = await pool.query(
      `SELECT e.id FROM enquiries e
       JOIN properties p ON p.id = e.property_id
       WHERE e.id = $1 AND p.owner_id = $2`,
      [id, req.user.id]
    );

    if (enquiry.rows.length === 0) {
      return res.status(404).json({ message: 'Enquiry not found or not authorized' });
    }

    const result = await pool.query(
      'UPDATE enquiries SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.status(200).json({ message: 'Enquiry status updated', enquiry: result.rows[0] });
  } catch (error) {
    console.error('Update enquiry status error:', error.message);
    res.status(500).json({ message: 'Server error while updating enquiry status' });
  }
};

module.exports = {
  createEnquiry,
  getMyEnquiries,
  getReceivedEnquiries,
  updateEnquiryStatus
};