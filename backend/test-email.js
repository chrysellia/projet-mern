const { sendOverdueNotification } = require('./services/emailService');
const User = require('./models/User');
const Task = require('./models/Task');
const mongoose = require('mongoose');
require('dotenv').config();

// Test d'envoi d'email
const testEmail = async () => {
    try {
        console.log('🔧 Testing email configuration...');
        
        // Vérifier les variables d'environnement
        console.log('📧 Email User:', process.env.EMAIL_USER);
        console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? '***CONFIGURED***' : 'NOT SET');
        console.log('🌐 Frontend URL:', process.env.FRONTEND_URL);
        
        // Créer un utilisateur de test
        const testUser = {
            _id: 'test-user-id',
            username: 'Test User',
            email: process.env.EMAIL_USER // Envoyer à soi-même pour tester
        };
        
        // Créer une tâche de test
        const testTask = {
            _id: 'test-task-id',
            title: 'Tâche de test - Retard',
            description: 'Ceci est une tâche de test pour vérifier l\'envoi d\'emails',
            status: 'en cours',
            deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours en retard
            assignedTo: testUser._id
        };
        
        console.log('📤 Sending test email...');
        const result = await sendOverdueNotification(testTask, testUser);
        
        if (result) {
            console.log('✅ Test email sent successfully!');
            console.log('📬 Check your inbox for the overdue notification');
        } else {
            console.log('❌ Failed to send test email');
        }
        
    } catch (error) {
        console.error('❌ Error testing email:', error);
    }
};

// Connecter à MongoDB et tester
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        testEmail();
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
