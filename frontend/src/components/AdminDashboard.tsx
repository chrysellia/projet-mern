import React, { useState, useEffect } from 'react';
import { Task, User } from '../types';
import { taskService, userService } from '../services/api';

interface AdminStats {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    taskCompletionRate: number;
    tasksPerUser: number;
    recentTasks: Task[];
    topUsers: User[];
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats>({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        taskCompletionRate: 0,
        tasksPerUser: 0,
        recentTasks: [],
        topUsers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [tasks, users] = await Promise.all([
                taskService.getAll(),
                userService.getAll()
            ]);

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'terminé').length;
            const inProgressTasks = tasks.filter(task => task.status === 'en cours').length;
            const todoTasks = tasks.filter(task => task.status === 'à faire').length;
            const totalUsers = users.length;
            const adminUsers = users.filter(user => user.role === 'admin').length;
            const regularUsers = users.filter(user => user.role === 'user').length;
            const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const tasksPerUser = totalUsers > 0 ? Math.round((totalTasks / totalUsers) * 10) / 10 : 0;

            // Calculer les utilisateurs avec le plus de tâches
            const userTaskCounts = users.map(user => {
                const userTasks = tasks.filter(task => task.assignedTo._id === user._id);
                return { ...user, taskCount: userTasks.length };
            }).sort((a, b) => b.taskCount - a.taskCount).slice(0, 5);

            const recentTasks = tasks
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5);

            setStats({
                totalTasks,
                completedTasks,
                inProgressTasks,
                todoTasks,
                totalUsers,
                adminUsers,
                regularUsers,
                taskCompletionRate,
                tasksPerUser,
                recentTasks,
                topUsers: userTaskCounts
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
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
                <div>Chargement du tableau de bord administrateur...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    🎯 Tableau de bord administrateur
                </h2>
                <p style={{ margin: '0', color: '#666' }}>
                    Vue d'ensemble complète du système
                </p>
            </div>

            {/* Statistiques principales */}
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
                        {stats.totalTasks}
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
                        {stats.completedTasks}
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
                        {stats.inProgressTasks}
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
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
                        {stats.totalUsers}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Total utilisateurs</div>
                </div>
            </div>

            {/* Statistiques secondaires */}
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
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545', marginBottom: '5px' }}>
                        {stats.todoTasks}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>À faire</div>
                </div>

                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔐</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1', marginBottom: '5px' }}>
                        {stats.adminUsers}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Administrateurs</div>
                </div>

                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>👤</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8', marginBottom: '5px' }}>
                        {stats.regularUsers}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Utilisateurs</div>
                </div>

                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e83e8c', marginBottom: '5px' }}>
                        {stats.tasksPerUser}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Tâches/utilisateur</div>
                </div>
            </div>

            {/* Barre de progression globale */}
            <div style={{ 
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                marginBottom: '30px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🎯 Taux de complétion global</h3>
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '5px',
                        fontSize: '14px'
                    }}>
                        <span>Progression du système</span>
                        <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                            {stats.taskCompletionRate}%
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
                            width: `${stats.taskCompletionRate}%`,
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
                            {stats.taskCompletionRate > 10 && `${stats.taskCompletionRate}%`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Répartition des tâches et utilisateurs */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px', 
                marginBottom: '30px' 
            }}>
                {/* Répartition des tâches */}
                <div style={{ 
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📈 Répartition des tâches</h3>
                    {stats.totalTasks > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '20px' }}>📋</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span>À faire</span>
                                        <span style={{ fontWeight: 'bold', color: '#dc3545' }}>
                                            {stats.todoTasks} ({Math.round((stats.todoTasks / stats.totalTasks) * 100)}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(stats.todoTasks / stats.totalTasks) * 100}%`,
                                            height: '100%',
                                            backgroundColor: '#dc3545'
                                        }} />
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '20px' }}>⏳</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span>En cours</span>
                                        <span style={{ fontWeight: 'bold', color: '#ffc107' }}>
                                            {stats.inProgressTasks} ({Math.round((stats.inProgressTasks / stats.totalTasks) * 100)}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(stats.inProgressTasks / stats.totalTasks) * 100}%`,
                                            height: '100%',
                                            backgroundColor: '#ffc107'
                                        }} />
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '20px' }}>✅</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span>Terminées</span>
                                        <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                                            {stats.completedTasks} ({Math.round((stats.completedTasks / stats.totalTasks) * 100)}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(stats.completedTasks / stats.totalTasks) * 100}%`,
                                            height: '100%',
                                            backgroundColor: '#28a745'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                            Aucune tâche dans le système
                        </div>
                    )}
                </div>

                {/* Répartition des utilisateurs */}
                <div style={{ 
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>👥 Répartition des utilisateurs</h3>
                    {stats.totalUsers > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '20px' }}>🔐</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span>Administrateurs</span>
                                        <span style={{ fontWeight: 'bold', color: '#6f42c1' }}>
                                            {stats.adminUsers} ({Math.round((stats.adminUsers / stats.totalUsers) * 100)}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(stats.adminUsers / stats.totalUsers) * 100}%`,
                                            height: '100%',
                                            backgroundColor: '#6f42c1'
                                        }} />
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '20px' }}>👤</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span>Utilisateurs</span>
                                        <span style={{ fontWeight: 'bold', color: '#17a2b8' }}>
                                            {stats.regularUsers} ({Math.round((stats.regularUsers / stats.totalUsers) * 100)}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(stats.regularUsers / stats.totalUsers) * 100}%`,
                                            height: '100%',
                                            backgroundColor: '#17a2b8'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                            Aucun utilisateur dans le système
                        </div>
                    )}
                </div>
            </div>

            {/* Top utilisateurs et tâches récentes */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px' 
            }}>
                {/* Top utilisateurs */}
                <div style={{ 
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🏆 Top utilisateurs (par nombre de tâches)</h3>
                    {stats.topUsers.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {stats.topUsers.map((user, index) => (
                                <div key={user._id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e9ecef',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {(user as any).taskCount} tâches
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                            Aucun utilisateur avec des tâches
                        </div>
                    )}
                </div>

                {/* Tâches récentes */}
                <div style={{ 
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📝 Tâches récentes</h3>
                    {stats.recentTasks.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {stats.recentTasks.map(task => (
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
                                                    {task.description.substring(0, 80)}
                                                    {task.description.length > 80 && '...'}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '12px', color: '#999' }}>
                                                Assigné à: {task.assignedTo.username} • 
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
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                            Aucune tâche dans le système
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
