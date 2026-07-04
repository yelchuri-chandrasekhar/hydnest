// controllers/propertyController.js
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// @desc    Create a new property (owner only)
// @route   POST /api/properties
// @access  Private
const createProperty = async (req, res) => {
  const client = await pool.connect();
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can list properties' });
    }

    const {
      title, description, property_type, gender_preference,
      furnishing, rent, deposit, area, address, city,
      latitude, longitude, available_from,
      amenities // optional object: { wifi, ac, parking, food, laundry, gym, cctv, pet_friendly }
    } = req.body;

    if (!title || !property_type || !rent || !area || !address) {
      return res.status(400).json({ message: 'Title, property type, rent, area, and address are required' });
    }

    await client.query('BEGIN');

    const propertyResult = await client.query(
      `INSERT INTO properties
        (owner_id, title, description, property_type, gender_preference, furnishing, rent, deposit, area, address, city, latitude, longitude, available_from)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11,'Hyderabad'),$12,$13,$14)
       RETURNING *`,
      [req.user.id, title, description, property_type, gender_preference, furnishing, rent, deposit, area, address, city, latitude, longitude, available_from]
    );

    const property = propertyResult.rows[0];

    // Create amenities row (defaults to all false if not provided)
    const a = amenities || {};
    await client.query(
      `INSERT INTO amenities
        (property_id, wifi, ac, parking, food, laundry, gym, cctv, pet_friendly)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [property.id, !!a.wifi, !!a.ac, !!a.parking, !!a.food, !!a.laundry, !!a.gym, !!a.cctv, !!a.pet_friendly]
    );

    await client.query('COMMIT');

    res.status(201).json({ message: 'Property created successfully', property });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create property error:', error.message);
    res.status(500).json({ message: 'Server error while creating property' });
  } finally {
    client.release();
  }
};

// @desc    Get all properties (with filters)
// @route   GET /api/properties?city=&property_type=&gender_preference=&furnishing=&min_rent=&max_rent=
// @access  Public
const getAllProperties = async (req, res) => {
  try {
    const { city, property_type, gender_preference, furnishing, min_rent, max_rent } = req.query;

    let query = `
      SELECT p.*, 
        json_build_object(
          'wifi', a.wifi, 'ac', a.ac, 'parking', a.parking, 'food', a.food,
          'laundry', a.laundry, 'gym', a.gym, 'cctv', a.cctv, 'pet_friendly', a.pet_friendly
        ) AS amenities
      FROM properties p
      LEFT JOIN amenities a ON a.property_id = p.id
      WHERE p.available = true
    `;
    const values = [];

    if (city) {
      values.push(city);
      query += ` AND p.city ILIKE $${values.length}`;
    }
    if (property_type) {
      values.push(property_type);
      query += ` AND p.property_type = $${values.length}`;
    }
    if (gender_preference) {
      values.push(gender_preference);
      query += ` AND p.gender_preference = $${values.length}`;
    }
    if (furnishing) {
      values.push(furnishing);
      query += ` AND p.furnishing = $${values.length}`;
    }
    if (min_rent) {
      values.push(min_rent);
      query += ` AND p.rent >= $${values.length}`;
    }
    if (max_rent) {
      values.push(max_rent);
      query += ` AND p.rent <= $${values.length}`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, values);
    res.status(200).json({ count: result.rows.length, properties: result.rows });
  } catch (error) {
    console.error('Get properties error:', error.message);
    res.status(500).json({ message: 'Server error while fetching properties' });
  }
};

// @desc    Get single property by ID (with amenities + images)
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const propertyResult = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const amenitiesResult = await pool.query('SELECT * FROM amenities WHERE property_id = $1', [id]);
    const imagesResult = await pool.query('SELECT id, image_url FROM property_images WHERE property_id = $1', [id]);

    res.status(200).json({
      property: propertyResult.rows[0],
      amenities: amenitiesResult.rows[0] || null,
      images: imagesResult.rows
    });
  } catch (error) {
    console.error('Get property error:', error.message);
    res.status(500).json({ message: 'Server error while fetching property' });
  }
};

// @desc    Get properties listed by the logged-in owner
// @route   GET /api/properties/my-listings
// @access  Private
const getMyProperties = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM properties WHERE owner_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.status(200).json({ count: result.rows.length, properties: result.rows });
  } catch (error) {
    console.error('Get my properties error:', error.message);
    res.status(500).json({ message: 'Server error while fetching your properties' });
  }
};

// @desc    Update a property (owner only)
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const {
      title, description, property_type, gender_preference, furnishing,
      rent, deposit, area, address, city, latitude, longitude,
      available, available_from
    } = req.body;

    const result = await pool.query(
      `UPDATE properties SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        property_type = COALESCE($3, property_type),
        gender_preference = COALESCE($4, gender_preference),
        furnishing = COALESCE($5, furnishing),
        rent = COALESCE($6, rent),
        deposit = COALESCE($7, deposit),
        area = COALESCE($8, area),
        address = COALESCE($9, address),
        city = COALESCE($10, city),
        latitude = COALESCE($11, latitude),
        longitude = COALESCE($12, longitude),
        available = COALESCE($13, available),
        available_from = COALESCE($14, available_from)
       WHERE id = $15
       RETURNING *`,
      [title, description, property_type, gender_preference, furnishing, rent, deposit, area, address, city, latitude, longitude, available, available_from, id]
    );

    res.status(200).json({ message: 'Property updated successfully', property: result.rows[0] });
  } catch (error) {
    console.error('Update property error:', error.message);
    res.status(500).json({ message: 'Server error while updating property' });
  }
};

// @desc    Update amenities for a property (owner only)
// @route   PUT /api/properties/:id/amenities
// @access  Private
const updateAmenities = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT owner_id FROM properties WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const { wifi, ac, parking, food, laundry, gym, cctv, pet_friendly } = req.body;

    const result = await pool.query(
      `UPDATE amenities SET
        wifi = COALESCE($1, wifi),
        ac = COALESCE($2, ac),
        parking = COALESCE($3, parking),
        food = COALESCE($4, food),
        laundry = COALESCE($5, laundry),
        gym = COALESCE($6, gym),
        cctv = COALESCE($7, cctv),
        pet_friendly = COALESCE($8, pet_friendly)
       WHERE property_id = $9
       RETURNING *`,
      [wifi, ac, parking, food, laundry, gym, cctv, pet_friendly, id]
    );

    res.status(200).json({ message: 'Amenities updated successfully', amenities: result.rows[0] });
  } catch (error) {
    console.error('Update amenities error:', error.message);
    res.status(500).json({ message: 'Server error while updating amenities' });
  }
};

// @desc    Delete a property (owner only)
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT owner_id FROM properties WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await pool.query('DELETE FROM properties WHERE id = $1', [id]);
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error.message);
    res.status(500).json({ message: 'Server error while deleting property' });
  }
};

// @desc    Upload images for a property (owner only)
// @route   POST /api/properties/:id/images
// @access  Private
const uploadPropertyImages = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT owner_id FROM properties WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add images to this property' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const insertedImages = [];
    for (const file of req.files) {
      const imageUrl = `/uploads/properties/${file.filename}`;
      const result = await pool.query(
        `INSERT INTO property_images (property_id, image_url) VALUES ($1, $2) RETURNING *`,
        [id, imageUrl]
      );
      insertedImages.push(result.rows[0]);
    }

    res.status(201).json({ message: 'Images uploaded successfully', images: insertedImages });
  } catch (error) {
    console.error('Upload images error:', error.message);
    res.status(500).json({ message: 'Server error while uploading images' });
  }
};

// @desc    Delete a single property image (owner only)
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private
const deletePropertyImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const property = await pool.query('SELECT owner_id FROM properties WHERE id = $1', [id]);
    if (property.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this image' });
    }

    const image = await pool.query(
      'SELECT * FROM property_images WHERE id = $1 AND property_id = $2',
      [imageId, id]
    );
    if (image.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete the physical file
    const filePath = path.join(__dirname, '..', image.rows[0].image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM property_images WHERE id = $1', [imageId]);

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error.message);
    res.status(500).json({ message: 'Server error while deleting image' });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  updateAmenities,
  deleteProperty,
  uploadPropertyImages,
  deletePropertyImage
};