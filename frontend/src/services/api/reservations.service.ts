import { apiClient } from './client';

export interface CreateReservationRequest {
  mascotaId: string;
  habitacionId: string;
  fechaEntrada: string;
  fechaSalida: string;
  tipoHospedaje: 'estandar' | 'especial';
  serviciosAdicionales?: string[];
}

export interface UpdateReservationRequest {
  fechaEntrada?: string;
  fechaSalida?: string;
  serviciosAdicionales?: string[];
}

export interface ReservationResponse {
  id: string;
  mascotaId: string;
  habitacionId: string;
  nombreMascota: string;
  habitacion: string;
  fechaEntrada: string;
  fechaSalida: string;
  tipoHospedaje: string;
  esEspecial: boolean;
  serviciosAdicionales: string[];
  estado: string;
  fechaCreacion: string;
}

export const reservationsService = {
  /**
   * Get all reservations for the authenticated user
   * Optionally filter by estado (CONFIRMADA, EN_PROGRESO, COMPLETADA, CANCELADA)
   */
  async getReservations(estado?: string): Promise<ReservationResponse[]> {
    try {
      const params = estado ? { estado } : {};
      const response = await apiClient.get<ReservationResponse[]>('/reservations', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single reservation by ID
   */
  async getReservationById(id: string): Promise<ReservationResponse> {
    try {
      const response = await apiClient.get<ReservationResponse>(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new reservation
   */
  async createReservation(data: CreateReservationRequest): Promise<ReservationResponse> {
    try {
      const response = await apiClient.post<ReservationResponse>('/reservations', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a reservation (dates and/or additional services)
   */
  async updateReservation(
    id: string,
    data: UpdateReservationRequest
  ): Promise<ReservationResponse> {
    try {
      const response = await apiClient.patch<ReservationResponse>(`/reservations/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all available reservation statuses from the backend
   */
  async getStatuses(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/reservations/statuses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel a reservation
   */
  async cancelReservation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/reservations/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
