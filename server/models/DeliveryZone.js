const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    // Danh sách các quận/huyện thuộc vùng này
    districts: [{
        province_id: String,
        district_id: String,
        district_name: String
    }],
    // Danh sách nhân viên giao hàng được phân công cho vùng này
    delivery_staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    // Cấu hình cho vùng
    settings: {
        max_concurrent_routes: {
            type: Number,
            default: 5
        },
        max_distance_per_route: {
            type: Number,
            default: 20 // km
        }
    }
}, {
    timestamps: true
});

// Indexes
deliveryZoneSchema.index({ 'districts.province_id': 1, 'districts.district_id': 1 });
deliveryZoneSchema.index({ 'delivery_staff': 1 });

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema); 