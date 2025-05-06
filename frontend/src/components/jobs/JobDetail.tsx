import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import SendIcon from '@mui/icons-material/Send';

interface Job {
  _id: string;
  title: string;
  description: string;
  requiredFields: string[];
  salary: string;
  deadline: string;
  postedBy: string;
  applicants: Array<{ student: string }>;
  minCGPA?: number;
  eligibleDepartments?: string[];
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [isEligible, setIsEligible] = useState<boolean>(true);
  const [eligibilityMessage, setEligibilityMessage] = useState<string>('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch job details. Please try again.');
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  useEffect(() => {
    const checkEligibility = () => {
      if (!job || !user || user.role !== 'student') return;
      
      let eligible = true;
      let message = '';
      
      if (job.minCGPA && (user.cgpa === undefined || user.cgpa < job.minCGPA)) {
        eligible = false;
        message = `Your CGPA (${user.cgpa || 'Not provided'}) does not meet the minimum requirement (${job.minCGPA})`;
      }
      
      if (eligible && job.eligibleDepartments && job.eligibleDepartments.length > 0) {
        if (!job.eligibleDepartments.includes('ALL') && !job.eligibleDepartments.includes(user.department || '')) {
          eligible = false;
          message = `Your department (${user.department || 'Not provided'}) is not eligible for this job`;
        }
      }
      
      setIsEligible(eligible);
      setEligibilityMessage(message);
    };
    
    checkEligibility();
  }, [job, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApply = async () => {
    if (!id) return;
    
    try {
      setApplying(true);
      setApplyError(null);
      
      // Let user know we're checking eligibility
      setApplyError("Checking eligibility and required fields...");
      
      // Simple direct apply - backend will check eligibility and required fields
      const response = await axios.post(`http://localhost:5000/api/apply/${id}/apply`);
      setApplySuccess(true);
      setApplyError(null);
      
      // Refresh job data
      const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(jobResponse.data);
    } catch (err: any) {
      setApplySuccess(false);
      setApplyError(err?.response?.data?.error || 'Failed to apply for job');
      console.error('Error applying for job:', err);
    } finally {
      setApplying(false);
    }
  };

  const handleUpdate = () => {
    // Store the job data in sessionStorage to retrieve it in the edit page
    if (job) {
      sessionStorage.setItem('jobToEdit', JSON.stringify(job));
      navigate(`/jobs/edit/${job._id}`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleteLoading(true);
      await axios.delete(`http://localhost:5000/api/jobs/${id}`);
      setOpenDeleteDialog(false);
      navigate('/jobs', { state: { message: 'Job deleted successfully' } });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete job');
      console.error('Error deleting job:', err);
      setOpenDeleteDialog(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

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

  // Check if the current user is authorized to edit this job
  const canManageJob = () => {
    if (!user || !job) return false;
    return (
      // Superadmin can manage all jobs
      user.role === 'superadmin' || 
      // Teacher can manage only their own jobs
      (user.role === 'teacher' && job.postedBy === user._id)
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Job not found'}</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/jobs')} 
          sx={{ mt: 2 }}
        >
          Back to Jobs
        </Button>
      </Container>
    );
  }

  const isApplied = job.applicants.some(applicant => 
    applicant.student === user?._id
  );
  const deadlinePassed = new Date(job.deadline) < new Date();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {job.title}
          </Typography>
          <Button 
            variant="outlined" 
            component={RouterLink} 
            to="/jobs"
          >
            Back to Jobs
          </Button>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Salary: {job.salary}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Job Description
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {job.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Eligibility Criteria
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold" color="error">
                Important: You must meet ALL of the following criteria to apply:
              </Typography>
              
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>1. Minimum CGPA Required:</strong> {job.minCGPA || 'No minimum requirement'}
              </Typography>
              
              <Typography variant="body1">
                <strong>2. Eligible Departments:</strong> {job.eligibleDepartments && job.eligibleDepartments.length > 0 
                  ? (job.eligibleDepartments.includes('ALL') 
                      ? 'All Departments' 
                      : job.eligibleDepartments.join(', ')) 
                  : 'All Departments'}
              </Typography>
              
              <Typography variant="body1">
                <strong>3. Required Profile Fields:</strong> You must have all the required fields in your profile
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                Note: System will automatically check if you meet these requirements. If you're missing any required fields, 
                please update your profile first.
              </Typography>
            </Box>
            
            {user?.role === 'student' && !isEligible && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {eligibilityMessage}
              </Alert>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Required Profile Fields
            </Typography>
            <Box sx={{ mb: 2 }}>
              {job.requiredFields.map((field) => (
                <Chip 
                  key={field} 
                  label={field} 
                  sx={{ mr: 1, mb: 1 }} 
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              You must have all these fields in your profile to apply. Please update your profile if any are missing.
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Application Deadline:</strong> {formatDate(job.deadline)}
            </Typography>
            
            {deadlinePassed && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                The application deadline for this job has passed.
              </Alert>
            )}
          </Grid>
          
          {user?.role === 'student' && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              {applySuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  You have successfully applied for this job!
                </Alert>
              )}
              
              {applyError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {applyError}
                </Alert>
              )}
              
              <Box sx={{ mt: 2 }}>
                {isEligible ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApply}
                    disabled={isApplied || deadlinePassed || applying}
                    startIcon={<SendIcon />}
                  >
                    {applying ? "Applying..." : isApplied ? "Applied" : "Apply Now"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={true}
                  >
                    Not Eligible
                  </Button>
                )}
              </Box>
            </Grid>
          )}
          
          {/* Management buttons for teachers and superadmins */}
          {(user?.role === 'teacher' || user?.role === 'superadmin') && (
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Management Options
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to={`/jobs/${job._id}/applications`}
                    fullWidth
                    startIcon={<DownloadIcon />}
                  >
                    View Applications
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<FileDownloadIcon />}
                    onClick={handleDownloadExcel}
                    disabled={downloadingExcel}
                  >
                    {downloadingExcel ? "Downloading..." : "Download Excel"}
                  </Button>
                </Grid>
                
                {canManageJob() && (
                  <>
                    <Grid item xs={12} md={3}>
                      <Button
                        variant="contained"
                        color="info"
                        fullWidth
                        startIcon={<EditIcon />}
                        onClick={handleUpdate}
                      >
                        Update
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<DeleteIcon />}
                        onClick={handleOpenDeleteDialog}
                      >
                        Delete
                      </Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Job</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this job? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetail; 