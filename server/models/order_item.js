const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    order_id: {
        type: String,
        ref: 'Order',
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    product_sku: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
