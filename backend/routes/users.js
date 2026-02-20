const express = require('express');
const User = require('../models/User');
const Joi = require('joi');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const updateUserSchema = Joi.object({
    username: Joi.string().min(3).max(50),
    email: Joi.string().email(),
    role: Joi.string().valid('admin', 'user')
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', [protect, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin or own user)
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is admin or requesting their own profile
        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin or own user)
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is admin or updating their own profile
        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // Only admin can change roles
        if (req.body.role && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can change roles' });
        }

        // Validate input
        const { error } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const updates = req.body;

        // Check if email or username already exists
        if (updates.email || updates.username) {
            const existingUser = await User.findOne({
                _id: { $ne: id },
                $or: [
                    ...(updates.email ? [{ email: updates.email }] : []),
                    ...(updates.username ? [{ username: updates.username }] : [])
                ]
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Email or username already exists' 
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', [protect, admin], async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (req.user._id.toString() === id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
