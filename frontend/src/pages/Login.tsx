import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { login, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Effacer l'erreur quand l'utilisateur commence à taper
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.email) {
            newErrors.email = 'Email est requis';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Email est invalide';
        }
        
        if (!formData.password) {
            newErrors.password = 'Mot de passe est requis';
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
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            // L'erreur est gérée dans le contexte
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>Connexion</h2>
            
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

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {loading ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Pas de compte ? <Link to="/register" style={{ color: '#007bff' }}>S'inscrire</Link>
            </p>
        </div>
    );
};

export default Login;
