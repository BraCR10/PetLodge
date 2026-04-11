import { apiClient } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PetResponse {
  id: string;
  nombre: string;
  tipo: string;
  raza: string;
  años: number;
  meses: number;
  sexo: string;
  tamaño: string;
  estadoVacunacion: string;
  condicionesMedicas: string;
  numeroVeterinario: string;
  cuidadosEspeciales: string;
  foto?: string;
}

export interface CreatePetRequest {
  nombre: string;
  tipo: string;
  raza: string;
  anos: number;
  meses: number;
  sexo: string;
  tamano: string;
  estadoVacunacion: string;
  condicionesMedicas: string;
  numeroVeterinario: string;
  cuidadosEspeciales: string;
  foto?: any; // File object
}

export interface UpdatePetRequest {
  nombre?: string;
  tipo?: string;
  raza?: string;
  anos?: number;
  meses?: number;
  sexo?: string;
  tamano?: string;
  estadoVacunacion?: string;
  condicionesMedicas?: string;
  numeroVeterinario?: string;
  cuidadosEspeciales?: string;
  foto?: any; // File object
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

  async createPet(data: CreatePetRequest): Promise<PetResponse> {
    try {
      console.log('🐾 Creating pet with data:', data);
      const formData = new FormData();
      
      formData.append('nombre', data.nombre);
      formData.append('tipo', data.tipo);
      formData.append('raza', data.raza);
      formData.append('anos', String(data.anos));
      formData.append('meses', String(data.meses));
      formData.append('sexo', data.sexo);
      formData.append('tamano', data.tamano);
      formData.append('estadoVacunacion', data.estadoVacunacion);
      formData.append('condicionesMedicas', data.condicionesMedicas);
      formData.append('numeroVeterinario', data.numeroVeterinario);
      formData.append('cuidadosEspeciales', data.cuidadosEspeciales);
      
      if (data.foto?.isPicker && data.foto?.uri) {
        console.log('📷 Adding photo:', data.foto.uri);
        formData.append('foto', {
          uri: data.foto.uri,
          type: 'image/jpeg',
          name: 'pet-photo.jpg',
        } as any);
      }

      const token = await AsyncStorage.getItem('auth_token');
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';
      const url = `${baseUrl}/pets`;
      console.log('📤 Sending POST to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Pet created:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating pet:', error);
      throw error;
    }
  },

  async updatePet(id: string, data: UpdatePetRequest): Promise<PetResponse> {
    try {
      console.log('🐾 Updating pet', id, 'with data:', data);
      const formData = new FormData();
      
      if (data.nombre !== undefined) formData.append('nombre', data.nombre);
      if (data.tipo !== undefined) formData.append('tipo', data.tipo);
      if (data.raza !== undefined) formData.append('raza', data.raza);
      if (data.anos !== undefined) formData.append('anos', String(data.anos));
      if (data.meses !== undefined) formData.append('meses', String(data.meses));
      if (data.sexo !== undefined) formData.append('sexo', data.sexo);
      if (data.tamano !== undefined) formData.append('tamano', data.tamano);
      if (data.estadoVacunacion !== undefined) formData.append('estadoVacunacion', data.estadoVacunacion);
      if (data.condicionesMedicas !== undefined) formData.append('condicionesMedicas', data.condicionesMedicas);
      if (data.numeroVeterinario !== undefined) formData.append('numeroVeterinario', data.numeroVeterinario);
      if (data.cuidadosEspeciales !== undefined) formData.append('cuidadosEspeciales', data.cuidadosEspeciales);
      
      if (data.foto?.isPicker && data.foto?.uri) {
        console.log('📷 Adding photo:', data.foto.uri);
        formData.append('foto', {
          uri: data.foto.uri,
          type: 'image/jpeg',
          name: 'pet-photo.jpg',
        } as any);
      } else if (data.foto) {
        formData.append('foto', data.foto, 'pet-photo.jpg');
      }

      const token = await AsyncStorage.getItem('auth_token');
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';
      const url = `${baseUrl}/pets/${id}`;
      console.log('📤 Sending PATCH to:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Pet updated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating pet:', error);
      throw error;
    }
  },

  /**
   * Delete a pet
   */
  async deletePet(id: string): Promise<void> {
    try {
      await apiClient.delete(`/pets/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
