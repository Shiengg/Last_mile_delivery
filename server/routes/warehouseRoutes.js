const express = require('express');
const router = express.Router();
const {
    getAllWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
} = require('../controllers/warehouseController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

// Adjust authorization roles as per your application's needs
// 'DeliverySystem' might be a role for an API key or specific service account
router.route('/')
    .get(authorize('Admin', 'Staff', 'DeliverySystem'), getAllWarehouses)
    .post(authorize('Admin'), createWarehouse);

router.route('/:id') // :id here is Warehouse's MongoDB _id
    .get(authorize('Admin', 'Staff', 'DeliverySystem'), getWarehouseById)
    .put(authorize('Admin'), updateWarehouse)
    .delete(authorize('Admin'), deleteWarehouse);

module.exports = router;