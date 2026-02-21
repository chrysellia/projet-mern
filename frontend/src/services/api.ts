import axios from 'axios';
import { AuthResponse, LoginData, RegisterData, Task, TaskFormData, User } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

// Créer une instance axios avec configuration par défaut
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Adding token to request:', token.substring(0, 20) + '...');
        } else {
            console.log('No token found in localStorage');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Services d'authentification
export const authService = {
    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials: LoginData): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data.user;
    },

    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};

// Services des tâches
export const taskService = {
    getAll: async (): Promise<Task[]> => {
        const response = await api.get('/tasks');
        return response.data;
    },

    getById: async (id: string): Promise<Task> => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    create: async (taskData: TaskFormData): Promise<Task> => {
        const response = await api.post('/tasks', taskData);
        return response.data.task;
    },

    update: async (id: string, taskData: Partial<TaskFormData>): Promise<Task> => {
        const response = await api.put(`/tasks/${id}`, taskData);
        return response.data.task;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    },

    getByStatus: async (status: string): Promise<Task[]> => {
        const response = await api.get(`/tasks/filter/${status}`);
        return response.data;
    }
};

// Services des utilisateurs
export const userService = {
    getAll: async (): Promise<User[]> => {
        console.log('Making request to /users...');
        const response = await api.get('/users');
        console.log('Response from /users:', response.data);
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    update: async (id: string, userData: Partial<User>): Promise<User> => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data.user;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    }
};

export default api;
