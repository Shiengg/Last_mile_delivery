require('dotenv').config()
const mongoose = require('mongoose')

const connectDB = async () => {
    try {


        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'last_mile_delivery'
        });



        const collections = await conn.connection.db.listCollections().toArray();

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;