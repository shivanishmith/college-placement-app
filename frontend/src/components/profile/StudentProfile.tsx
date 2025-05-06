import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Avatar,
  Button,
  Link,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getStudentById } from '../../services/studentService';
import { User } from '../../types/User';

interface ProfileField {
  type: 'text' | 'image' | 'pdf';
  value: string;
}

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<User | null>(null);
  const [formData, setFormData] = useState<Record<string, ProfileField>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getStudentById(id);
        setStudent(data);
        
        // Process profile fields
        if (data.profile) {
          const initialFormData: Record<string, ProfileField> = {};
          
          for (const [key, value] of Object.entries(data.profile)) {
            // Determine if this is a file field based on the value
            if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
              // Check if it's an image or PDF based on extension or URL pattern
              if (value.match(/\.(jpeg|jpg|gif|png)$/) || value.includes('image')) {
                initialFormData[key] = { type: 'image', value };
              } else if (value.match(/\.(pdf)$/) || value.includes('pdf')) {
                initialFormData[key] = { type: 'pdf', value };
              } else {
                initialFormData[key] = { type: 'text', value };
              }
            } else {
              initialFormData[key] = { type: 'text', value: value as string };
            }
          }
          
          setFormData(initialFormData);
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to fetch student profile');
        console.error('Error fetching student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [id]);

  const handleBack = () => {
    navigate('/students');
  };

  const renderFieldValue = (field: string, fieldData: ProfileField) => {
    if (fieldData.type === 'text') {
      return (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {field}
          </Typography>
          <Typography variant="body1">
            {fieldData.value}
          </Typography>
        </Box>
      );
    } else if (fieldData.type === 'image') {
      return (
        <Card sx={{ mb: 2 }}>
          <CardMedia
            component="img"
            height="140"
            image={fieldData.value}
            alt={field}
            sx={{ objectFit: 'contain' }}
          />
          <CardContent>
            <Typography variant="subtitle2">{field}</Typography>
          </CardContent>
        </Card>
      );
    } else if (fieldData.type === 'pdf') {
      const fileName = fieldData.value.split('/').pop() || 'PDF Document';
      
      return (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PictureAsPdfIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">{field}: </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Link href={fieldData.value} target="_blank" rel="noopener noreferrer">
                {fileName}
              </Link>
            </Box>
          </CardContent>
        </Card>
      );
    }
    
    return null;
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
        <Box sx={{ mt: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back to Students List
          </Button>
        </Box>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Student not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back to Students List
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Student Profile
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          {/* Profile Image and Basic Info */}
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              src={student.imageUrl} 
              sx={{ width: 100, height: 100, mb: 2 }}
            >
              {!student.imageUrl && <PersonIcon />}
            </Avatar>
            <Chip label="Student" color="primary" size="small" />
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {student.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {student.email}
                </Typography>
              </Grid>
              
              {/* Resume */}
              {student.resumeUrl && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Resume / CV
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <InsertDriveFileIcon sx={{ mr: 1 }} />
                      <Link href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                        {student.resumeUrl.split('/').pop() || 'Resume'}
                      </Link>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Profile Fields */}
          {Object.entries(formData).length > 0 ? (
            Object.entries(formData).map(([field, fieldData]) => (
              <Grid item xs={12} md={6} key={field}>
                {renderFieldValue(field, fieldData)}
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No additional profile information available.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentProfile; 