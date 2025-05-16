const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        primary: true
    },
    shop: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
