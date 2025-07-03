require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/order');

async function updateChannelNames() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Cập nhật các order có channel là 'social-media' thành 'social_media'
        const result = await Order.updateMany(
            { channel: 'social-media' },
            { $set: { channel: 'social_media' } }
        );

        console.log(`Updated ${result.modifiedCount} orders from 'social-media' to 'social_media'`);

        // Cập nhật các order có channel là 'shop_direct' thành 'social_media'
        const result2 = await Order.updateMany(
            { channel: 'shop_direct' },
            { $set: { channel: 'social_media' } }
        );

        console.log(`Updated ${result2.modifiedCount} orders from 'shop_direct' to 'social_media'`);

        console.log('Channel names update completed');
    } catch (error) {
        console.error('Error updating channel names:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateChannelNames(); 