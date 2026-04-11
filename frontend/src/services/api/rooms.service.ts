import { apiClient } from './client';

export interface RoomResponse {
  id: string;
  numero: string;
  disponible?: boolean;
}

export interface RoomsPageResponse {
  data: RoomResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export const roomsService = {
  /**
   * Get paginated rooms. When from and to are provided, each room includes
   * a `disponible` field indicating availability for that date range.
   */
  async getRooms(page: number = 1, from?: string, to?: string): Promise<RoomsPageResponse> {
    try {
      const params: Record<string, string | number> = { page };
      if (from) params.from = from;
      if (to) params.to = to;
      const response = await apiClient.get<RoomsPageResponse>('/rooms', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
