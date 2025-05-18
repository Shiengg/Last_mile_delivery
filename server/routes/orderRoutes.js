const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .get(authorize('Admin', 'Staff'), getAllOrders)
    .post(authorize('Admin', 'Customer'), createOrder);

router.route('/:id') // :id here refers to Order's MongoDB _id
    .get(authorize('Admin', 'Staff', 'Customer'), getOrderById)
    .put(authorize('Admin', 'Staff'), updateOrder)
    .delete(authorize('Admin'), deleteOrder);

module.exports = router;