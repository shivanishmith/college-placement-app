import axios from 'axios';

// Types for dashboard statistics
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalJobs: number;
  totalPlacements: number;
  placementRate: number;
  recentPlacements: PlacementData[];
  placementTrend: MonthlyPlacementData[];
  topCompanies: CompanyData[];
  branchWisePlacements: BranchData[];
}

export interface PlacementData {
  id: string;
  studentName: string;
  company: string;
  role: string;
  package: string;
  date: string;
}

export interface MonthlyPlacementData {
  month: string;
  placements: number;
}

export interface CompanyData {
  company: string;
  placements: number;
}

export interface BranchData {
  branch: string;
  placements: number;
}

// Function to get real statistics (for future implementation)
export const getStatistics = async (): Promise<DashboardStats> => {
  try {
    // This would be a real API call in a production environment
    // const token = localStorage.getItem('token');
    // const response = await axios.get<DashboardStats>('http://localhost:5000/api/statistics', {
    //   headers: {
    //     Authorization: `Bearer ${token}`
    //   }
    // });
    // return response.data;
    
    // For now, return mock data
    return mockDashboardStats;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return mockDashboardStats; // Fallback to mock data
  }
};

// Mock data for dashboard
export const mockDashboardStats: DashboardStats = {
  totalStudents: 347,
  totalTeachers: 42,
  totalJobs: 86,
  totalPlacements: 218,
  placementRate: 62.8,
  recentPlacements: [
    {
      id: '1',
      studentName: 'Rahul Sharma',
      company: 'Microsoft',
      role: 'Software Engineer',
      package: '24 LPA',
      date: '2023-05-15'
    },
    {
      id: '2',
      studentName: 'Priya Patel',
      company: 'Google',
      role: 'Frontend Developer',
      package: '28 LPA',
      date: '2023-05-10'
    },
    {
      id: '3',
      studentName: 'Amit Singh',
      company: 'Amazon',
      role: 'Data Scientist',
      package: '26 LPA',
      date: '2023-05-05'
    },
    {
      id: '4',
      studentName: 'Kavya Reddy',
      company: 'TCS',
      role: 'Business Analyst',
      package: '12 LPA',
      date: '2023-04-28'
    },
    {
      id: '5',
      studentName: 'Vikram Thakur',
      company: 'Infosys',
      role: 'System Architect',
      package: '14 LPA',
      date: '2023-04-20'
    }
  ],
  placementTrend: [
    { month: 'Jan', placements: 18 },
    { month: 'Feb', placements: 22 },
    { month: 'Mar', placements: 30 },
    { month: 'Apr', placements: 24 },
    { month: 'May', placements: 28 },
    { month: 'Jun', placements: 32 },
    { month: 'Jul', placements: 26 },
    { month: 'Aug', placements: 20 },
    { month: 'Sep', placements: 18 },
    { month: 'Oct', placements: 12 },
    { month: 'Nov', placements: 8 },
    { month: 'Dec', placements: 0 }
  ],
  topCompanies: [
    { company: 'TCS', placements: 42 },
    { company: 'Infosys', placements: 38 },
    { company: 'Wipro', placements: 32 },
    { company: 'Google', placements: 15 },
    { company: 'Microsoft', placements: 12 },
    { company: 'Amazon', placements: 10 }
  ],
  branchWisePlacements: [
    { branch: 'Computer Science', placements: 85 },
    { branch: 'Electronics', placements: 65 },
    { branch: 'Mechanical', placements: 28 },
    { branch: 'Civil', placements: 22 },
    { branch: 'Chemical', placements: 18 }
  ]
}; 