import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { register, clearError, error } = useAuth();
    const navigate = useNavigate();

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
        
        if (!formData.username) {
            newErrors.username = 'Nom d\'utilisateur est requis';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Minimum 3 caractères';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email est requis';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Email est invalide';
        }
        
        if (!formData.password) {
            newErrors.password = 'Mot de passe est requis';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Minimum 6 caractères';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirmez le mot de passe';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            clearError();
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role as 'user' | 'admin'
            });
            navigate('/dashboard');
        } catch (error) {
            // L'erreur est gérée dans le contexte
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>Inscription</h2>
            
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
                    <label style={{ display: 'block', marginBottom: '5px' }}>Mot de passe:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.password ? '1px solid #ff6b6b' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                    {errors.password && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.password}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Confirmer mot de passe:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: errors.confirmPassword ? '1px solid #ff6b6b' : '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                    {errors.confirmPassword && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.confirmPassword}
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
                    {formData.role === 'admin' && (
                        <p style={{ 
                            fontSize: '12px', 
                            color: '#dc3545', 
                            marginTop: '5px',
                            fontStyle: 'italic'
                        }}>
                            ⚠️ Attention : Seul un administrateur existant peut créer un autre administrateur
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: loading ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {loading ? 'Inscription...' : 'S\'inscrire'}
                </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Déjà un compte ? <Link to="/login" style={{ color: '#007bff' }}>Se connecter</Link>
            </p>
        </div>
    );
};

export default Register;
