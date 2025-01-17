import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { RegistrationData, User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<any>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for existing token and user data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.withCredentials = true;
    }
  }, []);

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        twoFactorCode
      }, {
        withCredentials: true
      });

      if (!response.data.success) {
        if (response.data.need2FA) {
          // Return special object indicating 2FA is needed
          return {
            need2FA: true,
            email,
            password
          };
        }
        throw new Error(response.data.message);
      }

      console.log('Login successful:', {
        token: response.data.token ? 'exists' : 'missing',
        user: response.data.user
      });

      // Save token to localStorage
      localStorage.setItem('token', response.data.token);

      // Update context state
      setUser(response.data.user);
      setIsAuthenticated(true);

      // Configure axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data
      });

      // Clear any existing auth state
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];

      throw new Error(
        error.response?.data?.message || error.message || 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegistrationData) => {
    try {
      setLoading(true);
      console.log('Attempting registration with data:', { 
        ...data, 
        password: '[REDACTED]' 
      });

      // Validate required fields
      if (!data.name || !data.email || !data.password || !data.role) {
        throw new Error('Please provide all required fields');
      }

      const response = await axios.post('http://localhost:5000/api/auth/register', data, {
        withCredentials: true
      });
      console.log('Registration response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }

      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      setLoading(false);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    axios.defaults.withCredentials = false;
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
