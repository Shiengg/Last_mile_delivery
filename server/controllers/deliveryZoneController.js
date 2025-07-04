const DeliveryZone = require('../models/DeliveryZone');

/**
 * Lấy danh sách tất cả delivery zones
 */
const getAllDeliveryZones = async (req, res) => {
    try {
        const zones = await DeliveryZone.find()
            .populate('delivery_staff', 'username fullName')
            .lean();

        res.json({
            success: true,
            data: zones
        });
    } catch (error) {
        console.error('Error getting delivery zones:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery zones',
            error: error.message
        });
    }
};

/**
 * Tạo delivery zone mới
 */
const createDeliveryZone = async (req, res) => {
    try {
        const newZone = new DeliveryZone(req.body);
        await newZone.save();
        res.status(201).json({
            success: true,
            message: 'Delivery zone created successfully',
            data: newZone
        });
    } catch (error) {
        console.error('Error creating delivery zone:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create delivery zone'
        });
    }
};

/**
 * Cập nhật delivery zone
 */
const updateDeliveryZone = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedZone = await DeliveryZone.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        ).populate('delivery_staff', 'fullName email phone status');

        if (!updatedZone) {
            return res.status(404).json({
                success: false,
                message: 'Delivery zone not found'
            });
        }

        res.json({
            success: true,
            message: 'Delivery zone updated successfully',
            data: updatedZone
        });
    } catch (error) {
        console.error('Error updating delivery zone:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update delivery zone'
        });
    }
};

/**
 * Xóa delivery zone
 */
const deleteDeliveryZone = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedZone = await DeliveryZone.findByIdAndDelete(id);

        if (!deletedZone) {
            return res.status(404).json({
                success: false,
                message: 'Delivery zone not found'
            });
        }

        res.json({
            success: true,
            message: 'Delivery zone deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting delivery zone:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete delivery zone'
        });
    }
};

/**
 * Lấy thông tin một delivery zone
 */
const getDeliveryZone = async (req, res) => {
    try {
        const { id } = req.params;
        const zone = await DeliveryZone.findById(id)
            .populate('delivery_staff', 'fullName email phone status')
            .populate('districts', 'name province_id');

        if (!zone) {
            return res.status(404).json({
                success: false,
                message: 'Delivery zone not found'
            });
        }

        res.json({
            success: true,
            data: zone
        });
    } catch (error) {
        console.error('Error getting delivery zone:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllDeliveryZones,
    createDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    getDeliveryZone
}; 