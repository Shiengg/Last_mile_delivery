const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'DeliveryStaff', 'Customer', 'ShopStaff', 'WarehouseStaff'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
    },
    delivery_zones: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryZone'
    }],
    familiar_districts: [{
        district_id: String,
        delivery_count: {
            type: Number,
            default: 0
        },
        last_delivery_date: Date
    }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    max_concurrent_routes: {
        type: Number,
        default: 5
    },
    delivery_stats: {
        total_deliveries: {
            type: Number,
            default: 0
        },
        successful_deliveries: {
            type: Number,
            default: 0
        },
        total_distance: {
            type: Number,
            default: 0
        },
        average_delivery_time: {
            type: Number,
            default: 0
        }
    },
    delivery_metrics: {
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        total_deliveries: {
            type: Number,
            default: 0
        },
        successful_deliveries: {
            type: Number,
            default: 0
        },
        failed_deliveries: {
            type: Number,
            default: 0
        },
        total_distance: {
            type: Number,
            default: 0
        }
    },
    preferred_working_hours: {
        start: {
            type: Number,
            min: 0,
            max: 23,
            default: 8
        },
        end: {
            type: Number,
            min: 0,
            max: 23,
            default: 17
        }
    },
    delivery_history: {
        recent_rejections: [{
            route_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Route'
            },
            district_id: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            reason: String
        }],
        last_active_time: Date,
        current_zone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryZone'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'Users',
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;