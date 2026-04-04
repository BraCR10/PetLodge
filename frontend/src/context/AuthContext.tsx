import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '@/src/types';
import { authService, LoginRequest, RegisterRequest } from '@/src/services/api/auth.service';
import { apiClient } from '@/src/services/api/client';

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Usuario>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize: Check if token was previously saved and validate it with /users/me
   * This runs once when app starts
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('auth_token');

        if (savedToken) {
          // Token exists in AsyncStorage, validate it by calling /users/me
          // Interceptor will automatically add token to header
          
          try {
            // Call /users/me - this validates the token
            // If token is invalid/expired → SessionGuard returns 401 → catch block
            // If token is valid → Returns fresh user data
            const response = await apiClient.get('/users/me');
            console.log('Token valid, user data:', response.data);
            setUser({
              id: response.data.id,
              nombre: response.data.nombre,
              numeroIdentificacion: response.data.numeroIdentificacion,
              email: response.data.email,
              numeroTelefono: response.data.numeroTelefono,
              direccion: response.data.direccion,
              fechaRegistro: response.data.fechaRegistro,
              isAdmin: response.data.isAdmin,
            });
          } catch (error) {
            // Token is invalid or expired
            console.error('Token validation failed:', error);
            await AsyncStorage.removeItem('auth_token');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);

      // Store ONLY token to AsyncStorage (not user)
      // Interceptor will use this for future requests
      await AsyncStorage.setItem('auth_token', response.access_token);

      // Update context with user data
      setUser({
        id: response.user.id,
        nombre: response.user.nombre,
        numeroIdentificacion: response.user.numeroIdentificacion,
        email: response.user.email,
        numeroTelefono: response.user.numeroTelefono,
        direccion: response.user.direccion,
        fechaRegistro: response.user.fechaRegistro,
        isAdmin: response.user.isAdmin,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user and auto-login
   */
  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);

      // Store ONLY token to AsyncStorage (not user)
      // Interceptor will use this for future requests
      await AsyncStorage.setItem('auth_token', response.access_token);

      // Update context with user data
      setUser({
        id: response.user.id,
        nombre: response.user.nombre,
        numeroIdentificacion: response.user.numeroIdentificacion,
        email: response.user.email,
        numeroTelefono: response.user.numeroTelefono,
        direccion: response.user.direccion,
        fechaRegistro: response.user.fechaRegistro,
        isAdmin: response.user.isAdmin,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout - clear token and user data
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  /**
   * Update user data (for profile updates, etc.)
   */
  const updateUser = (updates: Partial<Usuario>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialized,
        login,
        register,
        logout,
        updateUser,
      }}
    >
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
