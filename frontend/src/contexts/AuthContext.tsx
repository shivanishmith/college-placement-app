import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/User';
import { loginUser, registerUser, getProfile } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getProfile();
          setUser(userData);
        }
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user, token } = await loginUser(email, password);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      setLoading(true);
      setError(null);
      await registerUser(name, email, password, role);
      // After registration, we'll redirect to login page
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      return { ...prevUser, ...userData } as User;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        error,
        clearError,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 