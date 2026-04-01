import React, { createContext, useState, ReactNode } from 'react';
import { Usuario } from '@/src/types';

interface AuthContextType {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  updateUser: (updates: Partial<Usuario>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  const updateUser = (updates: Partial<Usuario>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
