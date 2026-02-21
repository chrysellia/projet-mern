import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    completionRate: number;
}

const UserDashboard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<TaskStats>({
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        completionRate: 0
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const fetchedTasks = await taskService.getAll();
            // Filtrer les tâches assignées à l'utilisateur courant
            const userTasks = fetchedTasks.filter(task => 
                task.assignedTo._id === user?._id
            );
            setTasks(userTasks);
            calculateStats(userTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (userTasks: Task[]) => {
        const total = userTasks.length;
        const completed = userTasks.filter(task => task.status === 'terminé').length;
        const inProgress = userTasks.filter(task => task.status === 'en cours').length;
        const todo = userTasks.filter(task => task.status === 'à faire').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        setStats({
            total,
            completed,
            inProgress,
            todo,
            completionRate
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'terminé': return '#28a745';
            case 'en cours': return '#ffc107';
            case 'à faire': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'terminé': return '✅';
            case 'en cours': return '⏳';
            case 'à faire': return '📋';
            default: return '❓';
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Chargement de votre tableau de bord...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    📊 Tableau de bord personnel
                </h2>
                <p style={{ margin: '0', color: '#666' }}>
                    Bienvenue {user?.username} ! Voici votre progression.
                </p>
            </div>

            {/* Cartes de statistiques */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px', 
                marginBottom: '30px' 
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                        {stats.total}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Total des tâches</div>
                </div>

                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>
                        {stats.completed}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Terminées</div>
                </div>

                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107', marginBottom: '5px' }}>
                        {stats.inProgress}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>En cours</div>
                </div>

                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545', marginBottom: '5px' }}>
                        {stats.todo}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>À faire</div>
                </div>
            </div>

            {/* Barre de progression */}
            <div style={{ 
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                marginBottom: '30px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🎯 Taux de complétion</h3>
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '5px',
                        fontSize: '14px'
                    }}>
                        <span>Progression globale</span>
                        <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                            {stats.completionRate}%
                        </span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '20px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '10px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${stats.completionRate}%`,
                            height: '100%',
                            backgroundColor: '#28a745',
                            transition: 'width 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            {stats.completionRate > 10 && `${stats.completionRate}%`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Répartition des tâches */}
            <div style={{ 
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                marginBottom: '30px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📈 Répartition des tâches</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {stats.total > 0 ? (
                        <>
                            <div style={{ 
                                flex: '1',
                                minWidth: '100px',
                                textAlign: 'center',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px'
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '5px' }}>📋</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                                    {stats.todo}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    À faire ({Math.round((stats.todo / stats.total) * 100)}%)
                                </div>
                            </div>
                            <div style={{ 
                                flex: '1',
                                minWidth: '100px',
                                textAlign: 'center',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px'
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '5px' }}>⏳</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                                    {stats.inProgress}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    En cours ({Math.round((stats.inProgress / stats.total) * 100)}%)
                                </div>
                            </div>
                            <div style={{ 
                                flex: '1',
                                minWidth: '100px',
                                textAlign: 'center',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px'
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '5px' }}>✅</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                                    {stats.completed}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    Terminées ({Math.round((stats.completed / stats.total) * 100)}%)
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                            Aucune tâche assignée pour le moment
                        </div>
                    )}
                </div>
            </div>

            {/* Tâches récentes */}
            <div style={{ 
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📝 Vos tâches récentes</h3>
                {tasks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {tasks.slice(0, 5).map(task => (
                            <div key={task._id} style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                borderLeft: `4px solid ${getStatusColor(task.status)}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                            {getStatusIcon(task.status)} {task.title}
                                        </div>
                                        {task.description && (
                                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                                                {task.description.substring(0, 100)}
                                                {task.description.length > 100 && '...'}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '12px', color: '#999' }}>
                                            Créée le {new Date(task.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 8px',
                                        backgroundColor: getStatusColor(task.status),
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {task.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {tasks.length > 5 && (
                            <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                                ... et {tasks.length - 5} autres tâches
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                        Vous n'avez aucune tâche assignée pour le moment.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
