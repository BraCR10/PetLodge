import { apiClient } from './client';

export interface PetResponse {
  id: string;
  nombre: string;
  tipo: string;
  raza: string;
  anos: number;
  meses: number;
  sexo: string;
  tamaño: string;
  estadoVacunacion: string;
  condicionesMedicas: string;
  numeroVeterinario: string;
  cuidadosEspeciales: string;
  foto?: string;
}

export const petsService = {
  /**
   * Get all pets for the authenticated user
   */
  async getPets(): Promise<PetResponse[]> {
    try {
      const response = await apiClient.get<PetResponse[]>('/pets');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single pet by ID
   */
  async getPetById(id: string): Promise<PetResponse> {
    try {
      const response = await apiClient.get<PetResponse>(`/pets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
