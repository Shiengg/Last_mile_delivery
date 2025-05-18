const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        primary: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        province_id: {
            type: String,
            required: true,
            ref: 'Province'
        },
        district_id: {
            type: String,
            required: true,
            ref: 'District'
        },
        ward_code: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        house_number: String,
        latitude: Number,
        longitude: Number
    },
    capacity: {
        max_orders: {
            type: Number,
            default: 1000
        },
        current_orders: {
            type: Number,
            default: 0
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
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    },
    contact: {
        phone: String,
        email: String,
        manager_name: String
    }
}, {
    timestamps: true
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
