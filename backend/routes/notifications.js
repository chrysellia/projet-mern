const express = require('express');
const { protect, admin } = require('../middleware/auth');
const { 
    sendManualNotification, 
    getNotificationStats, 
    checkOverdueTasks, 
    checkUpcomingDeadlines
} = require('../services/notificationServiceSimple');

const router = express.Router();

// @route   POST /api/notifications/manual/:taskId
// @desc    Send manual notification for a specific task
// @access  Private/Admin
router.post('/manual/:taskId', [protect, admin], async (req, res) => {
    try {
        const { taskId } = req.params;
        const result = await sendManualNotification(taskId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Manual notification error:', error);
        res.status(500).json({ 
            message: 'Server error during manual notification',
            error: error.message 
        });
    }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private/Admin
router.get('/stats', [protect, admin], async (req, res) => {
    try {
        const stats = await getNotificationStats();
        res.json(stats);
    } catch (error) {
        console.error('Get notification stats error:', error);
        res.status(500).json({ 
            message: 'Server error getting notification stats',
            error: error.message 
        });
    }
});

// @route   POST /api/notifications/check-overdue
// @desc    Manually trigger overdue tasks check
// @access  Private/Admin
router.post('/check-overdue', [protect, admin], async (req, res) => {
    try {
        const count = await checkOverdueTasks();
        res.json({ 
            message: 'Overdue tasks check completed',
            notificationsSent: count 
        });
    } catch (error) {
        console.error('Manual overdue check error:', error);
        res.status(500).json({ 
            message: 'Server error during overdue check',
            error: error.message 
        });
    }
});

// @route   POST /api/notifications/check-upcoming
// @desc    Manually trigger upcoming deadlines check
// @access  Private/Admin
router.post('/check-upcoming', [protect, admin], async (req, res) => {
    try {
        const count = await checkUpcomingDeadlines();
        res.json({ 
            message: 'Upcoming deadlines check completed',
            remindersSent: count 
        });
    } catch (error) {
        console.error('Manual upcoming check error:', error);
        res.status(500).json({ 
            message: 'Server error during upcoming check',
            error: error.message 
        });
    }
});

// @route   POST /api/notifications/reset-flags
// @desc    Reset all notification flags (for testing)
// @access  Private/Admin
router.post('/reset-flags', [protect, admin], async (req, res) => {
    try {
        await Task.updateMany({}, { 
            notified: false, 
            reminderSent: false 
        });
        console.log('🔄 Notification flags reset');
        res.json({ success: true, message: 'Notification flags reset successfully' });
    } catch (error) {
        console.error('❌ Error resetting notification flags:', error);
        res.status(500).json({ 
            message: 'Server error resetting flags',
            error: error.message 
        });
    }
});

module.exports = router;
