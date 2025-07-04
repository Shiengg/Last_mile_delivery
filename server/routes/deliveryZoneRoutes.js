const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    getAllDeliveryZones,
    createDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone
} = require('../controllers/deliveryZoneController');

// Protect all routes
router.use(protect);

// Get all delivery zones
router.get('/', getAllDeliveryZones);

// Admin only routes
router.post('/', authorize('Admin'), createDeliveryZone);
router.put('/:id', authorize('Admin'), updateDeliveryZone);
router.delete('/:id', authorize('Admin'), deleteDeliveryZone);

module.exports = router; 