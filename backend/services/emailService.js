const nodemailer = require('nodemailer');
const User = require('../models/User');

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Vérifier la configuration du transporteur
transporter.verify((error, success) => {
    if (error) {
        console.error('Email service configuration error:', error);
    } else {
        console.log('Email service is ready to send messages');
    }
});

// Envoyer un email de notification de tâche en retard
const sendOverdueNotification = async (task, user) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
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
                            <a href="${process.env.FRONTEND_URL}/dashboard" 
                               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                🚀 Accéder à mes tâches
                            </a>
                        </div>
                        
                        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px;">
                            <p style="margin: 0; font-size: 14px; color: #666;">
                                <strong>Pourquoi cet email ?</strong><br>
                                Vous recevez cette notification car une tâche qui vous est assignée a dépassé sa date limite. 
                                Merci de prendre les mesures nécessaires pour la compléter dès que possible.
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

        await transporter.sendMail(mailOptions);
        console.log(`Overdue notification sent to ${user.email} for task: ${task.title}`);
        return true;
    } catch (error) {
        console.error('Error sending overdue notification:', error);
        return false;
    }
};

// Envoyer un email de rappel (2 jours avant la deadline)
const sendReminderEmail = async (task, user) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '⏰ Rappel - Deadline approche pour votre tâche',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: #ffc107; color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">⏰ Rappel de deadline</h1>
                    </div>
                    
                    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${user.username},</h2>
                        
                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
                            <p style="margin: 0; color: #856404;">
                                <strong>Rappel :</strong> La deadline pour votre tâche approche à grands pas !
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
                                        <span style="background-color: ${task.status === 'terminé' ? '#28a745' : task.status === 'en cours' ? '#ffc107' : '#6c757d'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                            ${task.status}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Date limite :</td>
                                    <td style="padding: 8px 0; color: #ffc107; font-weight: bold;">
                                        ${new Date(task.deadline).toLocaleDateString('fr-FR')}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Temps restant :</td>
                                    <td style="padding: 8px 0; color: #ffc107; font-weight: bold;">
                                        2 jours
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}/dashboard" 
                               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                🚀 Accéder à mes tâches
                            </a>
                        </div>
                        
                        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px;">
                            <p style="margin: 0; font-size: 14px; color: #666;">
                                <strong>Conseil :</strong><br>
                                N'attendez pas le dernier moment pour compléter votre tâche. 
                                Si vous avez besoin d'aide, n'hésitez pas à contacter votre administrateur.
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

        await transporter.sendMail(mailOptions);
        console.log(`Reminder sent to ${user.email} for task: ${task.title}`);
        return true;
    } catch (error) {
        console.error('Error sending reminder email:', error);
        return false;
    }
};

module.exports = {
    sendOverdueNotification,
    sendReminderEmail
};
