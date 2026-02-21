import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UserManagementProps {
    refreshTasks?: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ refreshTasks }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, [refreshTasks]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const fetchedUsers = await userService.getAll();
            setUsers(fetchedUsers);
            setError('');
        } catch (error) {
            setError('Erreur lors du chargement des utilisateurs');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await userService.delete(userId);
                setUsers(users.filter(user => user._id !== userId));
            } catch (error) {
                setError('Erreur lors de la suppression de l\'utilisateur');
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
    };

    const handleUserUpdated = (updatedUser: User) => {
        setUsers(users.map(user => 
            user._id === updatedUser._id ? updatedUser : user
        ));
        setEditingUser(null);
    };

    const getRoleColor = (role: string) => {
        return role === 'admin' ? '#dc3545' : '#007bff';
    };

    if (loading) {
        return <div>Chargement des utilisateurs...</div>;
    }

    return (
        <div>
            <h2>Gestion des utilisateurs</h2>
            
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

            {currentUser?.role === 'admin' && (
                <div style={{ marginBottom: '20px' }}>
                    <a 
                        href="/register"
                        style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            marginRight: '10px'
                        }}
                    >
                        Créer un nouvel utilisateur
                    </a>
                </div>
            )}

            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                    {currentUser?.role === 'admin' ? '🔐 Gestion des utilisateurs' : '👥 Liste des utilisateurs'}
                </h4>
                <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
                    {currentUser?.role === 'admin' 
                        ? 'En tant qu\'administrateur, vous pouvez créer, modifier et supprimer des comptes utilisateurs.'
                        : 'En tant qu\'utilisateur, vous pouvez voir la liste des utilisateurs pour assigner des tâches.'
                    }
                </p>
            </div>

            {editingUser && (
                <UserForm 
                    user={editingUser}
                    onUserUpdated={handleUserUpdated}
                    onCancel={() => setEditingUser(null)}
                />
            )}

            {users.length === 0 ? (
                <p>Aucun utilisateur trouvé.</p>
            ) : (
                <div>
                    {users.map(user => (
                        <div
                            key={user._id}
                            className={`card card-hover ${user.role === 'admin' ? 'card-gradient primary' : ''}`}
                        >
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="card-avatar">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 className="card-title">
                                            {user.username}
                                            <span className={`card-badge ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </h3>
                                        <p className="card-subtitle">{user.email}</p>
                                    </div>
                                </div>
                                {currentUser?.role === 'admin' && (
                                    <div className="card-actions">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="card-action primary"
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="card-action danger"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="card-content">
                                <div className="card-metrics">
                                    <div className="card-metric">
                                        <div className="card-metric-value">
                                            {user.role === 'admin' ? '🔐' : '👤'}
                                        </div>
                                        <div className="card-metric-label">Rôle</div>
                                    </div>
                                    <div className="card-metric">
                                        <div className="card-metric-value">
                                            {user.email}
                                        </div>
                                        <div className="card-metric-label">Email</div>
                                    </div>
                                    <div className="card-metric">
                                        <div className="card-metric-value">
                                            {user.username}
                                        </div>
                                        <div className="card-metric-label">Nom d'utilisateur</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card-footer">
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {user.role === 'admin' ? 'Administrateur du système' : 'Utilisateur standard'}
                                </div>
                                {user.role === 'admin' && (
                                    <div className="card-tags">
                                        <span className="card-tag primary">Admin</span>
                                        <span className="card-tag success">Accès complet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface UserFormProps {
    user: User;
    onUserUpdated: (user: User) => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onUserUpdated, onCancel }) => {
    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email,
        role: user.role
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.username.trim()) {
            newErrors.username = 'Nom d\'utilisateur est requis';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Minimum 3 caractères';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email est requis';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Email est invalide';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            setLoading(true);
            
            const updatedUser = await userService.update(user._id, formData);
            onUserUpdated(updatedUser);
            
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '20px',
            backgroundColor: '#f8f9fa'
        }}>
            <h3>Modifier l'utilisateur</h3>
            
            {errors.general && (
                <div style={{ 
                    color: 'red', 
                    marginBottom: '20px', 
                    padding: '10px', 
                    border: '1px solid #ff6b6b', 
                    borderRadius: '4px',
                    backgroundColor: '#ffe6e6'
                }}>
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Nom d'utilisateur:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.username ? '1px solid #ff6b6b' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                    {errors.username && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.username}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.email ? '1px solid #ff6b6b' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                    {errors.email && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.email}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Rôle:</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: loading ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Mise à jour...' : 'Mettre à jour'}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserManagement;
