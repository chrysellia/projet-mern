import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';
import '../styles/themes.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="layout">
            <header className="header dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Task Manager</h1>
                        <p className="user-info">
                            Bienvenue, {user?.username} ({user?.role})
                        </p>
                    </div>
                    <div className="header-right">
                        <button className="btn-danger" onClick={logout}>
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="main-content">
                {children}
            </main>
            
            <footer className="footer">
                <p>&copy; 2024 Task Management System. Tous droits réservés.</p>
            </footer>
        </div>
    );
};

export default Layout;
