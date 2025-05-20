require('dotenv').config();
const mongoose = require('mongoose');
const Channel = require('../models/Channel');
const connectDB = require('../config/connectDB');

const createEcommerceChannel = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const ecommerceChannel = {
            code: 'warehouse',
            name: 'Warehouse Channel',
            description: 'Channel for warehouse orders',
            type: 'offline',
            settings: {
                delivery_priority: 2,
                max_delivery_time: 180, // 3 hours in minutes
                delivery_fee: 0,
                requires_warehouse: false
            },
            operating_hours: {
                start: '08:00',
                end: '22:00',
                timezone: 'Asia/Ho_Chi_Minh'
            },
            status: 'active'
        };

        // Check if channel already exists
        const existingChannel = await Channel.findOne({ code: 'warehouse' });
        if (existingChannel) {
            // Update if exists
            Object.assign(existingChannel, ecommerceChannel);
            await existingChannel.save();
            console.log('Warehouse channel updated successfully');
        } else {
            // Create new if not exists
            await Channel.create(ecommerceChannel);
            console.log('Warehouse channel created successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createEcommerceChannel(); 