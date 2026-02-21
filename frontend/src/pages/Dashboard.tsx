import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import TrelloBoard from '../components/TrelloBoard';
import TaskForm from '../components/TaskForm';
import UserManagement from '../components/UserManagement';
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';
import AdminNotificationPanel from '../components/AdminNotificationPanel';
import '../styles/themes.css';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'create' | 'users'>('dashboard');
    const [refreshTasks, setRefreshTasks] = useState(0);
    const [refreshNotifications, setRefreshNotifications] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleTaskCreated = () => {
        setRefreshTasks(prev => prev + 1);
        setActiveTab('tasks');
        setRefreshNotifications(prev => prev + 1);
    };

    const getTabStyle = (tab: string) => ({
        marginRight: '10px',
        padding: '10px 20px',
        backgroundColor: activeTab === tab ? 'var(--button-primary)' : 'var(--bg-tertiary)',
        color: activeTab === tab ? 'white' : 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: 'bold',
        fontSize: '14px'
    });

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                        Tableau de bord
                    </h1>
                    <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
                        Bienvenue {user?.username} ({user?.role})
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn-danger"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'var(--button-danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Déconnexion
                </button>
            </header>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('dashboard')}
                    style={getTabStyle('dashboard')}
                >
                    Tableau de bord
                </button>
                
                <button
                    onClick={() => setActiveTab('tasks')}
                    style={getTabStyle('tasks')}
                >
                    📋 Tâches
                </button>
                
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setActiveTab('create')}
                        style={getTabStyle('create')}
                    >
                        Créer une tâche
                    </button>
                )}

                {user?.role === 'admin' && (
                    <button
                        onClick={() => setActiveTab('users')}
                        style={getTabStyle('users')}
                    >
                        Gérer les utilisateurs
                    </button>
                )}
            </div>

            <div>
                {activeTab === 'dashboard' && user?.role === 'user' && (
                    <UserDashboard />
                )}
                
                {activeTab === 'dashboard' && user?.role === 'admin' && (
                    <AdminDashboard />
                )}
                
                {activeTab === 'tasks' && (
                    <TrelloBoard key={refreshTasks} onTaskUpdated={() => setRefreshTasks(prev => prev + 1)} />
                )}
                
                {activeTab === 'create' && (
                    <TaskForm onTaskCreated={handleTaskCreated} />
                )}

                {activeTab === 'users' && user?.role === 'admin' && (
                    <div>
                        <UserManagement refreshTasks={refreshTasks} />
                        <AdminNotificationPanel refreshTrigger={refreshNotifications} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
