import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import StatCard from '../dashboard/StatCard';
import PlacementTrendChart from '../dashboard/PlacementTrendChart';
import BranchWisePlacementChart from '../dashboard/BranchWisePlacementChart';
import CompanyPlacementChart from '../dashboard/CompanyPlacementChart';
import RecentPlacements from '../dashboard/RecentPlacements';
import { getStatistics, DashboardStats } from '../../services/statisticsService';

// TabPanel component for the dashboard sections
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getStatistics();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get formatted role with capitalized first letter
  const formattedRole = user?.role 
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1) 
    : 'User';

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Placement Statistics
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          View placement and college statistics
        </Typography>
        
        <Divider sx={{ my: 3 }} />

        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Students" 
              value={stats?.totalStudents || 0} 
              icon={<SchoolIcon fontSize="large" />} 
              color="#3f51b5" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Teachers" 
              value={stats?.totalTeachers || 0} 
              icon={<GroupIcon fontSize="large" />} 
              color="#f50057" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Jobs" 
              value={stats?.totalJobs || 0} 
              icon={<BusinessIcon fontSize="large" />} 
              color="#ff9800" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Placement Rate" 
              value={`${stats?.placementRate || 0}%`} 
              icon={<TrendingUpIcon fontSize="large" />} 
              color="#4caf50" 
              subtitle={`${stats?.totalPlacements || 0} students placed`}
            />
          </Grid>
        </Grid>

        {/* Dashboard Tabs */}
        <Box sx={{ mt: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            textColor="primary"
            indicatorColor="primary"
            centered
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              mb: 2
            }}
          >
            <Tab label="Placement Trends" />
            <Tab label="Distribution Analysis" />
            <Tab label="Recent Placements" />
          </Tabs>

          {/* Placement Trends Tab */}
          <TabPanel value={tabValue} index={0}>
            <PlacementTrendChart 
              data={stats?.placementTrend || []} 
              title="Placement Trends (Monthly)" 
            />
          </TabPanel>

          {/* Distribution Analysis Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <CompanyPlacementChart 
                  data={stats?.topCompanies || []} 
                  title="Company-wise Placements" 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BranchWisePlacementChart 
                  data={stats?.branchWisePlacements || []} 
                  title="Branch-wise Placements" 
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Recent Placements Tab */}
          <TabPanel value={tabValue} index={2}>
            <RecentPlacements 
              data={stats?.recentPlacements || []} 
              title="Recent Placements" 
            />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default Statistics; 