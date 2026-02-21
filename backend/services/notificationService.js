const Task = require('../models/Task');
const User = require('../models/User');
const { sendOverdueNotification, sendReminderEmail } = require('./emailService');

// Vérifier les tâches en retard et envoyer des notifications
const checkOverdueTasks = async () => {
    try {
        console.log('Checking for overdue tasks...');
        
        const now = new Date();
        const overdueTasks = await Task.find({
            deadline: { $lt: now },
            status: { $ne: 'terminé' },
            notified: false
        }).populate('assignedTo createdBy');

        console.log(`Found ${overdueTasks.length} overdue tasks to notify`);

        for (const task of overdueTasks) {
            try {
                const user = await User.findById(task.assignedTo._id);
                if (user) {
                    const emailSent = await sendOverdueNotification(task, user);
                    if (emailSent) {
                        // Marquer la tâche comme notifiée
                        await Task.findByIdAndUpdate(task._id, { notified: true });
                        console.log(`Overdue notification sent for task: ${task.title}`);
                    }
                }
            } catch (error) {
                console.error(`Error processing overdue task ${task._id}:`, error);
            }
        }

        return overdueTasks.length;
    } catch (error) {
        console.error('Error checking overdue tasks:', error);
        return 0;
    }
};

// Vérifier les tâches qui approchent de la deadline (2 jours avant)
const checkUpcomingDeadlines = async () => {
    try {
        console.log('Checking for upcoming deadlines...');
        
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
        const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        
        const upcomingTasks = await Task.find({
            deadline: { 
                $gte: tomorrow, 
                $lte: twoDaysFromNow 
            },
            status: { $ne: 'terminé' },
            reminderSent: false
        }).populate('assignedTo createdBy');

        console.log(`Found ${upcomingTasks.length} tasks with upcoming deadlines`);

        for (const task of upcomingTasks) {
            try {
                const user = await User.findById(task.assignedTo._id);
                if (user) {
                    const emailSent = await sendReminderEmail(task, user);
                    if (emailSent) {
                        // Marquer le rappel comme envoyé
                        await Task.findByIdAndUpdate(task._id, { reminderSent: true });
                        console.log(`Reminder sent for task: ${task.title}`);
                    }
                }
            } catch (error) {
                console.error(`Error processing upcoming task ${task._id}:`, error);
            }
        }

        return upcomingTasks.length;
    } catch (error) {
        console.error('Error checking upcoming deadlines:', error);
        return 0;
    }
};

// Envoyer une notification manuelle pour une tâche spécifique (pour l'admin)
const sendManualNotification = async (taskId) => {
    try {
        const task = await Task.findById(taskId).populate('assignedTo createdBy');
        
        if (!task) {
            throw new Error('Task not found');
        }

        const user = await User.findById(task.assignedTo._id);
        if (!user) {
            throw new Error('User not found');
        }

        const emailSent = await sendOverdueNotification(task, user);
        if (emailSent) {
            await Task.findByIdAndUpdate(taskId, { notified: true });
            return { success: true, message: 'Notification sent successfully' };
        } else {
            throw new Error('Failed to send email');
        }
    } catch (error) {
        console.error('Error sending manual notification:', error);
        return { success: false, message: error.message };
    }
};

// Obtenir les statistiques de notifications
const getNotificationStats = async () => {
    try {
        const totalTasks = await Task.countDocuments();
        const overdueTasks = await Task.countDocuments({
            deadline: { $lt: new Date() },
            status: { $ne: 'terminé' }
        });
        const notifiedTasks = await Task.countDocuments({ notified: true });
        const reminderSentTasks = await Task.countDocuments({ reminderSent: true });

        return {
            totalTasks,
            overdueTasks,
            notifiedTasks,
            reminderSentTasks,
            pendingNotifications: overdueTasks - notifiedTasks
        };
    } catch (error) {
        console.error('Error getting notification stats:', error);
        return {
            totalTasks: 0,
            overdueTasks: 0,
            notifiedTasks: 0,
            reminderSentTasks: 0,
            pendingNotifications: 0
        };
    }
};

// Réinitialiser les flags de notification (pour les tests)
const resetNotificationFlags = async () => {
    try {
        await Task.updateMany({}, { 
            notified: false, 
            reminderSent: false 
        });
        console.log('Notification flags reset');
        return { success: true };
    } catch (error) {
        console.error('Error resetting notification flags:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    checkOverdueTasks,
    checkUpcomingDeadlines,
    sendManualNotification,
    getNotificationStats,
    resetNotificationFlags
};
