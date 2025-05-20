const express = require('express');
const router = express.Router();
const { getAllProvinces } = require('../controllers/provinceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Debug logging middleware
router.use((req, res, next) => {
    next();
});

// Get all provinces - accessible by Admin only
router.get('/', protect, authorize('Admin'), getAllProvinces);

// Export router
module.exports = router; 