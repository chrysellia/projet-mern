import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginData, RegisterData } from '../types';
import { authService } from '../services/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
    | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
                error: null
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: action.payload
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: null
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true,
    error: null
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    dispatch({ type: 'SET_LOADING', payload: true });
                    const user = await authService.getCurrentUser();
                    dispatch({ 
                        type: 'LOGIN_SUCCESS', 
                        payload: { user, token } 
                    });
                } catch (error) {
                    console.error('Failed to get current user:', error);
                    localStorage.removeItem('token');
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await authService.login({ email, password });
            localStorage.setItem('token', response.token);
            dispatch({ 
                type: 'LOGIN_SUCCESS', 
                payload: { user: response.user, token: response.token } 
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
            throw error;
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await authService.register(userData);
            localStorage.setItem('token', response.token);
            dispatch({ 
                type: 'LOGIN_SUCCESS', 
                payload: { user: response.user, token: response.token } 
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
