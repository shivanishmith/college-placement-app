import axios from 'axios';

const API_URL = 'http://localhost:5000/api/feedback';

export interface Feedback {
  _id: string;
  studentId: string;
  studentName: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSubmission {
  subject: string;
  message: string;
}

// Student submits feedback
export const submitFeedback = async (data: FeedbackSubmission): Promise<Feedback> => {
  const token = localStorage.getItem('token');
  const response = await axios.post<{ success: boolean; message: string; feedback: Feedback }>(
    API_URL,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data.feedback;
};

// Superadmin gets all feedback
export const getAllFeedback = async (): Promise<Feedback[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<{ success: boolean; count: number; data: Feedback[] }>(
    API_URL,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data.data;
};

// Superadmin gets feedback by ID
export const getFeedbackById = async (id: string): Promise<Feedback> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<{ success: boolean; feedback: Feedback }>(
    `${API_URL}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data.feedback;
};

// Superadmin updates feedback status
export const updateFeedbackStatus = async (id: string, status: 'read' | 'resolved'): Promise<Feedback> => {
  const token = localStorage.getItem('token');
  const response = await axios.patch<{ success: boolean; message: string; feedback: Feedback }>(
    `${API_URL}/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data.feedback;
}; 