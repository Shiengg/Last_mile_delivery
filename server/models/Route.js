const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    route_code: {
        type: String,
        required: true,
        unique: true
    },
    channel: {
        type: String,
        enum: ['ecommerce', 'warehouse', 'shop_direct'],
        required: true
    },
    order_id: {
        type: String,
        sparse: true // Cho phép null và tạo unique index
    },
    // Fields cho ecommerce route
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
    // Mảng shops cho route
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
            type: Number, // in minutes
            default: 0
        }
    },
    channel_settings: {
        priority: {
            type: Number,
            default: 1
        },
        max_delivery_time: {
            type: Number, // in minutes
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

// Pre-save middleware để cập nhật metrics
routeSchema.pre('save', async function (next) {
    try {
        // Cập nhật metrics
        if (this.isModified('shops')) {
            this.metrics.total_orders = this.shops.length;
            this.metrics.completed_orders = this.shops.filter(s => s.status === 'completed').length;
            this.metrics.failed_orders = this.shops.filter(s => s.status === 'skipped').length;
        }

        // Cập nhật thời gian hoàn thành
        if (this.isModified('status') && this.status === 'delivered') {
            this.completed_at = new Date();
            if (this.started_at) {
                this.metrics.actual_duration = Math.round((this.completed_at - this.started_at) / (1000 * 60));
            }
        }

        // Cập nhật thời gian bắt đầu
        if (this.isModified('status') && this.status === 'delivering' && !this.started_at) {
            this.started_at = new Date();
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Method để cập nhật vị trí hiện tại
routeSchema.methods.updateCurrentLocation = async function (latitude, longitude) {
    this.current_location = {
        latitude,
        longitude,
        last_updated: new Date()
    };
    return this.save();
};

// Method để đánh dấu đã đến shop
routeSchema.methods.markShopArrival = async function (shopId) {
    const shop = this.shops.find(s => s.shop_id === shopId);
    if (shop) {
        shop.status = 'arrived';
        shop.actual_arrival = new Date();
        await this.save();
    }
};

module.exports = mongoose.model('Route', routeSchema);