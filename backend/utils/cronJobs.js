const cron = require('node-cron');
const { checkOverdueTasks, checkUpcomingDeadlines } = require('../services/notificationService');

// Démarrer les cron jobs
const startCronJobs = () => {
    console.log('Starting notification cron jobs...');

    // Vérifier les tâches en retard toutes les heures
    cron.schedule('0 * * * *', async () => {
        console.log('Running overdue tasks check...');
        try {
            const overdueCount = await checkOverdueTasks();
            console.log(`Overdue tasks check completed. ${overdueCount} notifications sent.`);
        } catch (error) {
            console.error('Error in overdue tasks cron job:', error);
        }
    });

    // Vérifier les deadlines approchantes tous les jours à 9h du matin
    cron.schedule('0 9 * * *', async () => {
        console.log('Running upcoming deadlines check...');
        try {
            const upcomingCount = await checkUpcomingDeadlines();
            console.log(`Upcoming deadlines check completed. ${upcomingCount} reminders sent.`);
        } catch (error) {
            console.error('Error in upcoming deadlines cron job:', error);
        }
    });

    // Vérification supplémentaire tous les jours à 18h (pour les tâches créées pendant la journée)
    cron.schedule('0 18 * * *', async () => {
        console.log('Running additional upcoming deadlines check...');
        try {
            const upcomingCount = await checkUpcomingDeadlines();
            console.log(`Additional upcoming deadlines check completed. ${upcomingCount} reminders sent.`);
        } catch (error) {
            console.error('Error in additional upcoming deadlines cron job:', error);
        }
    });

    console.log('Cron jobs started successfully!');
    console.log('- Overdue tasks check: Every hour');
    console.log('- Upcoming deadlines check: Daily at 9:00 AM and 6:00 PM');
};

// Arrêter les cron jobs
const stopCronJobs = () => {
    console.log('Stopping all cron jobs...');
    cron.getTasks().forEach(task => task.stop());
    console.log('All cron jobs stopped');
};

module.exports = {
    startCronJobs,
    stopCronJobs
};
