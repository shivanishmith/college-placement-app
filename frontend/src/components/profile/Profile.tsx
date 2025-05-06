import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Link,
  SelectChangeEvent
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PhotoIcon from '@mui/icons-material/Photo';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateProfile } from '../../services/authService';
import { uploadFile, uploadProfileImage, uploadResume } from '../../services/fileService';

// Define the types of fields that can be added
type FieldType = 'text' | 'image' | 'pdf';

interface ProfileField {
  type: FieldType;
  value: string | File;
}

// Add department options
const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'IT', 'MME', 'CIVIL'];

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<Record<string, ProfileField>>({});
  const [newField, setNewField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [resume, setResume] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cgpa, setCgpa] = useState<string>(user?.cgpa?.toString() || '');
  const [department, setDepartment] = useState<string>(user?.department || '');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      // Check if this is a first-time setup for a student
      if (user.role === 'student' && (!user.cgpa || !user.department)) {
        setIsFirstTimeSetup(true);
      }
      
      // Set CGPA and department values
      setCgpa(user.cgpa?.toString() || '');
      setDepartment(user.department || '');
      
      const initialFormData: Record<string, ProfileField> = {};
      
      // Set profile image preview if exists
      if (user.imageUrl) {
        setProfileImagePreview(user.imageUrl);
      }
      
      // Set resume preview if exists
      if (user.resumeUrl) {
        setResumePreview(user.resumeUrl);
      }
      
      // Process profile fields
      if (user.profile) {
        for (const [key, value] of Object.entries(user.profile)) {
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
            initialFormData[key] = { type: 'text', value };
          }
        }
      }
      
      setFormData(initialFormData);
    }
  }, [user]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      // Create a preview
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResume(file);
      // Create a file name preview
      setResumePreview(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Add CGPA change handler
  const handleCgpaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate CGPA is between 0-10
    if (!value || (parseFloat(value) >= 0 && parseFloat(value) <= 10)) {
      setCgpa(value);
    }
  };

  // Add department change handler
  const handleDepartmentChange = (e: SelectChangeEvent<string>) => {
    setDepartment(e.target.value);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    // Validate required fields for students
    if (user?.role === 'student') {
      if (!cgpa.trim()) {
        setMessage({ text: 'Please enter your CGPA', type: 'error' });
        setLoading(false);
        return;
      }
      
      if (!department) {
        setMessage({ text: 'Please select your department', type: 'error' });
        setLoading(false);
        return;
      }
    }
    
    try {
      // Add CGPA and department fields to the update
      const numericCgpa = parseFloat(cgpa);
      
      // First, handle profile image upload if changed
      let updatedUser = { ...user };
      if (profileImage) {
        const imageUrl = await uploadProfileImage(profileImage);
        updatedUser = { ...updatedUser, imageUrl };
      }
      
      // Next, handle resume upload if changed
      if (resume) {
        const resumeUrl = await uploadResume(resume);
        updatedUser = { ...updatedUser, resumeUrl };
      }
      
      // Process form data - for file fields, upload them first
      const processedData: Record<string, any> = {};
      
      for (const [key, fieldData] of Object.entries(formData)) {
        if (fieldData.value instanceof File) {
          // Upload the file
          const fileUrl = await uploadFile(fieldData.value);
          processedData[key] = fileUrl;
        } else {
          processedData[key] = fieldData.value as string;
        }
      }
      
      // Add CGPA and department for students
      if (user?.role === 'student') {
        processedData.cgpa = isNaN(numericCgpa) ? 0 : numericCgpa;
        processedData.department = department || 'NA';
      }
      
      // Update profile with processed data
      const updatedUserData = await updateProfile(processedData);
      
      // Update local user data
      if (updateUser) {
        updateUser({
          ...updatedUser,
          ...updatedUserData
        });
      }
      
      setIsFirstTimeSetup(false);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], value }
    }));
  };

  const handleFileFieldChange = (field: string, file: File) => {
    // Create a preview URL if it's an image
    let previewUrl = '';
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: {
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        value: file,
        previewUrl
      } as any
    }));
  };

  const handleAddField = () => {
    if (newField.trim()) {
      if (newFieldType === 'text' && !newValue.trim()) {
        setMessage({ text: 'Please enter a value for the text field', type: 'error' });
        return;
      }
      
      if ((newFieldType === 'image' || newFieldType === 'pdf') && !selectedFile) {
        setMessage({ text: 'Please select a file', type: 'error' });
        return;
      }
      
      if (newFieldType === 'text') {
        setFormData(prev => ({
          ...prev,
          [newField]: { type: 'text', value: newValue }
        }));
      } else {
        if (selectedFile) {
          setFormData(prev => ({
            ...prev,
            [newField]: { type: newFieldType, value: selectedFile }
          }));
        }
      }
      
      // Reset field values
      setNewField('');
      setNewValue('');
      setNewFieldType('text');
      setSelectedFile(null);
    }
  };

  const handleDeleteField = (field: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      delete newData[field];
      return newData;
    });
  };

  const renderFieldValue = (field: string, fieldData: ProfileField) => {
    if (fieldData.type === 'text') {
      return (
        <TextField
          fullWidth
          label={field}
          value={fieldData.value}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      );
    } else if (fieldData.type === 'image') {
      // For images, show a preview and an option to change
      const previewUrl = 
        fieldData.value instanceof File 
          ? URL.createObjectURL(fieldData.value)
          : fieldData.value as string;
      
      return (
        <Card>
          <CardMedia
            component="img"
            height="140"
            image={previewUrl}
            alt={field}
            sx={{ objectFit: 'contain' }}
          />
          <CardContent>
            <Typography variant="subtitle2">{field}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                size="small"
              >
                Change
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileFieldChange(field, e.target.files[0]);
                    }
                  }}
                />
              </Button>
            </Box>
          </CardContent>
        </Card>
      );
    } else if (fieldData.type === 'pdf') {
      // For PDFs, show filename or link and option to change
      const fileName = 
        fieldData.value instanceof File 
          ? fieldData.value.name
          : fieldData.value.toString().split('/').pop() || 'PDF Document';
      
      const fileUrl = 
        fieldData.value instanceof File 
          ? undefined 
          : fieldData.value as string;
      
      return (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PictureAsPdfIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">{field}: </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              {fileUrl ? (
                <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
                  {fileName}
                </Link>
              ) : (
                <Typography variant="body2">{fileName}</Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                size="small"
              >
                Change
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileFieldChange(field, e.target.files[0]);
                    }
                  }}
                />
              </Button>
            </Box>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isFirstTimeSetup ? 'Complete Your Profile' : 'My Profile'}
        </Typography>
        
        {isFirstTimeSetup && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Welcome! Please complete your profile information. Your CGPA and department are required to apply for jobs.
          </Alert>
        )}
        
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleUpdateProfile}>
          <Grid container spacing={3}>
            
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            {/* Profile Image */}
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                src={profileImagePreview} 
                sx={{ width: 100, height: 100, mb: 2 }}
              >
                {user?.name ? user.name.charAt(0) : ''}
              </Avatar>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoIcon />}
                size="small"
              >
                Upload Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    disabled
                    label="Name"
                    value={user?.name || ''}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    disabled
                    label="Email"
                    value={user?.email || ''}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    disabled
                    label="Role"
                    value={user?.role || ''}
                  />
                </Grid>
                
                {/* Resume Upload */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Resume / CV
                    </Typography>
                    {resumePreview ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <InsertDriveFileIcon sx={{ mr: 1 }} />
                        {user?.resumeUrl ? (
                          <Link href={user.resumeUrl} target="_blank" rel="noopener noreferrer">
                            {resumePreview}
                          </Link>
                        ) : (
                          <Typography variant="body2">{resumePreview}</Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        No resume uploaded
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      size="small"
                      fullWidth
                    >
                      Upload Resume
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                      />
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Academic Information Section for Students */}
            {user?.role === 'student' && (
              <>
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Academic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                {/* CGPA Field */}
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="CGPA (0-10)"
                    value={cgpa}
                    onChange={handleCgpaChange}
                    type="number"
                    inputProps={{ min: 0, max: 10, step: 0.01 }}
                    error={!cgpa.trim()}
                    helperText={!cgpa.trim() ? 'CGPA is required' : ''}
                  />
                </Grid>
                
                {/* Department Field */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!department}>
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                      labelId="department-label"
                      value={department}
                      label="Department"
                      onChange={handleDepartmentChange}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </Select>
                    {!department && (
                      <Typography variant="caption" color="error">
                        Department is required
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Profile Fields
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                These fields are used when applying for jobs. Make sure to complete all required fields.
              </Typography>
            </Grid>

            {/* Existing Profile Fields */}
            {Object.entries(formData).map(([field, fieldData]) => (
              <Grid item xs={12} md={6} key={field}>
                <Box sx={{ position: 'relative' }}>
                  {renderFieldValue(field, fieldData)}
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteField(field)}
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Add New Field
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Field Name"
                placeholder="e.g. Skills, Education, etc."
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="field-type-label">Field Type</InputLabel>
                <Select
                  labelId="field-type-label"
                  value={newFieldType}
                  label="Field Type"
                  onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="pdf">PDF Document</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              {newFieldType === 'text' ? (
                <TextField
                  fullWidth
                  label="Field Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  component="label"
                  startIcon={newFieldType === 'image' ? <PhotoIcon /> : <PictureAsPdfIcon />}
                  sx={{ height: '56px' }}
                >
                  {selectedFile ? selectedFile.name : `Upload ${newFieldType === 'image' ? 'Image' : 'PDF'}`}
                  <input
                    type="file"
                    hidden
                    accept={newFieldType === 'image' ? 'image/*' : 'application/pdf'}
                    onChange={handleFileChange}
                  />
                </Button>
              )}
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddField}
                sx={{ height: '56px' }}
              >
                Add
              </Button>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 