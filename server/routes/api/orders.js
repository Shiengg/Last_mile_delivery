const express = require('express');
const router = express.Router();
const Order = require('../../models/order');
const Channel = require('../../models/Channel');
const { authenticateToken } = require('../../middlewares/auth');

// API endpoint để nhận đơn hàng từ website
router.post('/ecommerce/create', async (req, res) => {
    try {
        const {
            order_details,
            customer_info,
            delivery_address,
            items
        } = req.body;

        // Validate API key hoặc token từ website
        // TODO: Implement authentication logic here

        // Tạo đơn hàng mới
        const newOrder = new Order({
            order_id: `EC-${Date.now()}`, // Prefix EC cho ecommerce
            customer_id: customer_info.id,
            channel: 'ecommerce',
            source: {
                type: 'warehouse', // hoặc 'shop' tùy theo inventory
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
            delivery_fee: order_details.delivery_fee,
            estimated_delivery_time: order_details.estimated_delivery_time,
            notes: order_details.notes
        });

        // Lưu đơn hàng
        await newOrder.save();

        // Tạo các order items
        for (const item of items) {
            await OrderItem.create({
                order_id: newOrder.order_id,
                product_name: item.name,
                product_sku: item.sku,
                quantity: item.quantity,
                price: item.price
            });
        }

        // Trigger tạo route
        await createOrUpdateRoute(newOrder);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order_id: newOrder.order_id,
                status: newOrder.status,
                estimated_delivery_time: newOrder.estimated_delivery_time
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

// Các routes khác...

module.exports = router; 