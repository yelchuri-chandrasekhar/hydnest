// routes/enquiryRoutes.js
const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getMyEnquiries,
  getReceivedEnquiries,
  updateEnquiryStatus
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/sent', protect, getMyEnquiries);
router.get('/received', protect, getReceivedEnquiries);
router.put('/:id/status', protect, updateEnquiryStatus);
router.post('/:propertyId', protect, createEnquiry);

module.exports = router;