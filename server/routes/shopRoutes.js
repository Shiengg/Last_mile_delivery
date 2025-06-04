const express = require('express');
const router = express.Router();
const { getAllShops, createShop, updateShop, deleteShop } = require('../controllers/shopController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

// Admin only routes
router.get('/', authorize('Admin'), getAllShops);
router.post('/', authorize('Admin'), createShop);
router.put('/:id', authorize('Admin'), updateShop);
router.delete('/:id', authorize('Admin'), deleteShop);

module.exports = router;
