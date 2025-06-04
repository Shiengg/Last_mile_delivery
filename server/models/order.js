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
        enum: ['ecommerce', 'warehouse', 'shop_direct'],
        required: true
    },
    source: {
        type: {
            type: String,
            enum: ['warehouse', 'shop'],
            required: true
        },
        location_id: {
            type: String,
            required: true
        },
        address: {
            province_id: String,
            district_id: String,
            ward_code: String,
            street: String,
            house_number: String
        }
    },
    destination: {
        receiver_name: {
            type: String,
            required: true
        },
        receiver_phone: {
            type: String,
            required: true
        },
        address: {
            province_id: {
                type: String,
                required: true
            },
            district_id: {
                type: String,
                required: true
            },
            ward_code: {
                type: String,
                required: true
            },
            street: {
                type: String,
                required: true
            },
            house_number: String
        }
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
    delivery_fee: {
        type: Number,
        default: 0
    },
    estimated_delivery_time: {
        type: Date
    },
    notes: String
}, {
    collection: 'Order',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate for items
orderSchema.virtual('items', {
    ref: 'OrderItem',
    localField: 'order_id',
    foreignField: 'order_id'
});

module.exports = mongoose.model('Order', orderSchema);