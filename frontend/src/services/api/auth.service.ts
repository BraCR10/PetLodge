import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  numeroIdentificacion: string;
  email: string;
  password: string;
  numeroTelefono?: string;
  direccion?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    nombre: string;
    numeroIdentificacion: string;
    email: string;
    numeroTelefono?: string;
    direccion?: string;
    isAdmin: boolean;
    isActive: boolean;
    fechaRegistro: string;
  };
  access_token: string;
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
