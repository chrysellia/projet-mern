export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'à faire' | 'en cours' | 'terminé';
    assignedTo: User;
    createdBy: User;
    deadline: string;
    notified: boolean;
    reminderSent: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
}

export interface TaskFormData {
    title: string;
    description?: string;
    status: 'à faire' | 'en cours' | 'terminé';
    assignedTo: string;
    deadline: string;
}

export interface ApiResponse<T> {
    message: string;
    data?: T;
    error?: string;
}
