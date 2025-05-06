import axios from 'axios';
import { User } from '../types/User';

const API_URL = 'http://localhost:5000/api/users';

interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });
  return response.data;
};

export const registerUser = async (name: string, email: string, password: string, role: string) => {
  const response = await axios.post(`${API_URL}/register`, { name, email, password, role });
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<{ user: User }>(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.user;
};

export const updateProfile = async (profileData: Record<string, any>): Promise<User> => {
  // Check if any of the values are Files - if so, we need to upload them first
  const processedData: Record<string, string> = {};
  const directFields: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(profileData)) {
    if (value instanceof File) {
      // For file fields, we'll handle them separately via the file upload API
      continue;
    } else if (key === 'cgpa' || key === 'department') {
      // Handle special fields that should go directly in the root
      directFields[key] = value;
    } else {
      processedData[key] = value as string;
    }
  }
  
  const token = localStorage.getItem('token');
  const response = await axios.put<{ message: string, user: User }>(
    `${API_URL}/profile`, 
    { 
      profile: processedData,
      ...directFields  // Add cgpa and department directly
    }, 
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return response.data.user;
};

// Add axios interceptor to handle token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
); 