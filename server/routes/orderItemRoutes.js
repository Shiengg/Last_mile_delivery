const express = require('express');
// Use mergeParams: true to access :orderMongoId from the parent router
const router = express.Router({ mergeParams: true });
const {
    addItemToOrder,
    getOrderItemsForOrder,
    updateOrderItemInOrder,
    removeOrderItemFromOrder
} = require('../controllers/orderItemController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect); // All these routes are protected

router.route('/')
    .get(authorize('Admin', 'Staff', 'Customer'), getOrderItemsForOrder) // Customer should only see their order's items
    .post(authorize('Admin', 'Staff'), addItemToOrder);

router.route('/:itemMongoId') // itemMongoId is OrderItem's MongoDB _id
    .put(authorize('Admin', 'Staff'), updateOrderItemInOrder)
    .delete(authorize('Admin', 'Staff'), removeOrderItemFromOrder);

module.exports = router;