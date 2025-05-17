const mongoose = require("mongoose");
const OrderItem = require('./order_item');

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
        default: 'web'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipping', 'delivered', 'cancelled', 'failed'],
        default: 'pending'
    },
    total_price: {
        type: Number,
        required: true,
        default: 0
    },
}, {
    collection: 'Order',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate for items
orderSchema.virtual('items', {
    ref: 'OrderItem',        // The model to use
    localField: 'order_id',  // Find OrderItems where OrderItem.order_id
    foreignField: 'order_id' // matches this Order.order_id (your custom string ID)
});

// Method to recalculate total price based on its items
orderSchema.methods.recalculateTotalPrice = async function () {
    const orderItems = await OrderItem.find({ order_id: this.order_id });
    this.total_price = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return this.save();
};

// Middleware to remove associated order items when an order is removed
orderSchema.pre('remove', async function (next) {
    try {
        console.log(`Removing items for order: ${this.order_id}`);
        await OrderItem.deleteMany({ order_id: this.order_id });
        next();
    } catch (error) {
        next(error);
    }
});


module.exports = mongoose.model('Order', orderSchema);