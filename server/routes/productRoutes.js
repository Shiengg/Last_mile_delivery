const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protect all product routes
router.use(protect);

router.route('/')
    .get(authorize('Admin'), getAllProducts)
    .post(authorize('Admin'), createProduct);

router.route('/:id') // :id here refers to MongoDB _id
    .get(authorize('Admin'), getProductById)
    .put(authorize('Admin'), updateProduct)
    .delete(authorize('Admin'), deleteProduct);

module.exports = router;