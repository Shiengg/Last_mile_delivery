const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    createRoute,
    getAllRoutes,
    updateRouteStatus,
    deleteRoute,
    updateRoute,
    assignRoute,
    claimRoute,
    getRouteById,
    getRouteByCode
} = require('../controllers/routeController');

// Protect all routes
router.use(protect);

// Public routes (accessible by both Admin and DeliveryStaff)
router.get('/', getAllRoutes);
router.get('/:id', getRouteById);
router.get('/code/:code', getRouteByCode);

// DeliveryStaff routes
router.put('/:id/status', authorize(['DeliveryStaff', 'Admin']), updateRouteStatus);
router.post('/claim', authorize('DeliveryStaff'), claimRoute);

// Admin only routes
router.post('/', authorize('Admin'), createRoute);
router.delete('/:id', authorize('Admin'), deleteRoute);
router.put('/:id', authorize('Admin'), updateRoute);
router.post('/assign', authorize('Admin'), assignRoute);

module.exports = router;
