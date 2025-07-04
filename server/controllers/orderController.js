const Order = require('../models/order');
const OrderItem = require('../models/order_item');
const Shop = require('../models/Shop');
const { logActivity } = require('./activityController');

// Helper function to recalculate total price
const recalculateTotalPrice = async (orderId) => {
    const orderItems = await OrderItem.find({ order_id: orderId });
    const totalPrice = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    await Order.findOneAndUpdate({ order_id: orderId }, { total_price: totalPrice });
    return totalPrice;
};

// Helper function to validate shop source
const validateShopSource = (order) => {
    if (order.source.type === 'shop' && order.source.location_id !== order.shop_id) {
        throw new Error('source.location_id must match shop_id when source.type is shop');
    }
};

// Helper function to delete order items
const deleteOrderItems = async (orderId) => {
    console.log(`Removing items for order: ${orderId}`);
    await OrderItem.deleteMany({ order_id: orderId });
};

// @desc    Get all orders (with their items)
exports.getAllOrders = async (req, res) => {
    try {
        const { customer_id, shop_id, status, channel, page = 1, limit = 10, search } = req.query;
        let queryFilters = {};
        if (customer_id) queryFilters.customer_id = customer_id;
        if (shop_id) queryFilters.shop_id = shop_id;
        if (status) queryFilters.status = status;
        if (channel) queryFilters.channel = channel;
        if (search) queryFilters.$or = [{ order_id: { $regex: search, $options: 'i' } }];

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Order.countDocuments(queryFilters);
        const orders = await Order.find(queryFilters)
            .populate('items') // <-- POPULATE ITEMS HERE
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPages = Math.ceil(total / parseInt(limit));
        res.json({ success: true, data: orders, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages } });
    } catch (error) {
        console.error('Error in getAllOrders:', error);
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
};

// @desc    Get single order by MongoDB _id (with its items)
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items'); // <-- POPULATE ITEMS HERE
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Error in getOrderById:', error);
        if (error.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'Order not found' });
        res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
    }
};

// @desc    Create a new order (with items)
exports.createOrder = async (req, res) => {
    const { order_id, customer_id, shop_id, channel, status, items } = req.body;

    if (!order_id || !customer_id || !shop_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Required fields: order_id, customer_id, shop_id, and at least one item in items array.'
        });
    }

    try {
        // Validate shop_id
        const shopExists = await Shop.findOne({ shop_id: shop_id });
        if (!shopExists) return res.status(400).json({ success: false, message: `Shop with shop_id ${shop_id} does not exist.` });

        // Check for duplicate order_id
        const existingOrder = await Order.findOne({ order_id });
        if (existingOrder) return res.status(400).json({ success: false, message: `Order with order_id ${order_id} already exists.` });

        // Calculate initial total_price and validate items
        let calculatedTotalPrice = 0;
        for (const item of items) {
            if (item.quantity === undefined || item.price === undefined || !item.product_sku || !item.product_name) {
                return res.status(400).json({ success: false, message: 'Each item must have product_sku, product_name, quantity, and price.' });
            }
            calculatedTotalPrice += (item.quantity * item.price);
        }

        const newOrder = new Order({
            order_id,
            customer_id,
            shop_id,
            channel: channel || 'web',
            status: status || 'pending',
            total_price: calculatedTotalPrice
        });

        // Validate shop source before saving
        validateShopSource(newOrder);
        await newOrder.save();

        // Create OrderItem documents
        const orderItemDocs = items.map(item => ({
            ...item,
            order_id: newOrder.order_id
        }));
        await OrderItem.insertMany(orderItemDocs);

        // Log activity
        await logActivity('CREATE', 'ORDER', `New order ${newOrder.order_id} created`, req.user._id, { entityId: newOrder._id });

        const populatedOrder = await Order.findById(newOrder._id).populate('items');
        res.status(201).json({ success: true, data: populatedOrder });

    } catch (error) {
        console.error('Error creating order:', error);
        let message = 'Error creating order';
        if (error.code === 11000) message = `Order with this order_id already exists.`;
        else if (error.name === 'ValidationError') message = Object.values(error.errors).map(e => e.message).join(', ');
        res.status(400).json({ success: false, message, error: error.message, details: error.errors });
    }
};

// @desc    Update an order (status, channel, or its items)
exports.updateOrder = async (req, res) => {
    const { channel, status, items } = req.body;

    try {
        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        let updated = false;

        if (channel !== undefined && order.channel !== channel) {
            order.channel = channel;
            updated = true;
        }
        if (status !== undefined && order.status !== status) {
            order.status = status;
            updated = true;
        }

        // Validate shop source before updating
        validateShopSource(order);

        if (items && Array.isArray(items)) {
            await deleteOrderItems(order.order_id);

            if (items.length > 0) {
                const orderItemDocs = items.map(item => {
                    if (item.quantity === undefined || item.price === undefined || !item.product_sku || !item.product_name) {
                        throw new Error('Each item must have product_sku, product_name, quantity, and price during update.');
                    }
                    return {
                        ...item,
                        order_id: order.order_id
                    }
                });
                await OrderItem.insertMany(orderItemDocs);
            }

            // Recalculate total price
            order.total_price = await recalculateTotalPrice(order.order_id);
            updated = true;
        } else if (items === null || (Array.isArray(items) && items.length === 0)) {
            await deleteOrderItems(order.order_id);
            order.total_price = 0;
            updated = true;
        }

        if (updated) {
            await order.save();
        }

        // Log activity
        await logActivity('UPDATE', 'ORDER', `Order ${order.order_id} updated`, req.user._id, { entityId: order._id });

        const populatedOrder = await Order.findById(order._id).populate('items');
        res.json({ success: true, message: 'Order updated successfully', data: populatedOrder });

    } catch (error) {
        console.error('Error updating order:', error);
        let message = 'Error updating order';
        if (error.name === 'ValidationError') message = Object.values(error.errors).map(e => e.message).join(', ');
        res.status(400).json({ success: false, message, error: error.message, details: error.errors });
    }
};

// @desc    Delete an order (and its items)
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const orderIdForLog = order.order_id;

        // Delete associated items first
        await deleteOrderItems(order.order_id);

        // Then delete the order
        await order.remove();

        await logActivity('DELETE', 'ORDER', `Order ${orderIdForLog} was deleted`, req.user._id, { entityId: req.params.id });
        res.json({ success: true, message: 'Order and its items deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        if (error.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'Order not found' });
        res.status(500).json({ success: false, message: 'Error deleting order', error: error.message });
    }
};