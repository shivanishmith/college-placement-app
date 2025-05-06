import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import JobsList from './components/jobs/JobsList';
import JobDetail from './components/jobs/JobDetail';
import JobApplications from './components/jobs/JobApplications';
import CreateJob from './components/jobs/CreateJob';
import EditJob from './components/jobs/EditJob';
import Profile from './components/profile/Profile';
import StudentsList from './components/profile/StudentsList';
import StudentProfile from './components/profile/StudentProfile';
import FeedbackForm from './components/feedback/FeedbackForm';
import FeedbackReader from './components/feedback/FeedbackReader';
import Statistics from './components/statistics/Statistics';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Container, CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// ProtectedRoute Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if the student has completed their profile
  useEffect(() => {
    if (user && user.role === 'student' && !loading) {
      // If CGPA or department is not set, redirect to profile page
      if ((user.cgpa === undefined || user.cgpa === 0) || !user.department) {
        // Don't redirect if already on the profile page
        if (!location.pathname.includes('/profile')) {
          navigate('/profile', { state: { firstTimeSetup: true } });
        }
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: 'calc(100vh - 160px)' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <JobsList />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id/applications" element={
            <ProtectedRoute allowedRoles={['teacher', 'superadmin']}>
              <JobApplications />
            </ProtectedRoute>
          } />
          <Route path="/jobs/create" element={
            <ProtectedRoute allowedRoles={['teacher', 'superadmin']}>
              <CreateJob />
            </ProtectedRoute>
          } />
          <Route path="/jobs/edit/:id" element={
            <ProtectedRoute allowedRoles={['teacher', 'superadmin']}>
              <EditJob />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute allowedRoles={['teacher', 'superadmin']}>
              <StudentsList />
            </ProtectedRoute>
          } />
          <Route path="/students/:id" element={
            <ProtectedRoute allowedRoles={['teacher', 'superadmin']}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute allowedRoles={['student']}>
              <FeedbackForm />
            </ProtectedRoute>
          } />
          <Route path="/feedback/admin" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <FeedbackReader />
            </ProtectedRoute>
          } />
          <Route path="/statistics" element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Container>
      <Footer />
    </>
  );
};

export default App; 