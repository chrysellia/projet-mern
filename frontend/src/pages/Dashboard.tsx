import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import UserManagement from '../components/UserManagement';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'tasks' | 'create' | 'users'>('tasks');
    const [refreshTasks, setRefreshTasks] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleTaskCreated = () => {
        setRefreshTasks(prev => prev + 1);
        setActiveTab('tasks');
    };

    const getTabStyle = (tab: string) => ({
        marginRight: '10px',
        padding: '10px 20px',
        backgroundColor: activeTab === tab ? '#007bff' : '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    });

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                borderBottom: '1px solid #ddd',
                paddingBottom: '10px'
            }}>
                <div>
                    <h1 style={{ margin: 0, color: '#333' }}>Tableau de bord</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                        Bienvenue, {user?.username}! ({user?.role})
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
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
                    onClick={() => setActiveTab('tasks')}
                    style={getTabStyle('tasks')}
                >
                    Tâches
                </button>
                
                <button
                    onClick={() => setActiveTab('create')}
                    style={getTabStyle('create')}
                >
                    Créer une tâche
                </button>

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
                {activeTab === 'tasks' && (
                    <TaskList key={refreshTasks} />
                )}
                
                {activeTab === 'create' && (
                    <TaskForm onTaskCreated={handleTaskCreated} />
                )}

                {activeTab === 'users' && user?.role === 'admin' && (
                    <UserManagement />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
