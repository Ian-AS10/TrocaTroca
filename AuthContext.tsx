import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, setAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, confirmacao_senha: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    nome?: string;
    email?: string;
    senha_atual?: string;
    nova_senha?: string;
    confirmacao_nova_senha?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getProfile();
      setUser(res.profile);
    } catch (err) {
      console.warn('Sessão expirada ou token inválido:', err);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, senha: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login({ email, senha });
      setAuthToken(res.token);
      setUser(res.user);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome: string, email: string, senha: string, confirmacao_senha: string) => {
    setLoading(true);
    try {
      const res = await api.auth.register({ nome, email, senha, confirmacao_senha });
      setAuthToken(res.token);
      setUser(res.user);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (data: {
    nome?: string;
    email?: string;
    senha_atual?: string;
    nova_senha?: string;
    confirmacao_nova_senha?: string;
  }) => {
    const res = await api.auth.updateProfile(data);
    setUser(prev => (prev ? { ...prev, ...res.user } : res.user));
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
