const mongoose = require('mongoose');

const customerAddressSchema = new mongoose.Schema({
    shop_id: {
        type: String,
        required: true,
        unique: true
    },
    shop_name: {
        type: String,
        required: true
    },
    country_id: {
        type: String,
        default: 'VN'
    },
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
    house_number: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    full_address: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes
customerAddressSchema.index({ shop_id: 1 });
customerAddressSchema.index({ province_id: 1, district_id: 1, ward_code: 1 });
customerAddressSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('CustomerAddress', customerAddressSchema); 