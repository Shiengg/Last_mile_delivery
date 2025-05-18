require('dotenv').config();
const mongoose = require('mongoose');
const Shop = require('../models/Shop');

async function createDefaultShop() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/last_mile_delivery');

        // Kiểm tra xem shop mặc định đã tồn tại chưa
        const existingShop = await Shop.findOne({ shop_id: 'SHOP-01' });
        if (existingShop) {
            console.log('Shop mặc định đã tồn tại:', existingShop);
            process.exit(0);
        }

        // Tạo shop mặc định cho website
        const defaultShop = new Shop({
            shop_id: 'SHOP-01',
            shop_name: 'Web Store',
            country_id: 'VN',
            province_id: '01', // Hà Nội
            district_id: '001',
            ward_code: '00001',
            street: 'Example Street',
            house_number: '123',
            latitude: 21.0285, // Tọa độ ví dụ cho Hà Nội
            longitude: 105.8542,
            shop_type: 'retail',
            categories: ['clothing', 'accessories'],
            status: 'active'
        });

        await defaultShop.save();
        console.log('Đã tạo shop mặc định thành công:', defaultShop);
    } catch (error) {
        console.error('Lỗi khi tạo shop mặc định:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createDefaultShop(); 