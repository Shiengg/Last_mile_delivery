const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    customer_id: {
        type: String,
        required: true,
        trim: true
    },
    shop_id: {
        type: String,
        required: true,
        trim: true
    },
    channel: {
        type: String,
        enum: ['web', 'mobile', 'physical'],
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipping', 'delivered', 'cancelled', 'failed'],
    },
    total_price: {
        type: Number,
        required: true
    },
}, {
    collection: 'Order',
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);