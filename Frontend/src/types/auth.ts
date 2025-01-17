export interface RegistrationData {
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'driver' | 'superadmin';
    profileImage?: string;
    twoFactorEnabled: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginData {
    email: string;
    password: string;
}
