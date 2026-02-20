import React, { useState, useEffect } from 'react';
import { Task, TaskFormData, User } from '../types';
import { taskService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TaskFormProps {
    task?: Task;
    onTaskCreated?: (task: Task) => void;
    onTaskUpdated?: (task: Task) => void;
    onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
    task, 
    onTaskCreated, 
    onTaskUpdated, 
    onCancel 
}) => {
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        status: 'à faire',
        assignedTo: ''
    });
    const [users, setUsers] = useState<User[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const isEditing = !!task;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                assignedTo: task.assignedTo.id
            });
        }
    }, [task, isEditing]);

    useEffect(() => {
        fetchUsers();
    }, []);

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
        
        // Effacer l'erreur quand l'utilisateur commence à taper
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Titre est requis';
        }
        
        if (!formData.assignedTo) {
            newErrors.assignedTo = 'Veuillez assigner cette tâche à quelqu\'un';
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
            
            if (isEditing) {
                const updatedTask = await taskService.update(task._id, formData);
                onTaskUpdated?.(updatedTask);
            } else {
                const createdTask = await taskService.create(formData);
                onTaskCreated?.(createdTask);
                
                // Réinitialiser le formulaire si création
                if (!isEditing) {
                    setFormData({
                        title: '',
                        description: '',
                        status: 'à faire',
                        assignedTo: ''
                    });
                }
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la sauvegarde de la tâche';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const availableUsers = user?.role === 'admin' 
        ? users 
        : users.filter(u => u.id === user?.id);

    return (
        <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '20px',
            backgroundColor: '#f8f9fa'
        }}>
            <h2>{isEditing ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}</h2>
            
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
                    <label style={{ display: 'block', marginBottom: '5px' }}>Titre:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength={200}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.title ? '1px solid #ff6b6b' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                    {errors.title && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.title}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        maxLength={1000}
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.description ? '1px solid #ff6b6b' : '1px solid #ddd',
                            borderRadius: '4px',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Statut:</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="à faire">À faire</option>
                        <option value="en cours">En cours</option>
                        <option value="terminé">Terminé</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Assigné à:</label>
                    <select
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.assignedTo ? '1px solid #ff6b6b' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="">Sélectionner un utilisateur</option>
                        {availableUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username} ({user.email})
                            </option>
                        ))}
                    </select>
                    {errors.assignedTo && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.assignedTo}
                        </div>
                    )}
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
                        {loading ? 'Sauvegarde...' : (isEditing ? 'Mettre à jour' : 'Créer')}
                    </button>

                    {isEditing && onCancel && (
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
                    )}
                </div>
            </form>
        </div>
    );
};

export default TaskForm;
