export type UserRole = 'student' | 'teacher' | 'superadmin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profile?: Record<string, string>;
  resumeUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  cgpa?: number;
  department?: string;
} 