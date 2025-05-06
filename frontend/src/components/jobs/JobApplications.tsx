import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Application {
  _id: string;
  studentId: Student;
  jobId: string;
  fieldData: Record<string, string>;
  appliedAt: string;
}

interface Job {
  _id: string;
  title: string;
  requiredFields: string[];
}

const JobApplications: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Get job details
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(jobResponse.data);
        
        // Get applications for this job
        const applicationsResponse = await axios.get(`http://localhost:5000/api/apply/${id}/applications`);
        setApplications(applicationsResponse.data);
        
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load application data');
        console.error('Error fetching application data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownloadExcel = async () => {
    if (!id) return;
    
    try {
      setDownloadingExcel(true);
      
      // Direct browser download using window.location
      window.location.href = `http://localhost:5000/api/excel/job/${id}/download`;
      
      // Wait a bit before resetting state
      setTimeout(() => {
        setDownloadingExcel(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error downloading Excel:', err);
      setDownloadingExcel(false);
    }
  };

  // Check if user is authorized to view applications
  const canViewApplications = () => {
    if (!user) return false;
    return user.role === 'teacher' || user.role === 'superadmin';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!canViewApplications()) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          You do not have permission to view job applications.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/jobs')} 
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Back to Jobs
        </Button>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Job not found'}</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/jobs')} 
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Back to Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Applications for: {job.title}
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              component={RouterLink} 
              to={`/jobs/${id}`}
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              Back to Job
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
            >
              {downloadingExcel ? "Downloading..." : "Download Excel"}
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {applications.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            No applications have been submitted for this job yet.
          </Alert>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {applications.length} Application{applications.length !== 1 ? 's' : ''} Received
            </Typography>
            
            {applications.map((application) => (
              <Card key={application._id} sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Student
                      </Typography>
                      <Typography variant="body1">
                        {application.studentId.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.studentId.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Applied on: {formatDate(application.appliedAt)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={9}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Required Fields
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {job.requiredFields.map((field) => (
                              <TableRow key={field}>
                                <TableCell>{field}</TableCell>
                                <TableCell>
                                  {application.fieldData[field] || 'Not provided'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default JobApplications; 