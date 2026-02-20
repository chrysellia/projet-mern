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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'à faire': return '#ffc107';
            case 'en cours': return '#17a2b8';
            case 'terminé': return '#28a745';
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
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '15px',
                                backgroundColor: '#f8f9fa'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 10px 0' }}>{task.title}</h3>
                                    {task.description && (
                                        <p style={{ margin: '0 0 10px 0', color: '#666' }}>{task.description}</p>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px' }}>
                                        <span>
                                            Assigné à: <strong>{task.assignedTo?.username}</strong>
                                        </span>
                                        <span>
                                            Créé par: <strong>{task.createdBy?.username}</strong>
                                        </span>
                                        <span
                                            style={{
                                                backgroundColor: getStatusColor(task.status),
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '20px' }}>
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                        style={{
                                            padding: '5px',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd',
                                            fontSize: '12px'
                                        }}
                                    >
                                        <option value="à faire">À faire</option>
                                        <option value="en cours">En cours</option>
                                        <option value="terminé">Terminé</option>
                                    </select>
                                    
                                    <button
                                        onClick={() => handleEditTask(task)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Modifier
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDeleteTask(task._id)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Supprimer
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
