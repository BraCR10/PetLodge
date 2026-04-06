import { apiClient } from './client';

export interface PetResponse {
  id: string;
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

  /**
   * Create a new pet with optional photo
   * Photo should be uploaded as multipart/form-data
   */
  async createPet(data: CreatePetRequest): Promise<PetResponse> {
    try {
      const formData = new FormData();
      
      // Add all fields to formData
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
      
      // Add photo if provided
      if (data.foto) {
        formData.append('foto', data.foto);
      }

      const response = await apiClient.post<PetResponse>('/pets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a pet with optional photo replacement
   */
  async updatePet(id: string, data: UpdatePetRequest): Promise<PetResponse> {
    try {
      const formData = new FormData();
      
      // Add only provided fields to formData
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
      
      // Add photo if provided
      if (data.foto) {
        formData.append('foto', data.foto);
      }

      const response = await apiClient.patch<PetResponse>(`/pets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
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
