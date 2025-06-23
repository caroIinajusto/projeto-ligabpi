import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loginWithEmail, register, logout as appwriteLogout } from '../lib/appwrite';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  clube_favorito?: string;
  bio?: string;
  previsoes?: number;
  acertos?: number;
  ranking?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    checkInitialSession();
  }, []);

  const checkInitialSession = async () => {
    console.log(" Verificando sessão inicial...");
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      console.log(" Utilizador encontrado:", !!currentUser);
      setUser(currentUser);
    } catch (error) {
      console.log(" Nenhuma sessão ativa");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log(" Iniciando login...");
    try {
      await loginWithEmail(email, password);
      const currentUser = await getCurrentUser();
      console.log(" Login bem-sucedido");
      setUser(currentUser);
    } catch (error) {
      console.log(" Erro no login:", error);
      setUser(null);
      throw error;
    }
  };

  const registerUser = async (name: string, email: string, password: string) => {
    console.log(" Registando utilizador...");
    try {
      await register(name, email, password);
      console.log(" Registo bem-sucedido");
    } catch (error) {
      console.log(" Erro no registo:", error);
      throw error;
    }
  };

const logout = async () => {
  console.log(" Fazendo logout...");
  try {
    await appwriteLogout(); 
    console.log("Logout bem-sucedido");
  } catch (error) {
    console.log("Erro no logout:", error);
    
  } finally {
    setUser(null); 
  }
};


  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log(" Erro ao atualizar utilizador:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register: registerUser,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
