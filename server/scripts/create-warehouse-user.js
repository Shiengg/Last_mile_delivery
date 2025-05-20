const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Warehouse = require('../models/warehouse');

async function createWarehouseUser() {
    try {
        // Kết nối database
        await mongoose.connect(config.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Tạo warehouse mới nếu chưa tồn tại
        const warehouseId = 'WH-01';
        let warehouse = await Warehouse.findOne({ warehouse_id: warehouseId });
        if (!warehouse) {
            warehouse = await Warehouse.create({
                warehouse_id: warehouseId,
                name: 'Main Warehouse',
                address: {
                    province_id: '79',
                    district_id: '760',
                    ward_code: '26734',
                    province_name: 'Thành phố Hồ Chí Minh',
                    district_name: 'Quận 1',
                    ward_name: 'Phường Bến Nghé',
                    street: 'Lê Lợi',
                    house_number: '68'
                },
                status: 'active'
            });
        }

        // Tạo user cho warehouse
        const email = 'warehouse@example.com';
        const password = 'warehouse123';

        let user = await User.findOne({ email });
        if (!user) {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await User.create({
                email,
                password: hashedPassword,
                role: 'warehouse',
                warehouse_id: warehouseId,
                name: 'Warehouse Admin'
            });
        }

        // Tạo token
        const token = jwt.sign(
            {
                user_id: user._id,
                role: 'warehouse',
                warehouse_id: warehouseId
            },
            config.jwtSecret,
            { expiresIn: '30d' }
        );

        console.log('Warehouse created successfully!');
        console.log('Warehouse ID:', warehouseId);
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Token:', token);
        console.log('\nPlease add this token to your .env file as VITE_DELIVERY_TOKEN');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createWarehouseUser(); 