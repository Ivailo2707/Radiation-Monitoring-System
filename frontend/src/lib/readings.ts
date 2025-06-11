import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Reading {
  _id: string;
  value: number;
  timestamp: string;
  deviceId?: string;
  location?: {
    lat: number;
    lng: number;
  };
  __v?: number;
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getReadings = async (limit: number = 100): Promise<Reading[]> => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await axios.get<Reading[]>(`${API_URL}/readings`, {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
};

export const createReading = async (value: number, deviceId?: string, location?: { lat: number; lng: number }): Promise<{ alarm: boolean }> => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await axios.post<{ alarm: boolean }>(
    `${API_URL}/readings`,
    { value, deviceId, location },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

export const getLatestReadings = async (limit: number = 10): Promise<Reading[]> => {
  const readings = await getReadings(limit);
  return readings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
