// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  saveProperty,
  getSavedProperties,
  unsaveProperty
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.get('/saved-properties', protect, getSavedProperties);
router.post('/saved-properties/:propertyId', protect, saveProperty);
router.delete('/saved-properties/:propertyId', protect, unsaveProperty);

module.exports = router;