const mongoose = require('mongoose');

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
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'DeliveryStaff', 'Customer', 'EcommerceIntegration']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    fullName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
    },
    delivery_zones: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryZone'
    }],
    max_concurrent_routes: {
        type: Number,
        default: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'Users'
});

const User = mongoose.model('User', userSchema);
module.exports = User;