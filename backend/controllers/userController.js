// controllers/userController.js
const pool = require('../config/db');

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone)
       WHERE id = $3
       RETURNING id, name, email, phone, role, created_at`,
      [name, phone, req.user.id]
    );

    res.status(200).json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// @desc    Save a property (tenant bookmarks a listing)
// @route   POST /api/users/saved-properties/:propertyId
// @access  Private
const saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await pool.query('SELECT id FROM properties WHERE id = $1', [propertyId]);
    if (property.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const result = await pool.query(
      `INSERT INTO saved_properties (user_id, property_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, property_id) DO NOTHING
       RETURNING *`,
      [req.user.id, propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Property already saved' });
    }

    res.status(201).json({ message: 'Property saved successfully', saved: result.rows[0] });
  } catch (error) {
    console.error('Save property error:', error.message);
    res.status(500).json({ message: 'Server error while saving property' });
  }
};

// @desc    Get all saved properties for logged-in user
// @route   GET /api/users/saved-properties
// @access  Private
const getSavedProperties = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, sp.created_at AS saved_at
       FROM saved_properties sp
       JOIN properties p ON p.id = sp.property_id
       WHERE sp.user_id = $1
       ORDER BY sp.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json({ count: result.rows.length, properties: result.rows });
  } catch (error) {
    console.error('Get saved properties error:', error.message);
    res.status(500).json({ message: 'Server error while fetching saved properties' });
  }
};

// @desc    Remove a saved property
// @route   DELETE /api/users/saved-properties/:propertyId
// @access  Private
const unsaveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const result = await pool.query(
      'DELETE FROM saved_properties WHERE user_id = $1 AND property_id = $2 RETURNING *',
      [req.user.id, propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Saved property not found' });
    }

    res.status(200).json({ message: 'Property removed from saved list' });
  } catch (error) {
    console.error('Unsave property error:', error.message);
    res.status(500).json({ message: 'Server error while removing saved property' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  saveProperty,
  getSavedProperties,
  unsaveProperty
};