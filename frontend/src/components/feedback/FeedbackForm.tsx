import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { submitFeedback, FeedbackSubmission } from '../../services/feedbackService';

const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackSubmission>({
    subject: 'General Feedback',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      subject: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.message.trim()) {
        throw new Error('Please enter your feedback message');
      }

      await submitFeedback(formData);
      setSuccess(true);
      setFormData({
        subject: 'General Feedback',
        message: ''
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to submit feedback');
      console.error('Error submitting feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Submit Feedback
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          We value your feedback! Please share your thoughts, suggestions, or concerns.
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Thank you for your feedback! It has been submitted successfully.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="subject-label">Subject</InputLabel>
            <Select
              labelId="subject-label"
              name="subject"
              value={formData.subject}
              label="Subject"
              onChange={handleSubjectChange}
            >
              <MenuItem value="General Feedback">General Feedback</MenuItem>
              <MenuItem value="Website Improvement">Website Improvement</MenuItem>
              <MenuItem value="Job Postings">Job Postings</MenuItem>
              <MenuItem value="Technical Issue">Technical Issue</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={6}
            name="message"
            label="Your Feedback"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Please share your thoughts, suggestions, or concerns..."
            sx={{ mb: 3 }}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Feedback'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FeedbackForm; 