const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['à faire', 'en cours', 'terminé'],
        default: 'à faire'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Task must be assigned to a user']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Task must have a creator']
    },
    deadline: {
        type: Date,
        required: [true, 'Task must have a deadline'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Deadline must be in the future'
        }
    },
    notified: {
        type: Boolean,
        default: false
    },
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
