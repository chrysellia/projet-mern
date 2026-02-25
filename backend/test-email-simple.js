const { sendOverdueNotification } = require('./services/emailService');
require('dotenv').config();

// Test simple sans connexion MongoDB
const testEmailConfig = async () => {
    try {
        console.log('🔧 Testing email configuration...');
        
        // Vérifier les variables d'environnement
        console.log('📧 Email User:', process.env.EMAIL_USER);
        console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? '***CONFIGURED***' : 'NOT SET');
        console.log('🌐 Frontend URL:', process.env.FRONTEND_URL);
        
        // Créer un utilisateur de test
        const testUser = {
            _id: 'test-user-id',
            username: 'Priscillia',
            email: process.env.EMAIL_USER // Envoyer à soi-même
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
        console.log(`📬 To: ${testUser.email}`);
        console.log(`📋 Task: ${testTask.title}`);
        
        const result = await sendOverdueNotification(testTask, testUser);
        
        if (result) {
            console.log('✅ Test email sent successfully!');
            console.log('📬 Check your inbox for the overdue notification');
        } else {
            console.log('❌ Failed to send test email');
            console.log('💡 This might be due to:');
            console.log('   - Incorrect EMAIL_PASS in .env file');
            console.log('   - Gmail security settings');
            console.log('   - Network issues');
        }
        
    } catch (error) {
        console.error('❌ Error testing email:', error.message);
        
        if (error.message.includes('535')) {
            console.log('🔧 Gmail authentication error:');
            console.log('   1. Enable 2-factor authentication on your Gmail');
            console.log('   2. Go to: https://myaccount.google.com/apppasswords');
            console.log('   3. Create an app password');
            console.log('   4. Update EMAIL_PASS in .env with the 16-character password');
        }
    }
};

testEmailConfig();
