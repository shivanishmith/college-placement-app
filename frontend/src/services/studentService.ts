import axios from 'axios';
import { User } from '../types/User';

const API_URL = 'http://localhost:5000/api/students';

// Get all students (for teacher/superadmin)
export const getAllStudents = async (searchQuery: string = ''): Promise<User[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<{ success: boolean, data: User[] }>(`${API_URL}`, {
    params: { search: searchQuery },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

// Get student profile by ID (for teacher/superadmin)
export const getStudentById = async (id: string): Promise<User> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<{ success: boolean, data: User }>(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
}; 