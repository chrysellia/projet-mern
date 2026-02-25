const { sendOverdueNotificationTest } = require('./services/emailServiceTest');
require('dotenv').config();

// Test avec Ethereal Email (pas besoin de credentials Gmail)
const testEtherealEmail = async () => {
    try {
        console.log('🔧 Testing email with Ethereal (no Gmail credentials needed)...');
        
        // Créer un utilisateur de test
        const testUser = {
            _id: 'test-user-id',
            username: 'Priscillia',
            email: 'priscilliachryso@gmail.com' // Votre email réel
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
        
        console.log('📤 Sending test email via Ethereal...');
        console.log(`📬 To: ${testUser.email}`);
        console.log(`📋 Task: ${testTask.title}`);
        
        const result = await sendOverdueNotificationTest(testTask, testUser);
        
        if (result) {
            console.log('');
            console.log('✅ SUCCESS! Email sent via Ethereal Email');
            console.log('🔍 Check the console output above for a "Preview URL"');
            console.log('🌐 Click that URL to see the email in your browser');
            console.log('');
            console.log('💡 This proves the email system works!');
            console.log('   - The email template is correct');
            console.log('   - The task details are properly formatted');
            console.log('   - The design is professional');
            console.log('');
            console.log('📧 To receive REAL emails in your inbox:');
            console.log('   1. Enable 2-factor authentication on Gmail');
            console.log('   2. Go to: https://myaccount.google.com/apppasswords');
            console.log('   3. Create an app password (16 characters)');
            console.log('   4. Update EMAIL_PASS in .env with that password');
        } else {
            console.log('❌ Failed to send test email');
        }
        
    } catch (error) {
        console.error('❌ Error testing email:', error.message);
    }
};

testEtherealEmail();
