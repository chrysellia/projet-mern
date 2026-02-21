import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import '../styles/themes.css';

interface UserFormProps {
    user?: User;
    onUserUpdated?: (user: User) => void;
    onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onUserUpdated, onCancel }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'user',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                role: user.role,
                password: '',
                confirmPassword: ''
            });
        }
    }, [user]);

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
            newErrors.username = 'Le nom d\'utilisateur est requis';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'L\'email n\'est pas valide';
        }
        
        if (!user && !formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (!user && formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }
        
        if (!user && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
            setIsSubmitting(true);
            
            if (user) {
                const updatedUser = await userService.update(user._id, {
                    username: formData.username,
                    email: formData.email,
                    role: formData.role as 'user' | 'admin'
                });
                onUserUpdated?.(updatedUser);
            } else {
                // Pour créer un utilisateur, on utilise fetch directement car userService.create n'existe pas
                const response = await fetch('http://localhost:5001/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        role: formData.role,
                        password: formData.password
                    })
                });
                
                if (response.ok) {
                    const createdUser = await response.json();
                    onUserUpdated?.(createdUser.user);
                } else {
                    throw new Error('Erreur lors de la création de l\'utilisateur');
                }
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la sauvegarde de l\'utilisateur';
            setErrors({ general: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isEditing = !!user;

    return (
        <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto', 
            padding: '20px',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2 style={{ 
                    margin: '0 0 10px 0', 
                    color: 'var(--text-primary)',
                    fontSize: '1.8rem',
                    fontWeight: '600'
                }}>
                    {isEditing ? '✏️ Modifier l\'utilisateur' : '👤 Créer un nouvel utilisateur'}
                </h2>
                <p style={{ 
                    margin: '0', 
                    color: 'var(--text-secondary)',
                    fontSize: '1rem'
                }}>
                    {isEditing 
                        ? 'Modifiez les informations de l\'utilisateur existant' 
                        : 'Remplissez le formulaire ci-dessous pour créer un nouvel utilisateur'
                    }
                </p>
            </div>

            {errors.general && (
                <div style={{ 
                    marginBottom: '20px', 
                    padding: '15px', 
                    backgroundColor: 'var(--danger-bg)', 
                    borderRadius: '8px',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger-text)',
                    textAlign: 'center'
                }}>
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}>
                            Nom d'utilisateur *
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Entrez le nom d'utilisateur..."
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: errors.username ? '2px solid var(--button-danger)' : '1px solid var(--input-border)',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-primary)',
                                transition: 'all 0.2s ease'
                            }}
                            disabled={isSubmitting}
                        />
                        {errors.username && (
                            <div style={{ 
                                color: 'var(--button-danger)', 
                                fontSize: '0.875rem', 
                                marginTop: '5px',
                                fontWeight: '500'
                            }}>
                                {errors.username}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Entrez l'email..."
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: errors.email ? '2px solid var(--button-danger)' : '1px solid var(--input-border)',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-primary)',
                                transition: 'all 0.2s ease'
                            }}
                            disabled={isSubmitting}
                        />
                        {errors.email && (
                            <div style={{ 
                                color: 'var(--button-danger)', 
                                fontSize: '0.875rem', 
                                marginTop: '5px',
                                fontWeight: '500'
                            }}>
                                {errors.email}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem'
                    }}>
                        Rôle *
                    </label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid var(--input-border)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        disabled={isSubmitting}
                    >
                        <option value="user">👤 Utilisateur</option>
                        <option value="admin">🔐 Administrateur</option>
                    </select>
                </div>

                {!isEditing && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem'
                            }}>
                                Mot de passe *
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Entrez le mot de passe..."
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: errors.password ? '2px solid var(--button-danger)' : '1px solid var(--input-border)',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--text-primary)',
                                    transition: 'all 0.2s ease'
                                }}
                                disabled={isSubmitting}
                            />
                            {errors.password && (
                                <div style={{ 
                                    color: 'var(--button-danger)', 
                                    fontSize: '0.875rem', 
                                    marginTop: '5px',
                                    fontWeight: '500'
                                }}>
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem'
                            }}>
                                Confirmer le mot de passe *
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirmez le mot de passe..."
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: errors.confirmPassword ? '2px solid var(--button-danger)' : '1px solid var(--input-border)',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--text-primary)',
                                    transition: 'all 0.2s ease'
                                }}
                                disabled={isSubmitting}
                            />
                            {errors.confirmPassword && (
                                <div style={{ 
                                    color: 'var(--button-danger)', 
                                    fontSize: '0.875rem', 
                                    marginTop: '5px',
                                    fontWeight: '500'
                                }}>
                                    {errors.confirmPassword}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    justifyContent: 'flex-end',
                    marginTop: '10px'
                }}>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'var(--button-secondary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '500',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Annuler
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: isSubmitting ? 'var(--text-muted)' : 'var(--button-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '120px'
                        }}
                    >
                        {isSubmitting ? (
                            <span>⏳ {isEditing ? 'Modification...' : 'Création...'}</span>
                        ) : (
                            <span>{isEditing ? '✏️ Modifier' : '👤 Créer'}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

interface UserManagementProps {
    refreshTasks?: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ refreshTasks }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, [refreshTasks]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const fetchedUsers = await userService.getAll();
            setUsers(fetchedUsers);
            setLoading(false);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
    };

    const handleUserUpdated = (updatedUser: User) => {
        setUsers(users.map(u => 
            u._id === updatedUser._id ? updatedUser : u
        ));
        setEditingUser(null);
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await userService.delete(userId);
                setUsers(users.filter(u => u._id !== userId));
            } catch (error: any) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
            }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                    {user?.role === 'admin' ? '🔐 Gestion des utilisateurs' : '👥 Liste des utilisateurs'}
                </h4>
                <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {user?.role === 'admin' 
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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div>🔄 Chargement des utilisateurs...</div>
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                    gap: '16px',
                    padding: '20px'
                }}>
                    {users.map(user => (
                        <div
                            key={user._id}
                            className="card card-hover"
                            style={{
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                minHeight: '80px'
                            }}
                        >
                            {/* Avatar à gauche */}
                            <UserAvatar 
                                username={user.username}
                                email={user.email}
                                role={user.role}
                                size="medium"
                            />
                            
                            {/* Contenu à droite */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {/* Nom et badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 className="card-title" style={{ 
                                        margin: '0', 
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }}>
                                        {user.username}
                                    </h3>
                                    <span className={`card-badge ${user.role}`} style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '12px'
                                    }}>
                                        {user.role}
                                    </span>
                                </div>
                                
                                {/* Email */}
                                <p className="card-subtitle" style={{ 
                                    margin: '0', 
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {user.email}
                                </p>
                                
                                {/* Description */}
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'var(--text-muted)',
                                    fontStyle: 'italic'
                                }}>
                                    {user.role === 'admin' 
                                        ? 'Administrateur du système' 
                                        : 'Utilisateur standard'
                                    }
                                </div>
                            </div>
                            
                            {/* Actions à droite */}
                            <div className="card-actions" style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleEditUser(user)}
                                    className="card-action primary"
                                    title="Modifier"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="card-action danger"
                                    title="Supprimer"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserManagement;
