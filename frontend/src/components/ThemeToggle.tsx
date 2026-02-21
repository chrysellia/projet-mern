import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        // Forcer le style inline pour tester
        if (theme === 'dark') {
            document.body.style.backgroundColor = '#0d1117';
            document.body.style.color = '#f0f6fc';
            document.documentElement.style.backgroundColor = '#0d1117';
            document.documentElement.style.color = '#f0f6fc';
        } else {
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.color = '#212529';
            document.documentElement.style.backgroundColor = '#ffffff';
            document.documentElement.style.color = '#212529';
        }
    }, [theme]);

    const handleToggle = () => {
        console.log('Current theme:', theme);
        toggleTheme();
        console.log('Theme toggled to:', theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            className="theme-toggle"
            onClick={handleToggle}
            title={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
        >
            <span className="icon">
                {theme === 'light' ? '🌙' : '☀️'}
            </span>
        </button>
    );
};

export default ThemeToggle;
