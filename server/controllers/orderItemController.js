// controllers/orderItemController.js
const Order = require('../models/order');
const OrderItem = require('../models/order_item');
const { logActivity } = require('./activityController');

// @desc    Add an item to an existing order
exports.addItemToOrder = async (req, res) => {
    const { product_name, product_sku, quantity, price } = req.body;
    const orderMongoId = req.params.orderMongoId;

    if (!product_name || !product_sku || quantity === undefined || price === undefined) {
        return res.status(400).json({ success: false, message: 'Item details required: product_name, product_sku, quantity, price.' });
    }

    try {
        const order = await Order.findById(orderMongoId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        const newItem = await OrderItem.create({
            order_id: order.order_id,
            product_name,
            product_sku,
            quantity,
            price
        });

        await order.recalculateTotalPrice(); // Recalculate and save

        await logActivity('CREATE', 'ORDER_ITEM', `Item ${newItem.product_sku} added to order ${order.order_id}`, req.user._id, { entityId: newItem._id });

        const updatedOrder = await Order.findById(orderMongoId).populate('items');
        res.status(201).json({ success: true, data: updatedOrder });

    } catch (error) {
        console.error('Error adding item to order:', error);
        res.status(400).json({ success: false, message: 'Error adding item', error: error.message });
    }
};

// @desc    Update a specific item within an order
exports.updateOrderItemInOrder = async (req, res) => {
    const { quantity, price, product_name, product_sku } = req.body;
    const { orderMongoId, itemMongoId } = req.params;

    try {
        const order = await Order.findById(orderMongoId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        const item = await OrderItem.findOne({ _id: itemMongoId, order_id: order.order_id });
        if (!item) return res.status(404).json({ success: false, message: 'Order item not found within this order.' });

        if (quantity !== undefined) item.quantity = quantity;
        if (price !== undefined) item.price = price;
        if (product_name !== undefined) item.product_name = product_name;
        if (product_sku !== undefined) item.product_sku = product_sku;

        await item.save();
        await order.recalculateTotalPrice();

        await logActivity('UPDATE', 'ORDER_ITEM', `Item ${item.product_sku} in order ${order.order_id} updated`, req.user._id, { entityId: item._id });

        const updatedOrder = await Order.findById(orderMongoId).populate('items');
        res.json({ success: true, data: updatedOrder });

    } catch (error) {
        console.error('Error updating order item:', error);
        res.status(400).json({ success: false, message: 'Error updating item', error: error.message });
    }
};

// @desc    Remove a specific item from an order
exports.removeOrderItemFromOrder = async (req, res) => {
    const { orderMongoId, itemMongoId } = req.params;

    try {
        const order = await Order.findById(orderMongoId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        const item = await OrderItem.findOne({ _id: itemMongoId, order_id: order.order_id });
        if (!item) return res.status(404).json({ success: false, message: 'Order item not found within this order.' });

        const skuForLog = item.product_sku;
        await item.remove();
        await order.recalculateTotalPrice(); // Recalculate and save

        await logActivity('DELETE', 'ORDER_ITEM', `Item ${skuForLog} removed from order ${order.order_id}`, req.user._id, { entityId: itemMongoId });

        const updatedOrder = await Order.findById(orderMongoId).populate('items');
        res.json({ success: true, data: updatedOrder });

    } catch (error) {
        console.error('Error removing order item:', error);
        res.status(500).json({ success: false, message: 'Error removing item', error: error.message });
    }
};

// @desc    Get all items for a specific order
exports.getOrderItemsForOrder = async (req, res) => {
    const { orderMongoId } = req.params;
    try {
        const order = await Order.findById(orderMongoId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        // Items will be populated if using the .populate('items') on order query
        // Or fetch them directly if needed:
        const items = await OrderItem.find({ order_id: order.order_id });

        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error fetching items for order:', error);
        res.status(500).json({ success: false, message: 'Error fetching items', error: error.message });
    }
};