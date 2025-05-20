const express = require('express');
const router = express.Router();
const Order = require('../../models/order');
const Channel = require('../../models/Channel');
const OrderItem = require('../../models/order_item');
const Route = require('../../models/Route');
const Shop = require('../../models/Shop');
const { protect, authorize } = require('../../middlewares/authMiddleware');

// Validate order data middleware
const validateOrderData = (req, res, next) => {
    const { order_details, customer_info, destination, items } = req.body;

    if (!order_details || !customer_info || !destination || !items || !Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // Validate delivery address
    const requiredAddressFields = ['province_id', 'district_id', 'ward_code', 'street'];
    for (const field of requiredAddressFields) {
        if (!destination.address[field]) {
            return res.status(400).json({
                success: false,
                message: `Missing required field: destination.address.${field}`
            });
        }
    }

    // Validate items
    if (items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Order must contain at least one item'
        });
    }

    for (const item of items) {
        if (!item.name || !item.sku || !item.quantity || !item.price) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item data'
            });
        }
    }

    next();
};

// API endpoint để nhận đơn hàng từ website
router.post('/ecommerce/create', protect, authorize('Admin', 'Customer', 'EcommerceIntegration'), validateOrderData, async (req, res) => {
    try {
        const {
            order_details,
            customer_info,
            destination,
            items,
            channel,
            shop_id,
            source
        } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!shop_id || !source || !source.type || !source.location_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin shop_id hoặc source (type, location_id)'
            });
        }

        // Kiểm tra channel có tồn tại và active
        const channelDoc = await Channel.findOne({
            code: channel || 'ecommerce',
            status: 'active'
        });

        if (!channelDoc) {
            return res.status(400).json({
                success: false,
                message: 'Channel không khả dụng'
            });
        }

        // Kiểm tra shop tồn tại
        const shopExists = await Shop.findOne({ shop_id: shop_id });
        if (!shopExists) {
            return res.status(400).json({
                success: false,
                message: `Shop với ID ${shop_id} không tồn tại`
            });
        }

        // Tính tổng tiền từ items
        const calculatedTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        // Tạo đơn hàng mới
        const newOrder = new Order({
            order_id: `${channel === 'warehouse' ? 'WH' : 'EC'}-${Date.now()}`, // Prefix WH cho warehouse, EC cho ecommerce
            customer_id: req.user._id.toString(), // Lấy user ID từ token
            channel: channel || 'ecommerce',
            shop_id: shop_id,
            source: source,
            destination: destination,
            status: 'pending',
            total_price: calculatedTotal,
            delivery_fee: order_details.delivery_fee || channelDoc.settings.delivery_fee || 0,
            estimated_delivery_time: order_details.estimated_delivery_time,
            notes: order_details.notes
        });

        // Log dữ liệu trước khi lưu để debug
        console.log('Order data before save:', {
            order_id: newOrder.order_id,
            shop_id: newOrder.shop_id,
            source: newOrder.source,
            total_price: newOrder.total_price
        });

        // Lưu đơn hàng
        await newOrder.save();

        // Tạo các order items
        const orderItemDocs = items.map(item => ({
            order_id: newOrder.order_id,
            product_name: item.name,
            product_sku: item.sku,
            quantity: item.quantity,
            price: item.price
        }));

        // Lưu tất cả order items
        await OrderItem.insertMany(orderItemDocs);

        // Lấy order đã populate items để trả về
        const populatedOrder = await Order.findById(newOrder._id).populate('items');

        // Trả về response với đầy đủ thông tin
        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công',
            data: {
                order: populatedOrder,
                order_id: newOrder.order_id,
                status: newOrder.status,
                total_price: newOrder.total_price,
                items: populatedOrder.items,
                estimated_delivery_time: newOrder.estimated_delivery_time,
                tracking_url: `/tracking/${newOrder.order_id}`
            }
        });

    } catch (error) {
        console.error('Error creating ecommerce order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đơn hàng',
            error: error.message
        });
    }
});

// API endpoint để cập nhật trạng thái đơn hàng
router.post('/ecommerce/webhook', protect, authorize('Admin', 'DeliveryStaff'), async (req, res) => {
    try {
        const { order_id, status, notes } = req.body;

        const order = await Order.findOne({ order_id });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        if (notes) order.notes = notes;
        order.updated_at = new Date();
        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: {
                order_id: order.order_id,
                status: order.status
            }
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
});

module.exports = router; 