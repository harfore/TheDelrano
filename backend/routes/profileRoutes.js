const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');

router
    .route('/')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;