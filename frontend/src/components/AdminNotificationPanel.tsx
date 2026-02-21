import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface OverdueTask {
    _id: string;
    title: string;
    description?: string;
    status: string;
    deadline: string;
    daysOverdue: number;
    assignedTo: {
        _id: string;
        username: string;
        email: string;
    };
    createdBy: {
        username: string;
        email: string;
    };
    createdAt: string;
}

interface AdminNotificationPanelProps {
    refreshTrigger?: number;
}

const AdminNotificationPanel: React.FC<AdminNotificationPanelProps> = ({ refreshTrigger }) => {
    const [overdueTasks, setOverdueTasks] = useState<OverdueTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState<string | null>(null);
    const [emailModal, setEmailModal] = useState<{
        isOpen: boolean;
        userId: string;
        username: string;
        email: string;
        taskId?: string;
        taskTitle?: string;
    }>({
        isOpen: false,
        userId: '',
        username: '',
        email: '',
        taskId: '',
        taskTitle: ''
    });
    const [emailForm, setEmailForm] = useState({
        subject: '',
        message: ''
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchOverdueTasks();
    }, [refreshTrigger]);

    const fetchOverdueTasks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/admin-notifications/overdue', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                setOverdueTasks(data.data);
            }
        } catch (error) {
            console.error('Error fetching overdue tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendQuickReminder = async (taskId: string, taskTitle: string, userId: string, username: string, email: string) => {
        try {
            setSendingEmail(taskId);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/admin-notifications/send-reminder/${taskId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`✅ Email de rappel envoyé à ${username} (${email})`);
                // Rafraîchir la liste
                fetchOverdueTasks();
            } else {
                alert(`❌ Erreur: ${result.message}`);
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            alert('❌ Erreur lors de l\'envoi de l\'email');
        } finally {
            setSendingEmail(null);
        }
    };

    const openEmailModal = (userId: string, username: string, email: string, taskId?: string, taskTitle?: string) => {
        setEmailModal({
            isOpen: true,
            userId,
            username,
            email,
            taskId,
            taskTitle
        });
        setEmailForm({
            subject: taskId ? `Rappel : Tâche en retard - ${taskTitle}` : 'Message de l\'administrateur',
            message: taskId 
                ? `Bonjour ${username},\n\nLa tâche "${taskTitle}" est en retard. Merci de la compléter dès que possible.\n\nCordialement,\nL'administrateur`
                : `Bonjour ${username},\n\n[Ceci est un message de l'administrateur]\n\nCordialement,\n${user?.username}`
        });
    };

    const sendCustomEmail = async () => {
        try {
            setSendingEmail('custom');
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/admin-notifications/send-email', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: emailModal.userId,
                    subject: emailForm.subject,
                    message: emailForm.message
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`✅ Email envoyé à ${emailModal.username} (${emailModal.email})`);
                setEmailModal({ isOpen: false, userId: '', username: '', email: '', taskId: '', taskTitle: '' });
                setEmailForm({ subject: '', message: '' });
            } else {
                alert(`❌ Erreur: ${result.message}`);
            }
        } catch (error) {
            console.error('Error sending custom email:', error);
            alert('❌ Erreur lors de l\'envoi de l\'email');
        } finally {
            setSendingEmail(null);
        }
    };

    const getSeverityColor = (daysOverdue: number) => {
        if (daysOverdue >= 7) return '#dc3545'; // Rouge - très en retard
        if (daysOverdue >= 3) return '#fd7e14'; // Orange - en retard
        return '#ffc107'; // Jaune - légèrement en retard
    };

    const getSeverityText = (daysOverdue: number) => {
        if (daysOverdue >= 7) return 'Très en retard';
        if (daysOverdue >= 3) return 'En retard';
        return 'Légèrement en retard';
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>🔍 Vérification des tâches en retard...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#333' }}>🚨 Notifications Admin</h3>
                <button
                    onClick={fetchOverdueTasks}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🔄 Actualiser
                </button>
            </div>

            {overdueTasks.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    backgroundColor: '#d4edda', 
                    borderRadius: '8px',
                    color: '#155724'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        Aucune tâche en retard
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '5px' }}>
                        Toutes les tâches sont à jour !
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ 
                        marginBottom: '20px', 
                        padding: '15px', 
                        backgroundColor: '#fff3cd', 
                        borderRadius: '8px',
                        border: '1px solid #ffeaa7'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '24px' }}>⚠️</div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#856404' }}>
                                    {overdueTasks.length} tâche(s) en retard détectée(s)
                                </div>
                                <div style={{ fontSize: '14px', color: '#856404' }}>
                                    Cliquez sur "Envoyer un rappel" pour notifier les utilisateurs
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {overdueTasks.map((task) => (
                            <div key={task._id} style={{
                                border: `2px solid ${getSeverityColor(task.daysOverdue)}`,
                                borderRadius: '8px',
                                padding: '20px',
                                backgroundColor: '#fff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                            {task.title}
                                        </h4>
                                        {task.description && (
                                            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                                                {task.description.substring(0, 100)}
                                                {task.description.length > 100 && '...'}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#666' }}>
                                            <span>👤 {task.assignedTo.username}</span>
                                            <span>📅 {new Date(task.deadline).toLocaleDateString('fr-FR')}</span>
                                            <span style={{ 
                                                color: getSeverityColor(task.daysOverdue),
                                                fontWeight: 'bold'
                                            }}>
                                                📅 {task.daysOverdue} jour(s) de retard
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#999' }}>
                                            Créée par {task.createdBy.username} • {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '8px 12px', 
                                        backgroundColor: getSeverityColor(task.daysOverdue), 
                                        color: 'white', 
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        minWidth: '120px'
                                    }}>
                                        {getSeverityText(task.daysOverdue)}
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => sendQuickReminder(task._id, task.title, task.assignedTo._id, task.assignedTo.username, task.assignedTo.email)}
                                        disabled={sendingEmail === task._id}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: sendingEmail === task._id ? '#ccc' : '#ffc107',
                                            color: sendingEmail === task._id ? '#666' : '#000',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: sendingEmail === task._id ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {sendingEmail === task._id ? '⏳ Envoi...' : '📧 Envoyer un rappel'}
                                    </button>
                                    <button
                                        onClick={() => openEmailModal(task.assignedTo._id, task.assignedTo.username, task.assignedTo.email, task._id, task.title)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        ✉️ Email personnalisé
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal d'email personnalisé */}
            {emailModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
                            ✉️ Envoyer un email à {emailModal.username}
                        </h3>
                        
                        <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                            Destinataire : {emailModal.email}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Sujet :
                            </label>
                            <input
                                type="text"
                                value={emailForm.subject}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Message :
                            </label>
                            <textarea
                                value={emailForm.message}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                                rows={6}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setEmailModal({ isOpen: false, userId: '', username: '', email: '', taskId: '', taskTitle: '' })}
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
                            <button
                                onClick={sendCustomEmail}
                                disabled={sendingEmail === 'custom'}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: sendingEmail === 'custom' ? '#ccc' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: sendingEmail === 'custom' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {sendingEmail === 'custom' ? '⏳ Envoi...' : '📧 Envoyer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotificationPanel;
