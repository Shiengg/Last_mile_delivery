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
        type: String
    },
    province_code: {
        type: String,
        required: true,
        ref: 'Province'
    },
    district_code: {
        type: String,
        required: true,
        ref: 'District'
    },
    ward_code: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
