const Task = require('../models/Task');
const User = require('../models/User');

// Version simplifiée sans envoi d'emails
const checkOverdueTasks = async () => {
    try {
        console.log('🔍 Checking for overdue tasks...');
        
        const now = new Date();
        const overdueTasks = await Task.find({
            deadline: { $lt: now },
            status: { $ne: 'terminé' },
            notified: false
        }).populate('assignedTo createdBy');

        console.log(`📊 Found ${overdueTasks.length} overdue tasks`);
        
        for (const task of overdueTasks) {
            console.log(`⚠️ OVERDUE: "${task.title}" assigned to ${task.assignedTo.username} (Deadline: ${task.deadline})`);
            
            // Marquer comme notifié pour éviter les doublons
            await Task.findByIdAndUpdate(task._id, { notified: true });
        }

        return overdueTasks.length;
    } catch (error) {
        console.error('❌ Error checking overdue tasks:', error);
        return 0;
    }
};

const checkUpcomingDeadlines = async () => {
    try {
        console.log('⏰ Checking for upcoming deadlines...');
        
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

        console.log(`📊 Found ${upcomingTasks.length} tasks with upcoming deadlines`);

        for (const task of upcomingTasks) {
            console.log(`⏰ REMINDER: "${task.title}" assigned to ${task.assignedTo.username} (Deadline: ${task.deadline})`);
            
            // Marquer le rappel comme envoyé
            await Task.findByIdAndUpdate(task._id, { reminderSent: true });
        }

        return upcomingTasks.length;
    } catch (error) {
        console.error('❌ Error checking upcoming deadlines:', error);
        return 0;
    }
};

// Envoyer une notification manuelle (console seulement)
const sendManualNotification = async (taskId) => {
    try {
        const task = await Task.findById(taskId).populate('assignedTo createdBy');
        
        if (!task) {
            return { success: false, message: 'Task not found' };
        }

        console.log(`📧 MANUAL NOTIFICATION for task: "${task.title}"`);
        console.log(`👤 Assigned to: ${task.assignedTo.username} (${task.assignedTo.email})`);
        console.log(`📅 Deadline: ${task.deadline}`);
        console.log(`📊 Status: ${task.status}`);
        
        // Marquer comme notifié
        await Task.findByIdAndUpdate(taskId, { notified: true });
        
        return { success: true, message: 'Notification logged successfully' };
    } catch (error) {
        console.error('❌ Error sending manual notification:', error);
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
        console.error('❌ Error getting notification stats:', error);
        return {
            totalTasks: 0,
            overdueTasks: 0,
            notifiedTasks: 0,
            reminderSentTasks: 0,
            pendingNotifications: 0
        };
    }
};

module.exports = {
    checkOverdueTasks,
    checkUpcomingDeadlines,
    sendManualNotification,
    getNotificationStats
};
