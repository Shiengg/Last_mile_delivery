const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createCustomerAddress, findCustomerAddress } = require('../controllers/customerAddressController');

// Protect all routes
router.use(protect);

// Routes
router.post('/', createCustomerAddress);
router.get('/find', findCustomerAddress);

module.exports = router;