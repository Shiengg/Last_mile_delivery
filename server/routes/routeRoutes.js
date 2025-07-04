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
    getRouteByCode,
    autoAssignRoutes,
    getPendingRoutes
} = require('../controllers/routeController');

// Protect all routes
router.use(protect);

// Public routes (accessible by both Admin and DeliveryStaff)
router.get('/', getAllRoutes);
router.get('/pending', getPendingRoutes);
router.get('/code/:code', getRouteByCode);
router.get('/:id', getRouteById);

// DeliveryStaff routes
router.put('/:id/status', authorize(['DeliveryStaff', 'Admin']), updateRouteStatus);
router.post('/claim', authorize('DeliveryStaff'), claimRoute);

// Admin only routes
router.post('/', authorize('Admin'), createRoute);
router.delete('/:id', authorize('Admin'), deleteRoute);
router.put('/:id', authorize('Admin'), updateRoute);
router.post('/assign', authorize('Admin'), assignRoute);
router.post('/auto-assign', authorize('Admin'), autoAssignRoutes);

module.exports = router;
