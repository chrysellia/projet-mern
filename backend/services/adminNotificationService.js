const Task = require('../models/Task');
const User = require('../models/User');

// Vérifier les tâches en retard et retourner les détails pour l'admin
const getOverdueTasksForAdmin = async () => {
    try {
        console.log('🔍 Checking overdue tasks for admin notifications...');
        
        const now = new Date();
        const overdueTasks = await Task.find({
            deadline: { $lt: now },
            status: { $ne: 'terminé' }
        })
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email')
        .sort({ deadline: 1 }); // Les plus anciennes en premier

        console.log(`📊 Found ${overdueTasks.length} overdue tasks for admin`);

        return overdueTasks.map(task => ({
            _id: task._id,
            title: task.title,
            description: task.description,
            status: task.status,
            deadline: task.deadline,
            daysOverdue: Math.ceil((now - new Date(task.deadline)) / (1000 * 60 * 60 * 24)),
            assignedTo: task.assignedTo,
            createdBy: task.createdBy,
            createdAt: task.createdAt
        }));
    } catch (error) {
        console.error('❌ Error getting overdue tasks for admin:', error);
        return [];
    }
};

// Envoyer un email à un utilisateur spécifique (pour l'admin)
const sendEmailToUser = async (userId, subject, message) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: 'Utilisateur non trouvé' };
        }

        console.log(`📧 Sending email to user: ${user.username} (${user.email})`);
        console.log(`📧 Subject: ${subject}`);
        console.log(`📧 Message: ${message}`);
        
        // TODO: Intégrer avec un vrai service email plus tard
        // Pour l'instant, on simule l'envoi
        
        return { 
            success: true, 
            message: `Email simulé envoyé à ${user.email}`,
            user: {
                username: user.username,
                email: user.email
            }
        };
    } catch (error) {
        console.error('❌ Error sending email to user:', error);
        return { success: false, message: 'Erreur lors de l\'envoi de l\'email' };
    }
};

// Envoyer un email de rappel de deadline à un utilisateur
const sendDeadlineReminderEmail = async (taskId) => {
    try {
        const task = await Task.findById(taskId)
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        if (!task) {
            return { success: false, message: 'Tâche non trouvée' };
        }

        const daysOverdue = Math.ceil((new Date() - new Date(task.deadline)) / (1000 * 60 * 60 * 24));
        
        const subject = `⚠️ Rappel : Tâche en retard - ${task.title}`;
        const message = `Bonjour ${task.assignedTo.username},

La tâche "${task.title}" est en retard de ${daysOverdue} jour(s).

Détails :
- Titre : ${task.title}
- Deadline : ${new Date(task.deadline).toLocaleDateString('fr-FR')}
- Retard : ${daysOverdue} jour(s)
- Statut actuel : ${task.status}

Merci de prendre les mesures nécessaires pour compléter cette tâche dès que possible.

Cordialement,
L'administrateur`;

        const result = await sendEmailToUser(task.assignedTo._id, subject, message);
        
        return {
            ...result,
            taskDetails: {
                title: task.title,
                daysOverdue,
                assignedTo: task.assignedTo.username
            }
        };
    } catch (error) {
        console.error('❌ Error sending deadline reminder email:', error);
        return { success: false, message: 'Erreur lors de l\'envoi de l\'email de rappel' };
    }
};

// Obtenir les statistiques de notifications pour l'admin
const getAdminNotificationStats = async () => {
    try {
        const totalTasks = await Task.countDocuments();
        const overdueTasks = await Task.countDocuments({
            deadline: { $lt: new Date() },
            status: { $ne: 'terminé' }
        });
        const upcomingTasks = await Task.countDocuments({
            deadline: { 
                $gte: new Date(),
                $lte: new Date(Date.now() + (2 * 24 * 60 * 60 * 1000))
            },
            status: { $ne: 'terminé' }
        });

        return {
            totalTasks,
            overdueTasks,
            upcomingTasks,
            completionRate: totalTasks > 0 ? Math.round((await Task.countDocuments({ status: 'terminé' }) / totalTasks) * 100) : 0
        };
    } catch (error) {
        console.error('❌ Error getting admin notification stats:', error);
        return {
            totalTasks: 0,
            overdueTasks: 0,
            upcomingTasks: 0,
            completionRate: 0
        };
    }
};

module.exports = {
    getOverdueTasksForAdmin,
    sendEmailToUser,
    sendDeadlineReminderEmail,
    getAdminNotificationStats
};
