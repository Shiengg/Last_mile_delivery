const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    shop_id: {
        type: String,
        unique: true,
        trim: true
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
        required: true,
        trim: true
    },
    district_id: {
        type: String,
        required: true,
        trim: true
    },
    ward_code: {
        type: String,
        required: true,
        trim: true
    },
    house_number: {
        type: String,
        default: ''
    },
    street: {
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
    shop_type: {
        type: String,
        enum: ['retail', 'warehouse', 'other'],
        default: 'retail'
    },
    categories: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    collection: 'Shop',
    timestamps: true
});

// Indexes
shopSchema.index({ shop_name: 1 });
shopSchema.index({ street: 1 });
shopSchema.index({ status: 1 });
shopSchema.index({ shop_id: 1 }, { unique: true });
shopSchema.index({ ward_code: 1 });

module.exports = mongoose.model('Shop', shopSchema); 