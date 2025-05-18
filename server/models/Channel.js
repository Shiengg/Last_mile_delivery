const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        enum: ['ecommerce', 'warehouse', 'shop_direct'],
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['online', 'offline'],
        required: true
    },
    settings: {
        delivery_priority: {
            type: Number,
            default: 1
        },
        max_delivery_time: {
            type: Number, // in minutes
            default: 120
        },
        delivery_fee: {
            type: Number,
            default: 0
        },
        requires_warehouse: {
            type: Boolean,
            default: false
        }
    },
    operating_hours: {
        start: {
            type: String,
            default: '08:00'
        },
        end: {
            type: String,
            default: '18:00'
        },
        timezone: {
            type: String,
            default: 'Asia/Ho_Chi_Minh'
        }
    },
    integration: {
        api_key: String,
        webhook_url: String,
        callback_url: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true,
    collection: 'Channel'
});

// Indexes
channelSchema.index({ code: 1 });
channelSchema.index({ status: 1 });
channelSchema.index({ type: 1 });

module.exports = mongoose.model('Channel', channelSchema); 