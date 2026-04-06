import { apiClient } from './client';

export interface RoomResponse {
  id: string;
  numero: string;
}

export const roomsService = {
  /**
   * Get all available rooms
   */
  async getRooms(): Promise<RoomResponse[]> {
    try {
      const response = await apiClient.get<RoomResponse[]>('/rooms');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get available rooms for a date range
   * @param from Date in YYYY-MM-DD format
   * @param to Date in YYYY-MM-DD format
   */
  async getAvailableRooms(from: string, to: string): Promise<RoomResponse[]> {
    try {
      const response = await apiClient.get<RoomResponse[]>('/rooms/available', {
        params: { from, to },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
