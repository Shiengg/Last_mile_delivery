require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectDB');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const provinceRoutes = require('./routes/provinceRoutes');
const districtRoutes = require('./routes/districtRoutes');
const wardRoutes = require('./routes/wardRoutes');
const routeRoutes = require('./routes/routeRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // URL của frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/customer', customerRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Log registered routes một cách đơn giản hơn
        console.log('\nRegistered routes:');
        console.log('AUTH routes: /api/auth');
        console.log('ADMIN routes: /api/admin');
        console.log('VEHICLES routes: /api/vehicles');
        console.log('ACTIVITIES routes: /api/activities');
        console.log('USERS routes: /api/users');
        console.log('SHOPS routes: /api/shops');
        console.log('PROVINCES routes: /api/provinces');
        console.log('DISTRICTS routes: /api/districts');
        console.log('WARDS routes: /api/wards');
        console.log('ROUTES routes: /api/routes');
        console.log('CUSTOMER routes: /api/customer');

        // Start server
        app.listen(PORT, () => {
            console.log(`\nServer is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup error:', error.message);
        process.exit(1);
    }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
