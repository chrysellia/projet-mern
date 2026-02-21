import React, { useState, useEffect } from 'react';
import { Task, User } from '../types';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskForm from './TaskForm';

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'à faire' | 'en cours' | 'terminé'>('all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        filterTasks();
    }, [tasks, statusFilter]);

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

    const filterTasks = () => {
        if (statusFilter === 'all') {
            setFilteredTasks(tasks);
        } else {
            setFilteredTasks(tasks.filter(task => task.status === statusFilter));
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await taskService.update(taskId, { status: newStatus as any });
            setTasks(tasks.map(task => 
                task._id === taskId ? { ...task, status: newStatus as any } : task
            ));
        } catch (error: any) {
            setError('Erreur lors de la mise à jour du statut');
            console.error('Error updating task status:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            try {
                await taskService.delete(taskId);
                setTasks(tasks.filter(task => task._id !== taskId));
            } catch (error: any) {
                setError('Erreur lors de la suppression de la tâche');
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

    if (loading) {
        return <div>Chargement des tâches...</div>;
    }

    return (
        <div>
            <h2>Liste des tâches</h2>
            
            {error && (
                <div style={{ 
                    color: 'red', 
                    marginBottom: '20px', 
                    padding: '10px', 
                    border: '1px solid #ff6b6b', 
                    borderRadius: '4px',
                    backgroundColor: '#ffe6e6'
                }}>
                    {error}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px' }}>Filtrer par statut:</label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    style={{ 
                        padding: '5px', 
                        borderRadius: '4px', 
                        border: '1px solid #ddd',
                        fontSize: '14px'
                    }}
                >
                    <option value="all">Toutes</option>
                    <option value="à faire">À faire</option>
                    <option value="en cours">En cours</option>
                    <option value="terminé">Terminé</option>
                </select>
            </div>

            {editingTask && (
                <TaskForm
                    task={editingTask}
                    onTaskUpdated={handleTaskUpdated}
                    onCancel={() => setEditingTask(null)}
                />
            )}

            {filteredTasks.length === 0 ? (
                <p>Aucune tâche trouvée.</p>
            ) : (
                <div>
                    {filteredTasks.map(task => (
                        <div
                            key={task._id}
                            className={`card card-status ${task.status.replace(' ', '-').replace('é', 'e')} card-hover`}
                        >
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className={`card-icon ${task.status === 'terminé' ? 'success' : task.status === 'en cours' ? 'warning' : 'danger'}`}>
                                        {getStatusIcon(task.status)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 className="card-title">{task.title}</h3>
                                        {task.description && (
                                            <p className="card-subtitle">{task.description.substring(0, 100)}
                                                {task.description.length > 100 && '...'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className={`card-badge ${task.status.replace(' ', '-').replace('é', 'e')}`}>
                                    {task.status}
                                </div>
                            </div>
                            
                            <div className="card-content">
                                <div className="card-metrics">
                                    <div className="card-metric">
                                        <div className="card-metric-value">
                                            {task.assignedTo?.username || 'N/A'}
                                        </div>
                                        <div className="card-metric-label">Assigné à</div>
                                    </div>
                                    <div className="card-metric">
                                        <div className="card-metric-value">
                                            {task.createdBy?.username || 'N/A'}
                                        </div>
                                        <div className="card-metric-label">Créé par</div>
                                    </div>
                                    {task.deadline && (
                                        <div className="card-metric">
                                            <div className="card-metric-value">
                                                {new Date(task.deadline).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className="card-metric-label">Deadline</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="card-footer">
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="card-actions">
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                        className="card-action secondary"
                                    >
                                        <option value="à faire">À faire</option>
                                        <option value="en cours">En cours</option>
                                        <option value="terminé">Terminé</option>
                                    </select>
                                    
                                    <button
                                        onClick={() => handleEditTask(task)}
                                        className="card-action primary"
                                    >
                                        ✏️ Modifier
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDeleteTask(task._id)}
                                        className="card-action danger"
                                    >
                                        🗑️ Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskList;
