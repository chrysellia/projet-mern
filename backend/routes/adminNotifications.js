const express = require('express');
const { protect, admin } = require('../middleware/auth');
const { 
    getOverdueTasksForAdmin,
    sendEmailToUser,
    sendDeadlineReminderEmail,
    getAdminNotificationStats
} = require('../services/adminNotificationService');

const router = express.Router();

// @route   GET /api/admin-notifications/overdue
// @desc    Get overdue tasks for admin notifications
// @access  Private/Admin
router.get('/overdue', [protect, admin], async (req, res) => {
    try {
        const overdueTasks = await getOverdueTasksForAdmin();
        res.json({
            success: true,
            data: overdueTasks,
            count: overdueTasks.length
        });
    } catch (error) {
        console.error('Get overdue tasks error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error getting overdue tasks',
            error: error.message 
        });
    }
});

// @route   POST /api/admin-notifications/send-email
// @desc    Send email to a specific user
// @access  Private/Admin
router.post('/send-email', [protect, admin], async (req, res) => {
    try {
        const { userId, subject, message } = req.body;
        
        if (!userId || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, subject et message sont requis'
            });
        }

        const result = await sendEmailToUser(userId, subject, message);
        res.json(result);
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error sending email',
            error: error.message 
        });
    }
});

// @route   POST /api/admin-notifications/send-reminder/:taskId
// @desc    Send deadline reminder email for a specific task
// @access  Private/Admin
router.post('/send-reminder/:taskId', [protect, admin], async (req, res) => {
    try {
        const { taskId } = req.params;
        const result = await sendDeadlineReminderEmail(taskId);
        res.json(result);
    } catch (error) {
        console.error('Send deadline reminder error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error sending deadline reminder',
            error: error.message 
        });
    }
});

// @route   GET /api/admin-notifications/stats
// @desc    Get notification statistics for admin
// @access  Private/Admin
router.get('/stats', [protect, admin], async (req, res) => {
    try {
        const stats = await getAdminNotificationStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get admin notification stats error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error getting notification stats',
            error: error.message 
        });
    }
});

module.exports = router;
