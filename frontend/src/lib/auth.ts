import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  _id: string;
  username: string;
  password: string;
  __v?: number;
}

interface LoginResponse {
  token: string;
}

export const login = async (username: string, password: string): Promise<void> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, { username, password });
  const { token } = response.data;
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const signup = async (username: string, password: string): Promise<void> => {
  await axios.post(`${API_URL}/auth/signup`, { username, password });
  // After signup, automatically log the user in
  await login(username, password);
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  
  try {
    // Since we don't have a /me endpoint, we'll just validate the token
    // and return a minimal user object with the username from the token
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    return {
      _id: tokenData.id,
      username: tokenData.username || 'user',
      password: ''
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
