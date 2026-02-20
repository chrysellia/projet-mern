import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const fetchedUsers = await userService.getAll();
            setUsers(fetchedUsers);
            setError('');
        } catch (error: any) {
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
                setUsers(users.filter(user => user.id !== userId));
            } catch (error: any) {
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
            user.id === updatedUser.id ? updatedUser : user
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
                            key={user.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '15px',
                                backgroundColor: '#f8f9fa'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0' }}>
                                        {user.username}
                                        <span
                                            style={{
                                                backgroundColor: getRoleColor(user.role),
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                marginLeft: '10px'
                                            }}
                                        >
                                            {user.role}
                                        </span>
                                    </h3>
                                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                                        Email: {user.email}
                                    </p>
                                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                        Inscrit le: {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleEditUser(user)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Modifier
                                    </button>
                                    
                                    {user.id !== currentUser?.id && (
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
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
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Effacer l'erreur quand l'utilisateur commence à taper
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
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
            
            const updatedUser = await userService.update(user.id, formData);
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
