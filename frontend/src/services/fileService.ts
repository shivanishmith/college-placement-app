import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  return response.data.fileUrl;
};

export const uploadProfileImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/users/profile/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  return response.data.imageUrl;
};

export const uploadResume = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/users/profile/resume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  return response.data.resumeUrl;
}; 