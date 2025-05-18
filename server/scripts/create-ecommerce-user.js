const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

async function createEcommerceUser() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI);

        // Tạo mật khẩu ngẫu nhiên
        const password = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user cho e-commerce
        const ecommerceUser = await User.findOneAndUpdate(
            { username: 'ecommerce_system' },
            {
                username: 'ecommerce_system',
                password: hashedPassword,
                role: 'EcommerceIntegration',
                status: 'active',
                fullName: 'E-commerce System Account',
                email: 'system@ecommerce.com'
            },
            { upsert: true, new: true }
        );

        // Tạo permanent token
        const token = jwt.sign(
            {
                id: ecommerceUser._id.toString(),
                role: ecommerceUser.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '100y' } // Token hết hạn sau 100 năm
        );

        console.log('E-commerce system account created successfully');
        console.log('----------------------------------------');
        console.log('Username:', ecommerceUser.username);
        console.log('Password:', password);
        console.log('Token:', token);
        console.log('----------------------------------------');
        console.log('Please save this token securely and use it in your e-commerce application');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error creating e-commerce user:', error);
        process.exit(1);
    }
}

createEcommerceUser(); 