import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import FeedbackIcon from '@mui/icons-material/Feedback';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Define navigation links based on user role
  const getNavItems = () => {
    const commonItems = [
      { text: 'Profile', icon: <PersonIcon />, path: '/profile', color: '#f50057' },
      { text: 'Statistics', icon: <InsightsIcon />, path: '/statistics', color: '#9c27b0' },
    ];

    if (user?.role === 'student') {
      return [
        ...commonItems,
        { text: 'Jobs', icon: <WorkIcon />, path: '/jobs', color: '#009688' },
        { text: 'Resume Builder', icon: <DescriptionIcon />, path: '/resume', color: '#ff9800' },
        { text: 'Feedback', icon: <FeedbackIcon />, path: '/feedback', color: '#673ab7' },
      ];
    } else if (user?.role === 'teacher') {
      return [
        ...commonItems,
        { text: 'Jobs', icon: <WorkIcon />, path: '/jobs', color: '#009688' },
        { text: 'Create Job', icon: <AddIcon />, path: '/jobs/create', color: '#4caf50' },
        { text: 'View Profiles', icon: <PeopleIcon />, path: '/students', color: '#ff5722' },
      ];
    } else if (user?.role === 'superadmin') {
      return [
        ...commonItems,
        { text: 'Jobs', icon: <WorkIcon />, path: '/jobs', color: '#009688' },
        { text: 'Create Job', icon: <AddIcon />, path: '/jobs/create', color: '#4caf50' },
        { text: 'View Profiles', icon: <PeopleIcon />, path: '/students', color: '#ff5722' },
        { text: 'Feedback Reader', icon: <FeedbackIcon />, path: '/feedback/admin', color: '#673ab7' },
      ];
    }
    return commonItems;
  };

  const navItems = getNavItems();

  // Get formatted role with capitalized first letter
  const formattedRole = user?.role 
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1) 
    : 'User';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {user?.name || 'User'}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {formattedRole} Dashboard
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Grid container spacing={3}>
        {navItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.text}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Box 
                  sx={{ 
                    borderRadius: '50%', 
                    p: 2, 
                    backgroundColor: item.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </Box>
              </Box>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography variant="h6" component="h2">
                  {item.text}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  component={RouterLink} 
                  to={item.path} 
                  variant="contained" 
                  sx={{ backgroundColor: item.color }}
                >
                  Go to {item.text}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard; 