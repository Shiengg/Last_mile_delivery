require('dotenv').config();
const mongoose = require('mongoose');
const Shop = require('../models/Shop');

async function createDefaultShop() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/last_mile_delivery');

        // Kiểm tra xem warehouse mặc định đã tồn tại chưa
        const existingShop = await Shop.findOne({ shop_id: 'WARE-01' });
        if (existingShop) {
            console.log('Warehouse mặc định đã tồn tại:', existingShop);
            process.exit(0);
        }

        // Tạo warehouse mặc định
        const defaultShop = new Shop({
            shop_id: 'WARE-01',
            shop_name: 'Main Warehouse',
            country_id: 'VN',
            province_id: '79', // TPHCM
            district_id: '769', // Thủ Đức
            ward_code: '27115', // Phường Đông Hòa
            street: 'Khu phố 6',
            house_number: '234',
            latitude: 10.877928, // Tọa độ khu vực gần ĐHQG
            longitude: 106.799480, // Tọa độ khu vực gần ĐHQG
            shop_type: 'warehouse',
            categories: ['storage', 'distribution'],
            status: 'active'
        });

        await defaultShop.save();
        console.log('Đã tạo warehouse mặc định thành công:', defaultShop);
    } catch (error) {
        console.error('Lỗi khi tạo warehouse mặc định:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createDefaultShop(); 