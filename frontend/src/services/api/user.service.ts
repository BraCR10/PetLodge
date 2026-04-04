import { apiClient } from './client';

export interface UpdateUserRequest {
  nombre?: string;
  numeroIdentificacion?: string;
  email?: string;
  numeroTelefono?: string;
  direccion?: string;
}

export interface UserProfile {
  id: string;
  nombre: string;
  numeroIdentificacion: string;
  email: string;
  numeroTelefono?: string;
  direccion?: string;
  isAdmin: boolean;
  isActive: boolean;
  fechaRegistro: string;
}

export const userService = {
  /**
   * Get current user profile (already validated via /users/me)
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>('/users/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update user profile
   * Only nombre, numeroTelefono, and direccion can be updated
   */
  async updateProfile(data: UpdateUserRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.patch<UserProfile>('/users/me', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Deactivate user account
   */
  async deactivateAccount(): Promise<void> {
    try {
      await apiClient.delete('/users/me');
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
