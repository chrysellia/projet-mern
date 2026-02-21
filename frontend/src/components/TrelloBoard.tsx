import React, { useState, useEffect } from 'react';
import { Task, User } from '../types';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskForm from './TaskForm';

interface TrelloBoardProps {
    refreshTrigger?: number;
    onTaskUpdated?: () => void;
}

const TrelloBoard: React.FC<TrelloBoardProps> = ({ refreshTrigger, onTaskUpdated }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, [refreshTrigger]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const fetchedTasks = await taskService.getAll();
            setTasks(fetchedTasks);
            setError('');
        } catch (error: any) {
            setError('Erreur lors du chargement des tâches');
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await taskService.update(taskId, { status: newStatus as any });
            setTasks(tasks.map(task => 
                task._id === taskId ? { ...task, status: newStatus as any } : task
            ));
            onTaskUpdated?.();
        } catch (error: any) {
            console.error('Error updating task status:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            try {
                await taskService.delete(taskId);
                setTasks(tasks.filter(task => task._id !== taskId));
                onTaskUpdated?.();
            } catch (error: any) {
                console.error('Error deleting task:', error);
            }
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
    };

    const handleTaskUpdated = (updatedTask: Task) => {
        setTasks(tasks.map(task => 
            task._id === updatedTask._id ? updatedTask : task
        ));
        setEditingTask(null);
        onTaskUpdated?.();
    };

    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        setDragOverColumn(status);
    };

    const handleDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        if (draggedTask && draggedTask.status !== newStatus) {
            handleStatusChange(draggedTask._id, newStatus);
        }
        setDragOverColumn(null);
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter(task => task.status === status);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'terminé': return '✅';
            case 'en cours': return '⏳';
            case 'à faire': return '📋';
            default: return '❓';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'terminé': return '#28a745';
            case 'en cours': return '#ffc107';
            case 'à faire': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getDeadlineStatus = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 2) return 'soon';
        return 'normal';
    };

    const formatDeadline = (deadline: string) => {
        const date = new Date(deadline);
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
        });
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>🔄 Chargement des tâches...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#dc3545',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '8px',
                margin: '20px'
            }}>
                {error}
            </div>
        );
    }

    return (
        <div>
            {editingTask && (
                <TaskForm
                    task={editingTask}
                    onTaskUpdated={handleTaskUpdated}
                    onCancel={() => setEditingTask(null)}
                />
            )}

            <div className="trello-board">
                {/* Colonne À faire */}
                <div className="trello-column à-faire">
                    <div className="trello-column-header">
                        <h3 className="trello-column-title">
                            📋 À faire
                        </h3>
                        <span className="trello-column-count">
                            {getTasksByStatus('à faire').length}
                        </span>
                    </div>
                    <div className="trello-cards-container">
                        {getTasksByStatus('à faire').map(task => (
                            <div
                                key={task._id}
                                className="trello-card"
                                draggable
                                onDragStart={() => handleDragStart(task)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, 'à faire')}
                                onDrop={(e) => handleDrop(e, 'à faire')}
                            >
                                <div className="trello-card-header">
                                    <div className="trello-card-title">
                                        {task.title}
                                    </div>
                                    <div className="trello-card-actions">
                                        <button
                                            className="trello-card-action"
                                            onClick={() => handleEditTask(task)}
                                            title="Modifier"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="trello-card-action"
                                            onClick={() => handleDeleteTask(task._id)}
                                            title="Supprimer"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                {task.description && (
                                    <div className="trello-card-content">
                                        <p className="trello-card-description">
                                            {task.description}
                                        </p>
                                    </div>
                                )}
                                <div className="trello-card-footer">
                                    <div className="trello-card-meta">
                                        {task.deadline && (
                                            <div className={`trello-card-deadline ${getDeadlineStatus(task.deadline)}`}>
                                                📅 {formatDeadline(task.deadline)}
                                            </div>
                                        )}
                                        {task.assignedTo && (
                                            <div className="trello-card-avatar">
                                                {task.assignedTo.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="trello-card-badge à-faire">
                                        À faire
                                    </div>
                                </div>
                            </div>
                        ))}
                        {getTasksByStatus('à faire').length === 0 && (
                            <div className="trello-drop-zone">
                                Glissez une tâche ici
                            </div>
                        )}
                    </div>
                </div>

                {/* Colonne En cours */}
                <div className="trello-column en-cours">
                    <div className="trello-column-header">
                        <h3 className="trello-column-title">
                            ⏳ En cours
                        </h3>
                        <span className="trello-column-count">
                            {getTasksByStatus('en cours').length}
                        </span>
                    </div>
                    <div className="trello-cards-container">
                        {getTasksByStatus('en cours').map(task => (
                            <div
                                key={task._id}
                                className="trello-card"
                                draggable
                                onDragStart={() => handleDragStart(task)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, 'en cours')}
                                onDrop={(e) => handleDrop(e, 'en cours')}
                            >
                                <div className="trello-card-header">
                                    <div className="trello-card-title">
                                        {task.title}
                                    </div>
                                    <div className="trello-card-actions">
                                        <button
                                            className="trello-card-action"
                                            onClick={() => handleEditTask(task)}
                                            title="Modifier"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="trello-card-action"
                                            onClick={() => handleDeleteTask(task._id)}
                                            title="Supprimer"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                {task.description && (
                                    <div className="trello-card-content">
                                        <p className="trello-card-description">
                                            {task.description}
                                        </p>
                                    </div>
                                )}
                                <div className="trello-card-footer">
                                    <div className="trello-card-meta">
                                        {task.deadline && (
                                            <div className={`trello-card-deadline ${getDeadlineStatus(task.deadline)}`}>
                                                📅 {formatDeadline(task.deadline)}
                                            </div>
                                        )}
                                        {task.assignedTo && (
                                            <div className="trello-card-avatar">
                                                {task.assignedTo.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="trello-card-badge en-cours">
                                        En cours
                                    </div>
                                </div>
                            </div>
                        ))}
                        {getTasksByStatus('en cours').length === 0 && (
                            <div className="trello-drop-zone">
                                Glissez une tâche ici
                            </div>
                        )}
                    </div>
                </div>

                {/* Colonne Terminé */}
                <div className="trello-column terminé">
                    <div className="trello-column-header">
                        <h3 className="trello-column-title">
                            ✅ Terminé
                        </h3>
                        <span className="trello-column-count">
                            {getTasksByStatus('terminé').length}
                        </span>
                    </div>
                    <div className="trello-cards-container">
                        {getTasksByStatus('terminé').map(task => (
                            <div
                                key={task._id}
                                className="trello-card"
                                draggable
                                onDragStart={() => handleDragStart(task)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, 'terminé')}
                                onDrop={(e) => handleDrop(e, 'terminé')}
                            >
                                <div className="trello-card-header">
                                    <div className="trello-card-title">
                                        {task.title}
                                    </div>
                                    <div className="trello-card-actions">
                                        <button
                                            className="trello-card-action"
                                            onClick={() => handleEditTask(task)}
                                            title="Modifier"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="trello-card-action"
                                            onClick={() => handleDeleteTask(task._id)}
                                            title="Supprimer"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                {task.description && (
                                    <div className="trello-card-content">
                                        <p className="trello-card-description">
                                            {task.description}
                                        </p>
                                    </div>
                                )}
                                <div className="trello-card-footer">
                                    <div className="trello-card-meta">
                                        {task.deadline && (
                                            <div className={`trello-card-deadline ${getDeadlineStatus(task.deadline)}`}>
                                                📅 {formatDeadline(task.deadline)}
                                            </div>
                                        )}
                                        {task.assignedTo && (
                                            <div className="trello-card-avatar">
                                                {task.assignedTo.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="trello-card-badge terminé">
                                        Terminé
                                    </div>
                                </div>
                            </div>
                        ))}
                        {getTasksByStatus('terminé').length === 0 && (
                            <div className="trello-drop-zone">
                                Glissez une tâche ici
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrelloBoard;
