const express = require('express');
const router = express.Router();
const Order = require('../../models/order');
const Channel = require('../../models/Channel');
const OrderItem = require('../../models/OrderItem');
const Route = require('../../models/Route');
const { authenticateApiKey } = require('../../middlewares/auth');

// Validate order data middleware
const validateOrderData = (req, res, next) => {
    const { order_details, customer_info, delivery_address, items } = req.body;

    if (!order_details || !customer_info || !delivery_address || !items || !Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // Validate delivery address
    const requiredAddressFields = ['full_name', 'phone', 'province_id', 'district_id', 'ward_code', 'street'];
    for (const field of requiredAddressFields) {
        if (!delivery_address[field]) {
            return res.status(400).json({
                success: false,
                message: `Missing required field: delivery_address.${field}`
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
router.post('/ecommerce/create', authenticateApiKey, validateOrderData, async (req, res) => {
    try {
        const {
            order_details,
            customer_info,
            delivery_address,
            items
        } = req.body;

        // Kiểm tra channel có tồn tại và active
        const channel = await Channel.findOne({
            code: 'ecommerce',
            status: 'active'
        });

        if (!channel) {
            return res.status(400).json({
                success: false,
                message: 'E-commerce channel is not available'
            });
        }

        // Tạo đơn hàng mới
        const newOrder = new Order({
            order_id: `EC-${Date.now()}`, // Prefix EC cho ecommerce
            customer_id: customer_info.id,
            channel: 'ecommerce',
            source: {
                type: order_details.source_type || 'warehouse',
                location_id: order_details.source_id,
                address: order_details.source_address
            },
            destination: {
                receiver_name: delivery_address.full_name,
                receiver_phone: delivery_address.phone,
                address: {
                    province_id: delivery_address.province_id,
                    district_id: delivery_address.district_id,
                    ward_code: delivery_address.ward_code,
                    street: delivery_address.street,
                    house_number: delivery_address.house_number
                }
            },
            status: 'pending',
            total_price: order_details.total,
            delivery_fee: order_details.delivery_fee || channel.settings.delivery_fee,
            estimated_delivery_time: order_details.estimated_delivery_time || new Date(Date.now() + channel.settings.max_delivery_time * 60000),
            notes: order_details.notes,
            created_at: new Date(),
            updated_at: new Date()
        });

        // Lưu đơn hàng
        await newOrder.save();

        // Tạo các order items
        const orderItems = await Promise.all(items.map(item =>
            OrderItem.create({
                order_id: newOrder.order_id,
                product_name: item.name,
                product_sku: item.sku,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            })
        ));

        // Tạo route mới cho đơn hàng
        const route = new Route({
            route_code: `RT-${Date.now()}`,
            channel: 'ecommerce',
            shops: [{
                shop_id: order_details.source_id,
                order: 1,
                status: 'pending'
            }],
            status: 'pending',
            distance: order_details.estimated_distance || 0,
            channel_settings: {
                priority: channel.settings.delivery_priority,
                max_delivery_time: channel.settings.max_delivery_time
            }
        });

        await route.save();

        // Cập nhật order với route_id
        newOrder.route_id = route._id;
        await newOrder.save();

        // Trả về response
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order_id: newOrder.order_id,
                route_id: route.route_code,
                status: newOrder.status,
                estimated_delivery_time: newOrder.estimated_delivery_time,
                tracking_url: `${process.env.CLIENT_URL}/tracking/${newOrder.order_id}`
            }
        });

    } catch (error) {
        console.error('Error creating ecommerce order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
});

// API endpoint để cập nhật trạng thái đơn hàng
router.post('/ecommerce/webhook', authenticateApiKey, async (req, res) => {
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