const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { startCronJobs } = require('./utils/cronJobs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        // Démarrer les cron jobs après la connexion à la base de données
        startCronJobs();
        console.log('📧 Cron jobs activés - Notifications par email');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin-notifications', require('./routes/adminNotifications'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Task Management API is running',
        timestamp: new Date().toISOString()
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Global error:', err);
    res.status(500).json({ 
        message: 'Something went wrong on the server',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
});
