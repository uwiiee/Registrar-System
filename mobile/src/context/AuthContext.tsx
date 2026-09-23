import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import api from '../lib/api';

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  department: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, check if we already have a saved user/token
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await storage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, ...userData } = res.data;
    await storage.setItem('token', token);
    await storage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { token, ...userData } = res.data;
    await storage.setItem('token', token);
    await storage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await storage.deleteItem('token');
    await storage.deleteItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — lets any screen just call useAuth() instead of useContext(AuthContext)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};