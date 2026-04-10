import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

console.log('🌐 API Base URL:', API_BASE_URL);

// Create axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add token to every request and handle FormData
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token added to request');
    }
    
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('📡 Full Request URL:', fullUrl);
    console.log('📡 Method:', config.method?.toUpperCase());
    
    // If sending FormData, remove Content-Type to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📦 FormData detected, Content-Type removed for multipart boundary');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error: any) => {
    console.error('❌ Response error status:', error.response?.status);
    console.error('❌ Response error data:', error.response?.data);
    console.error('❌ Full error:', error);
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await AsyncStorage.removeItem('auth_token');
      console.log('🔑 Token expired, cleared storage');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
