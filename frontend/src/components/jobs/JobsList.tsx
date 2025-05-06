import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

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

const JobsList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/jobs');
        setJobs(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch jobs. Please try again.');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApply = async (jobId: string) => {
    try {
      // Simple direct apply without checking profile data
      await axios.post(`http://localhost:5000/api/apply/${jobId}/apply`);
      
      // Refresh jobs list
      const response = await axios.get('http://localhost:5000/api/jobs');
      setJobs(response.data);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to apply for job');
      console.error('Error applying for job:', err);
    }
  };

  // Check if the current user can manage this job
  const canManageJob = (job: Job) => {
    if (!user) return false;
    return (
      // Superadmin can manage all jobs
      user.role === 'superadmin' || 
      // Teacher can manage only their own jobs
      (user.role === 'teacher' && job.postedBy === user._id)
    );
  };

  const handleUpdate = (job: Job) => {
    // Store the job data in sessionStorage to retrieve it in the edit page
    sessionStorage.setItem('jobToEdit', JSON.stringify(job));
    navigate(`/jobs/edit/${job._id}`);
  };

  const handleOpenDeleteDialog = (jobId: string) => {
    setJobToDelete(jobId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setJobToDelete(null);
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    
    try {
      setDeleteLoading(true);
      await axios.delete(`http://localhost:5000/api/jobs/${jobToDelete}`);
      
      // Remove the deleted job from the state
      setJobs(jobs.filter(job => job._id !== jobToDelete));
      
      handleCloseDeleteDialog();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete job');
      console.error('Error deleting job:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadExcel = (jobId: string) => {
    setDownloadingExcel(jobId);
    
    // Direct browser download using window.location
    window.location.href = `http://localhost:5000/api/excel/job/${jobId}/download`;
    
    // Reset download state after a short delay
    setTimeout(() => {
      setDownloadingExcel(null);
    }, 1000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Available Jobs
        </Typography>
        {(user?.role === 'teacher' || user?.role === 'superadmin') && (
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/jobs/create"
          >
            Create New Job
          </Button>
        )}
      </Box>

      {jobs.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }}>
          No jobs available at the moment.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => {
            const isApplied = job.applicants.some(
              applicant => applicant.student === user?._id
            );
            const deadlinePassed = new Date(job.deadline) < new Date();
            const showManageOptions = canManageJob(job);

            return (
              <Grid item xs={12} md={6} key={job._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {job.title}
                      </Typography>
                      
                      {showManageOptions && (
                        <Box>
                          <Tooltip title="Edit Job">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleUpdate(job)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Job">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleOpenDeleteDialog(job._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                    
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Salary: {job.salary}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {job.description.length > 200 
                        ? `${job.description.substring(0, 200)}...` 
                        : job.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Required Profile Fields:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {job.requiredFields.map((field) => (
                        <Chip 
                          key={field} 
                          label={field} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                      These fields must be in your profile to apply
                    </Typography>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="primary.main">
                        Eligibility Criteria:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Min CGPA: {job.minCGPA || 'None'} | 
                        Departments: {job.eligibleDepartments && job.eligibleDepartments.length > 0 
                          ? (job.eligibleDepartments.includes('ALL') 
                              ? 'All' 
                              : job.eligibleDepartments.join(', ')) 
                          : 'All'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Deadline: {formatDate(job.deadline)}
                    </Typography>
                    
                    {deadlinePassed && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        Application deadline has passed
                      </Typography>
                    )}
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions>
                    {user?.role === 'student' && (
                      <Button
                        size="small"
                        color={isApplied ? "success" : "primary"}
                        disabled={isApplied || deadlinePassed}
                        onClick={() => handleApply(job._id)}
                      >
                        {isApplied ? "Applied" : "Apply Now"}
                      </Button>
                    )}
                    
                    {(user?.role === 'teacher' || user?.role === 'superadmin') && (
                      <>
                        <Button
                          size="small"
                          component={RouterLink}
                          to={`/jobs/${job._id}/applications`}
                        >
                          View Applications
                        </Button>
                        
                        <Button
                          size="small"
                          color="success"
                          startIcon={<FileDownloadIcon />}
                          disabled={downloadingExcel === job._id}
                          onClick={() => handleDownloadExcel(job._id)}
                        >
                          {downloadingExcel === job._id ? "Downloading..." : "Get Excel"}
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

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

export default JobsList; 