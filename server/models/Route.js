const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    route_code: {
        type: String,
        required: true,
        unique: true
    },
    channel: {
        type: String,
        enum: ['ecommerce', 'warehouse', 'shop_direct', 'social-media'],
        required: true
    },
    order_id: {
        type: String,
        sparse: true
    },
    source: {
        type: {
            type: String,
            enum: ['warehouse', 'shop'],
            required: false
        },
        location_id: {
            type: String,
            required: false
        },
        address: {
            province_id: String,
            district_id: String,
            ward_code: String,
            street: String,
            house_number: String
        },
        latitude: Number,
        longitude: Number
    },
    destination: {
        receiver_name: {
            type: String,
            required: false
        },
        receiver_phone: {
            type: String,
            required: false
        },
        address: {
            province_id: String,
            district_id: String,
            ward_code: String,
            street: String,
            house_number: String
        },
        latitude: Number,
        longitude: Number
    },
    shops: [{
        shop_id: {
            type: String,
            required: true
        },
        order: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'arrived', 'completed', 'skipped'],
            default: 'pending'
        },
        estimated_arrival: Date,
        actual_arrival: Date
    }],
    vehicle_type_id: {
        type: String,
        ref: 'VehicleType',
        required: true
    },
    delivery_staff_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    distance: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'delivering', 'delivered', 'cancelled', 'failed'],
        default: 'pending'
    },
    assigned_at: Date,
    started_at: Date,
    completed_at: Date,
    current_location: {
        latitude: Number,
        longitude: Number,
        last_updated: Date
    },
    polyline: {
        type: String,
        required: false
    },
    section_distances: [{
        type: Number,
        required: true
    }],
    metrics: {
        total_orders: {
            type: Number,
            default: 0
        },
        completed_orders: {
            type: Number,
            default: 0
        },
        failed_orders: {
            type: Number,
            default: 0
        },
        total_distance: {
            type: Number,
            default: 0
        },
        actual_duration: {
            type: Number,
            default: 0
        }
    },
    channel_settings: {
        priority: {
            type: Number,
            default: 1
        },
        max_delivery_time: {
            type: Number,
            default: 120
        }
    }
}, {
    timestamps: true
});

// Indexes
routeSchema.index({ route_code: 1 });
routeSchema.index({ status: 1 });
routeSchema.index({ channel: 1 });
routeSchema.index({ delivery_staff_id: 1 });
routeSchema.index({ 'shops.shop_id': 1 });

module.exports = mongoose.model('Route', routeSchema);