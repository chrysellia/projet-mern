const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const Joi = require('joi');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createTaskSchema = Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(1000).allow(''),
    status: Joi.string().valid('à faire', 'en cours', 'terminé').default('à faire'),
    assignedTo: Joi.string().required(),
    deadline: Joi.date().required().min('now')
});

const updateTaskSchema = Joi.object({
    title: Joi.string().max(200),
    description: Joi.string().max(1000).allow(''),
    status: Joi.string().valid('à faire', 'en cours', 'terminé'),
    assignedTo: Joi.string(),
    deadline: Joi.date().min('now').optional()
});

// @route   GET /api/tasks
// @desc    Get all tasks (Admin sees all, User sees their assigned tasks)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let tasks;
        
        if (req.user.role === 'admin') {
            // Admin can see all tasks
            tasks = await Task.find()
                .populate('assignedTo', 'username email')
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 });
        } else {
            // User can only see their assigned tasks
            tasks = await Task.find({ assignedTo: req.user._id })
                .populate('assignedTo', 'username email')
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 });
        }

        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        
        const task = await Task.findById(id)
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user has access to this task
        const isAssignedUser = task.assignedTo._id.toString() === req.user._id.toString();
        const isCreator = task.createdBy._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isAssignedUser && !isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(task);
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/tasks
// @desc    Create task
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        console.log('🔍 DEBUG POST Request - Request body:', req.body);
        
        // Validate input
        const { error } = createTaskSchema.validate(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }

        const { title, description, status, assignedTo, deadline } = req.body;
        console.log('✅ Validation passed. Extracted data:', { title, description, status, assignedTo, deadline });

        // Check if assigned user exists
        let assignedUser;
        try {
            // Si c'est une chaîne, essayer de convertir en ObjectId
            if (mongoose.Types.ObjectId.isValid(assignedTo)) {
                assignedUser = await User.findById(assignedTo);
            } else {
                // Chercher par email comme fallback
                assignedUser = await User.findOne({ email: assignedTo });
            }
        } catch (error) {
            return res.status(400).json({ message: 'Invalid assigned user ID' });
        }
        
        if (!assignedUser) {
            return res.status(400).json({ message: 'Assigned user not found' });
        }

        // Users can only create tasks for themselves, admins can create for anyone
        if (req.user.role !== 'admin' && assignedTo !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only create tasks for yourself' });
        }

        const task = new Task({
            title,
            description,
            status,
            assignedTo: assignedUser._id, // Utiliser l'ObjectId réel
            createdBy: req.user._id,
            deadline
        });

        await task.save();
        
        // Populate user info for response
        await task.populate('assignedTo', 'username email');
        await task.populate('createdBy', 'username email');

        res.status(201).json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        // Validate input
        const { error } = updateTaskSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { id } = req.params;
        const updates = req.body;
        
        console.log('🔍 DEBUG PUT Request:');
        console.log('Task ID:', id);
        console.log('Updates:', updates);
        console.log('AssignedTo value:', updates.assignedTo);
        console.log('Type of assignedTo:', typeof updates.assignedTo);

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permissions
        const isAssignedUser = task.assignedTo.toString() === req.user._id.toString();
        const isCreator = task.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isAssignedUser && !isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // If updating assignedTo, check if user exists and permissions
        if (updates.assignedTo) {
            let assignedUser;
            try {
                // Si c'est une chaîne, essayer de convertir en ObjectId
                if (mongoose.Types.ObjectId.isValid(updates.assignedTo)) {
                    assignedUser = await User.findById(updates.assignedTo);
                } else {
                    // Vérifier si c'est un email (contient @)
                    if (updates.assignedTo.includes('@')) {
                        // Chercher par email avec aggregation pour éviter les problèmes de casting
                        const users = await User.aggregate([
                            { $match: { email: updates.assignedTo } }
                        ]);
                        assignedUser = users[0];
                    } else {
                        // C'est probablement un username, chercher par username avec aggregation
                        const users = await User.aggregate([
                            { $match: { username: updates.assignedTo } }
                        ]);
                        assignedUser = users[0];
                    }
                }
            } catch (error) {
                return res.status(400).json({ message: 'Invalid assigned user ID' });
            }
            
            if (!assignedUser) {
                return res.status(400).json({ message: 'Assigned user not found' });
            }

            // Only admin or creator can change assignment
            if (!isAdmin && !isCreator) {
                return res.status(403).json({ message: 'Cannot change task assignment' });
            }

            // Users can only assign to themselves unless they're admin
            if (!isAdmin && updates.assignedTo !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You can only assign tasks to yourself' });
            }

            // Utiliser l'ObjectId réel pour la mise à jour
            updates.assignedTo = assignedUser._id;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        res.json({
            message: 'Task updated successfully',
            task: updatedTask
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permissions (admin or creator can delete)
        const isCreator = task.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Task.findByIdAndDelete(id);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/tasks/filter/:status
// @desc    Get tasks by status
// @access  Private
router.get('/filter/:status', protect, async (req, res) => {
    try {
        const { status } = req.params;
        
        if (!['à faire', 'en cours', 'terminé'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        let tasks;
        
        if (req.user.role === 'admin') {
            tasks = await Task.find({ status })
                .populate('assignedTo', 'username email')
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 });
        } else {
            tasks = await Task.find({ 
                status, 
                assignedTo: req.user._id 
            })
                .populate('assignedTo', 'username email')
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 });
        }

        res.json(tasks);
    } catch (error) {
        console.error('Filter tasks error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
