import React, { useState, useEffect } from 'react';
import { Task, TaskFormData, User } from '../types';
import { taskService, userService } from '../services/api';
import '../styles/themes.css';

interface TaskFormProps {
    task?: Task;
    onTaskCreated?: (task: Task) => void;
    onTaskUpdated?: (task: Task) => void;
    onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onTaskCreated, onTaskUpdated, onCancel }) => {
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        status: 'à faire',
        assignedTo: '',
        deadline: ''
    });
    const [users, setUsers] = useState<User[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                assignedTo: task.assignedTo._id,
                deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
            });
        }
    }, [task]);

    const fetchUsers = async () => {
        try {
            const fetchedUsers = await userService.getAll();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis';
        }
        
        if (!formData.assignedTo) {
            newErrors.assignedTo = 'L\'assignation est requise';
        }
        
        if (!formData.deadline) {
            newErrors.deadline = 'La deadline est requise';
        } else {
            const deadlineDate = new Date(formData.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (deadlineDate < today) {
                newErrors.deadline = 'La deadline doit être dans le futur';
            }
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
            setIsSubmitting(true);
            
            if (task) {
                const updatedTask = await taskService.update(task._id, formData);
                onTaskUpdated?.(updatedTask);
            } else {
                const createdTask = await taskService.create(formData);
                onTaskCreated?.(createdTask);
                
                // Reset form if creation
                if (!task) {
                    setFormData({
                        title: '',
                        description: '',
                        status: 'à faire',
                        assignedTo: '',
                        deadline: ''
                    });
                }
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = error.response?.data?.message || 'Erreur lors de la sauvegarde de la tâche';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    const isEditing = !!task;

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
                    {isEditing ? '✏️ Modifier la tâche' : '📝 Créer une nouvelle tâche'}
                </h2>
                <p style={{ 
                    margin: '0', 
                    color: 'var(--text-secondary)',
                    fontSize: '1rem'
                }}>
                    {isEditing 
                        ? 'Modifiez les informations de la tâche existante' 
                        : 'Remplissez le formulaire ci-dessous pour créer une nouvelle tâche'
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
                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem'
                    }}>
                        Titre de la tâche *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Entrez le titre de la tâche..."
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: errors.title ? '2px solid var(--button-danger)' : '1px solid var(--input-border)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s ease'
                        }}
                        disabled={isSubmitting}
                    />
                    {errors.title && (
                        <div style={{ 
                            color: 'var(--button-danger)', 
                            fontSize: '0.875rem', 
                            marginTop: '5px',
                            fontWeight: '500'
                        }}>
                            {errors.title}
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
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Décrivez la tâche en détail (optionnel)..."
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid var(--input-border)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease'
                        }}
                        disabled={isSubmitting}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}>
                            Statut
                        </label>
                        <select
                            name="status"
                            value={formData.status}
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
                            <option value="à faire">📋 À faire</option>
                            <option value="en cours">⏳ En cours</option>
                            <option value="terminé">✅ Terminé</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}>
                            Deadline *
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: errors.deadline ? '2px solid var(--button-danger)' : '1px solid var(--input-border)',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            disabled={isSubmitting}
                        />
                        {errors.deadline && (
                            <div style={{ 
                                color: 'var(--button-danger)', 
                                fontSize: '0.875rem', 
                                marginTop: '5px',
                                fontWeight: '500'
                            }}>
                                {errors.deadline}
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
                        Assigné à *
                    </label>
                    <select
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: errors.assignedTo ? '2px solid var(--button-danger)' : '1px solid var(--input-border)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        disabled={isSubmitting}
                    >
                        <option value="">Sélectionner un utilisateur</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>
                                {user.username} ({user.email})
                            </option>
                        ))}
                    </select>
                    {users.length === 0 && (
                        <div style={{ 
                            color: 'var(--text-secondary)', 
                            fontSize: '0.875rem', 
                            marginTop: '5px',
                            fontStyle: 'italic'
                        }}>
                            Chargement des utilisateurs...
                        </div>
                    )}
                    {errors.assignedTo && (
                        <div style={{ 
                            color: 'var(--button-danger)', 
                            fontSize: '0.875rem', 
                            marginTop: '5px',
                            fontWeight: '500'
                        }}>
                            {errors.assignedTo}
                        </div>
                    )}
                </div>

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
                            <span>{isEditing ? '✏️ Modifier' : '📝 Créer'}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;
