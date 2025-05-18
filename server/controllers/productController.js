// controllers/productController.js
const Product = require('../models/Product');
const Shop = require('../models/Shop'); // Assuming you might want to validate shop_id
const { logActivity } = require('./activityController');


exports.getAllProducts = async (req, res) => {
    try {
        const { shop_id, page = 1, limit = 10, search } = req.query;

        let query = {};

        if (shop_id) {
            // Assuming the 'shop' field in Product model stores the shop_id from Shop model
            query.shop = shop_id;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Product query:', query);

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 }) // Or sort by name, sku, etc.
            .skip(skip)
            .limit(parseInt(limit));

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get single product by MongoDB _id
// @route   GET /api/products/:id (where :id is MongoDB _id)
// @access  Private (Admin)
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error in getProductById:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
    try {
        const { id, shop, name, sku, price, quantity } = req.body;

        // Basic validation (Mongoose schema will also validate)
        if (!id || !shop || !name || !sku || price === undefined || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: id, shop, name, sku, price, quantity'
            });
        }

        // Optional: Validate if shop exists
        const shopExists = await Shop.findOne({ shop_id: shop }); // Assuming 'shop' field in Product stores 'shop_id'
        if (!shopExists) {
            return res.status(400).json({
                success: false,
                message: `Shop with shop_id ${shop} does not exist.`
            });
        }

        // Check for duplicate custom 'id'
        const existingProductById = await Product.findOne({ id });
        if (existingProductById) {
            return res.status(400).json({
                success: false,
                message: `Product with custom ID ${id} already exists.`
            });
        }

        // Check for duplicate SKU (Mongoose unique index will also catch this, but good for user feedback)
        const existingProductBySku = await Product.findOne({ sku });
        if (existingProductBySku) {
            return res.status(400).json({
                success: false,
                message: `Product with SKU ${sku} already exists.`
            });
        }

        const newProduct = new Product({
            id,
            shop,
            name,
            sku,
            price,
            quantity
        });

        await newProduct.save();

        await logActivity(
            'CREATE',
            'PRODUCT',
            `New product ${newProduct.name} (SKU: ${newProduct.sku}) was added`,
            req.user._id, // Assuming req.user is populated by authMiddleware
            {
                entityId: newProduct._id,
                entityName: newProduct.name,
                details: {
                    custom_id: newProduct.id,
                    sku: newProduct.sku,
                    shop_id: newProduct.shop
                }
            }
        );

        res.status(201).json({
            success: true,
            data: newProduct
        });
    } catch (error) {
        console.error('Error creating product:', error);
        let message = 'Error creating product';
        if (error.code === 11000) { // MongoDB duplicate key error
            message = `Product with this SKU or custom ID already exists.`;
        } else if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map(e => e.message).join(', ');
        }
        res.status(400).json({
            success: false,
            message: message,
            error: error.message,
            details: error.errors
        });
    }
};

// @desc    Update a product by MongoDB _id
// @route   PUT /api/products/:id (where :id is MongoDB _id)
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const { shop, name, sku, price, quantity, id: customId } = req.body; // 'id' from body is the customId

        // Find the product by MongoDB _id
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // If SKU is being changed, check for uniqueness among other products
        if (sku && sku !== product.sku) {
            const existingProductBySku = await Product.findOne({ sku, _id: { $ne: product._id } });
            if (existingProductBySku) {
                return res.status(400).json({
                    success: false,
                    message: `Another product with SKU ${sku} already exists.`
                });
            }
        }

        // If custom 'id' is being changed, check for uniqueness among other products
        if (customId && customId !== product.id) {
            const existingProductById = await Product.findOne({ id: customId, _id: { $ne: product._id } });
            if (existingProductById) {
                return res.status(400).json({
                    success: false,
                    message: `Another product with custom ID ${customId} already exists.`
                });
            }
        }

        // Optional: Validate if shop exists if it's being changed
        if (shop && shop !== product.shop) {
            const shopExists = await Shop.findOne({ shop_id: shop });
            if (!shopExists) {
                return res.status(400).json({
                    success: false,
                    message: `Shop with shop_id ${shop} does not exist.`
                });
            }
        }

        // Update fields
        product.id = customId || product.id; // Update custom ID if provided
        product.shop = shop || product.shop;
        product.name = name || product.name;
        product.sku = sku || product.sku;
        product.price = (price !== undefined) ? price : product.price;
        product.quantity = (quantity !== undefined) ? quantity : product.quantity;

        const updatedProduct = await product.save(); // This will run schema validators

        await logActivity(
            'UPDATE',
            'PRODUCT',
            `Product ${updatedProduct.name} (SKU: ${updatedProduct.sku}) was updated`,
            req.user._id,
            {
                entityId: updatedProduct._id,
                entityName: updatedProduct.name,
                details: {
                    custom_id: updatedProduct.id,
                    sku: updatedProduct.sku,
                    shop_id: updatedProduct.shop
                }
            }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        let message = 'Error updating product';
        if (error.code === 11000) { // MongoDB duplicate key error
            message = `Product with this SKU or custom ID already exists.`;
        } else if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map(e => e.message).join(', ');
        }
        res.status(400).json({
            success: false,
            message: message,
            error: error.message,
            details: error.errors
        });
    }
};

// @desc    Delete a product by MongoDB _id
// @route   DELETE /api/products/:id (where :id is MongoDB _id)
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Add any business logic checks here if a product cannot be deleted
        // e.g., if it's part of an active order, etc.

        await Product.findByIdAndDelete(req.params.id);

        await logActivity(
            'DELETE',
            'PRODUCT',
            `Product ${product.name} (SKU: ${product.sku}) was deleted`,
            req.user._id,
            {
                entityId: product._id, // or product.id if you prefer the custom id for logging
                entityName: product.name,
                details: {
                    custom_id: product.id,
                    sku: product.sku,
                    shop_id: product.shop
                }
            }
        );

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};