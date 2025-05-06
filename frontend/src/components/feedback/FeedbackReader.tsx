import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAllFeedback, updateFeedbackStatus, Feedback } from '../../services/feedbackService';
import { formatDistanceToNow } from 'date-fns';

const FeedbackReader: React.FC = () => {
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Count of unread feedback
  const unreadCount = allFeedback.filter(f => f.status === 'unread').length;

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFeedback(allFeedback);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allFeedback.filter(
        feedback =>
          feedback.subject.toLowerCase().includes(query) ||
          feedback.message.toLowerCase().includes(query) ||
          feedback.studentName.toLowerCase().includes(query)
      );
      setFilteredFeedback(filtered);
    }
  }, [searchQuery, allFeedback]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await getAllFeedback();
      setAllFeedback(data);
      setFilteredFeedback(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch feedback');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setDialogOpen(true);
    
    // If the feedback is unread, mark it as read automatically
    if (feedback.status === 'unread') {
      handleUpdateStatus(feedback._id, 'read');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFeedback(null);
  };

  const handleUpdateStatus = async (id: string, status: 'read' | 'resolved') => {
    try {
      setStatusUpdateLoading(true);
      await updateFeedbackStatus(id, status);
      
      // Update the local state
      setAllFeedback(prev => 
        prev.map(f => 
          f._id === id ? { ...f, status } : f
        )
      );
      
      if (selectedFeedback && selectedFeedback._id === id) {
        setSelectedFeedback(prev => prev ? { ...prev, status } : null);
      }
    } catch (err: any) {
      console.error('Error updating feedback status:', err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'unread':
        return <Chip label="Unread" color="error" size="small" icon={<ScheduleIcon />} />;
      case 'read':
        return <Chip label="Read" color="primary" size="small" icon={<DoneAllIcon />} />;
      case 'resolved':
        return <Chip label="Resolved" color="success" size="small" icon={<CheckCircleIcon />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Feedback Reader
          </Typography>
          <Badge badgeContent={unreadCount} color="error">
            <Chip 
              label={`${allFeedback.length} Total`} 
              color="primary" 
              variant="outlined" 
            />
          </Badge>
        </Box>

        <TextField
          fullWidth
          placeholder="Search feedback by subject, content, or student name..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {filteredFeedback.length === 0 ? (
          <Alert severity="info">No feedback found</Alert>
        ) : (
          <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto' }}>
            <List>
              {filteredFeedback.map((feedback, index) => (
                <React.Fragment key={feedback._id}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleViewFeedback(feedback)}>
                        <VisibilityIcon />
                      </IconButton>
                    }
                    sx={{ 
                      backgroundColor: feedback.status === 'unread' ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" 
                            sx={{ 
                              fontWeight: feedback.status === 'unread' ? 'bold' : 'normal'
                            }}
                          >
                            {feedback.subject}
                          </Typography>
                          {getStatusChip(feedback.status)}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            From: {feedback.studentName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(feedback.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < filteredFeedback.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* Feedback Detail Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          {selectedFeedback && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{selectedFeedback.subject}</Typography>
                  {getStatusChip(selectedFeedback.status)}
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    From
                  </Typography>
                  <Typography variant="body1">{selectedFeedback.studentName}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Submitted
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Message
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, backgroundColor: '#f8f8f8' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedFeedback.message}
                    </Typography>
                  </Paper>
                </Box>
              </DialogContent>
              <DialogActions>
                {selectedFeedback.status !== 'resolved' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedFeedback._id, 'resolved')}
                    color="success"
                    disabled={statusUpdateLoading}
                    startIcon={<CheckCircleIcon />}
                  >
                    Mark as Resolved
                  </Button>
                )}
                <Button onClick={handleCloseDialog} color="primary">
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Paper>
    </Container>
  );
};

export default FeedbackReader; 