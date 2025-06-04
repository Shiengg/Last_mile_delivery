const Shop = require('../models/Shop');
const Route = require('../models/Route');
const { logActivity } = require('./activityController');

// Helper Functions
const formatShopId = async (ward_code) => {
    try {
        const lastShop = await Shop.findOne({
            shop_id: new RegExp(`^${ward_code}`, 'i')
        }).sort({ shop_id: -1 });

        if (!lastShop) {
            return `${ward_code}001`;
        }

        const lastNumber = parseInt(lastShop.shop_id.slice(-3));
        const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
        return `${ward_code}${nextNumber}`;
    } catch (error) {
        throw new Error(`Error generating shop ID: ${error.message}`);
    }
};

const validateShopId = async (shop_id, currentShopId = null) => {
    const existingShop = await Shop.findOne({
        shop_id: shop_id,
        _id: { $ne: currentShopId }
    });

    if (existingShop) {
        throw new Error('Shop ID must be unique');
    }
};

const formatIds = (data) => {
    if (data.province_id) {
        data.province_id = data.province_id.toString().padStart(2, '0');
    }
    if (data.district_id) {
        data.district_id = data.district_id.toString().padStart(3, '0');
    }
    return data;
};

const validateRequiredFields = (data) => {
    const requiredFields = ['shop_name', 'province_id', 'district_id', 'ward_code', 'street', 'latitude', 'longitude'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
};

// Controller Functions
exports.getAllShops = async (req, res) => {
    try {
        const { ward_code, status, page = 1, limit = 10, search } = req.query;

        let query = {};
        if (ward_code) query.ward_code = ward_code;
        if (status) query.status = status;

        if (search) {
            query.$or = [
                { shop_name: { $regex: search, $options: 'i' } },
                { shop_id: { $regex: search, $options: 'i' } },
                { street: { $regex: search, $options: 'i' } }
            ];
        }

        const projection = parseInt(limit) > 100 ? {
            shop_id: 1,
            shop_name: 1,
            house_number: 1,
            street: 1,
            shop_type: 1,
            status: 1
        } : null;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Shop.countDocuments(query);

        const shops = await Shop.find(query, projection)
            .sort({ shop_id: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: shops,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error in getAllShops:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shops',
            error: error.message
        });
    }
};

exports.createShop = async (req, res) => {
    try {
        const shopData = req.body;

        // Validate ward_code
        if (!shopData.ward_code || shopData.ward_code.length !== 5) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ward code format'
            });
        }

        // Validate required fields
        validateRequiredFields(shopData);

        // Format IDs
        const formattedData = formatIds(shopData);

        // Generate shop_id if not provided
        if (!formattedData.shop_id) {
            formattedData.shop_id = await formatShopId(formattedData.ward_code);
        }

        // Validate shop_id uniqueness
        await validateShopId(formattedData.shop_id);

        // Create new shop
        const newShop = new Shop(formattedData);
        await newShop.save();

        // Log activity
        await logActivity(
            'CREATE',
            'SHOP',
            `New shop ${newShop.shop_name} was added`,
            req.user._id,
            {
                entityId: newShop._id,
                entityName: newShop.shop_name,
                details: {
                    shop_id: newShop.shop_id,
                    location: `${newShop.street}, ${newShop.ward_code}`
                }
            }
        );

        res.status(201).json({
            success: true,
            data: newShop
        });
    } catch (error) {
        console.error('Error creating shop:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error creating shop',
            error: error.message,
            details: error.errors
        });
    }
};

exports.updateShop = async (req, res) => {
    try {
        const shopData = req.body;

        // Validate required fields
        validateRequiredFields(shopData);

        // Format IDs
        const formattedData = formatIds(shopData);

        // If shop_id is being modified, validate its uniqueness
        if (shopData.shop_id) {
            await validateShopId(shopData.shop_id, req.params.id);
        }

        // Find and update shop
        const updatedShop = await Shop.findByIdAndUpdate(
            req.params.id,
            formattedData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedShop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        // Log activity
        await logActivity(
            'UPDATE',
            'SHOP',
            `Shop ${updatedShop.shop_name} was updated`,
            req.user._id,
            {
                entityId: updatedShop._id,
                entityName: updatedShop.shop_name,
                details: {
                    shop_id: updatedShop.shop_id,
                    location: `${updatedShop.street}, ${updatedShop.ward_code}`
                }
            }
        );

        res.json({
            success: true,
            message: 'Shop updated successfully',
            data: updatedShop
        });
    } catch (error) {
        console.error('Error updating shop:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating shop',
            error: error.message,
            details: error.errors
        });
    }
};

exports.deleteShop = async (req, res) => {
    try {
        const { id } = req.params;

        const shop = await Shop.findById(id);
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        // Check if shop is used in any route
        const routeWithShop = await Route.findOne({
            'shops.shop_id': shop.shop_id
        });

        if (routeWithShop) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete shop that is assigned to a route'
            });
        }

        await Shop.findByIdAndDelete(id);

        // Log activity
        await logActivity(
            'DELETE',
            'SHOP',
            `Shop ${shop.shop_name} was deleted`,
            req.user._id,
            {
                entityId: shop._id,
                entityName: shop.shop_name,
                details: {
                    shop_id: shop.shop_id,
                    location: `${shop.street}, ${shop.ward_code}`
                }
            }
        );

        res.json({
            success: true,
            message: 'Shop deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting shop:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting shop',
            error: error.message
        });
    }
};

// Export helper functions for testing
exports.helpers = {
    formatShopId,
    validateShopId,
    formatIds,
    validateRequiredFields
};
