// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  updateAmenities,
  deleteProperty,
  uploadPropertyImages,
  deletePropertyImage
} = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

// Public routes
router.get('/', getAllProperties);

// Private routes (must come before /:id)
router.get('/my-listings', protect, getMyProperties);

router.get('/:id', getPropertyById);

// Other private routes
router.post('/', protect, createProperty);
router.put('/:id', protect, updateProperty);
router.put('/:id/amenities', protect, updateAmenities);
router.delete('/:id', protect, deleteProperty);

// Image routes
router.post('/:id/images', protect, upload.array('images', 5), uploadPropertyImages);
router.delete('/:id/images/:imageId', protect, deletePropertyImage);

module.exports = router;