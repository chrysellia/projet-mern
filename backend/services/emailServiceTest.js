const nodemailer = require('nodemailer');

// Service de test Ethereal - pas besoin de vrais credentials
const createTestTransporter = async () => {
    try {
        // Créer un compte de test Ethereal
        const testAccount = await nodemailer.createTestAccount();
        
        console.log('🔧 Test email account created:');
        console.log(`📧 Email: ${testAccount.user}`);
        console.log('🔑 Password: (hidden)');
        
        // Créer le transporteur avec les credentials de test
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        return { transporter, testAccount };
    } catch (error) {
        console.error('❌ Error creating test transporter:', error);
        return null;
    }
};

// Envoyer un email de notification de tâche en retard (version test)
const sendOverdueNotificationTest = async (task, user) => {
    try {
        const { transporter, testAccount } = await createTestTransporter();
        
        if (!transporter) {
            return false;
        }

        const mailOptions = {
            from: `"Task Management System" <${testAccount.user}>`,
            to: user.email,
            subject: '⚠️ Tâche en retard - Action requise',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">⚠️ Tâche en retard</h1>
                    </div>
                    
                    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${user.username},</h2>
                        
                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
                            <p style="margin: 0; color: #856404;">
                                <strong>Attention :</strong> La tâche suivante est en retard et nécessite votre attention immédiate.
                            </p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #333;">📋 Détails de la tâche</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Titre :</td>
                                    <td style="padding: 8px 0; color: #333;">${task.title}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Description :</td>
                                    <td style="padding: 8px 0; color: #333;">${task.description || 'Non spécifiée'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Statut :</td>
                                    <td style="padding: 8px 0;">
                                        <span style="background-color: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                            ${task.status}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Date limite :</td>
                                    <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">
                                        ${new Date(task.deadline).toLocaleDateString('fr-FR')}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Retard de :</td>
                                    <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">
                                        ${Math.ceil((new Date() - new Date(task.deadline)) / (1000 * 60 * 60 * 24))} jours
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                🚀 Accéder à mes tâches
                            </a>
                        </div>
                        
                        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px;">
                            <p style="margin: 0; font-size: 14px; color: #666;">
                                <strong>🔧 MODE TEST :</strong><br>
                                Cet email est envoyé via Ethereal Email (service de test). 
                                Pour voir l'email, cliquez sur le lien ci-dessous.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                            <p style="margin: 0; font-size: 12px; color: #666;">
                                Cet email a été envoyé automatiquement par le système de gestion de tâches.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Test email sent successfully!');
        console.log('📬 Preview URL:', nodemailer.getTestMessageUrl(info));
        console.log('🌐 Click the URL above to see the email in your browser');
        
        return true;
    } catch (error) {
        console.error('❌ Error sending test email:', error);
        return false;
    }
};

module.exports = {
    sendOverdueNotificationTest
};
