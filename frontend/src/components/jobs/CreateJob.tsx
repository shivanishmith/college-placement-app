import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';

// Department options
const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'IT', 'MME', 'CIVIL', 'ALL'];

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [fieldInput, setFieldInput] = useState('');
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [minCGPA, setMinCGPA] = useState<number>(0);
  const [eligibleDepartments, setEligibleDepartments] = useState<string[]>(['ALL']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddField = () => {
    if (fieldInput.trim() && !requiredFields.includes(fieldInput.trim())) {
      setRequiredFields([...requiredFields, fieldInput.trim()]);
      setFieldInput('');
    }
  };

  const handleDeleteField = (fieldToDelete: string) => {
    setRequiredFields(requiredFields.filter(field => field !== fieldToDelete));
  };

  const handleDepartmentChange = (event: SelectChangeEvent<typeof eligibleDepartments>) => {
    const {
      target: { value },
    } = event;
    
    // Convert the value to an array if it's a string
    const valueArray: string[] = typeof value === 'string' ? value.split(',') : [...value];
    
    // If ALL is selected, only keep ALL
    if (valueArray.includes('ALL') && eligibleDepartments.indexOf('ALL') === -1) {
      setEligibleDepartments(['ALL']);
    } 
    // If a specific department is selected while ALL is already selected, remove ALL
    else if (valueArray.length > 1 && valueArray.includes('ALL') && eligibleDepartments.includes('ALL')) {
      setEligibleDepartments(valueArray.filter((dep: string) => dep !== 'ALL'));
    } 
    // Otherwise, set as selected
    else {
      setEligibleDepartments(valueArray);
    }
  };

  const handleCGPAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 10) {
      setMinCGPA(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !salary.trim() || !deadline || requiredFields.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/jobs', {
        title,
        description,
        salary,
        deadline,
        requiredFields,
        minCGPA,
        eligibleDepartments
      });
      
      setSuccess('Job created successfully!');
      setTimeout(() => {
        navigate('/jobs');
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create job. Please try again.');
      console.error('Error creating job:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Job
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $50,000 - $65,000"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Application Deadline"
                  value={deadline}
                  onChange={(newValue) => setDeadline(newValue)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Eligibility Criteria Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Eligibility Criteria
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Minimum CGPA Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum CGPA Required"
                type="number"
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                value={minCGPA}
                onChange={handleCGPAChange}
                helperText="Enter a value between 0 and 10 (0 means no minimum requirement)"
              />
            </Grid>

            {/* Eligible Departments Dropdown */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="eligible-departments-label">Eligible Departments</InputLabel>
                <Select
                  labelId="eligible-departments-label"
                  id="eligible-departments"
                  multiple
                  value={eligibleDepartments}
                  onChange={handleDepartmentChange}
                  input={<OutlinedInput label="Eligible Departments" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {departments.map((department) => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Required Profile Fields
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Add fields that students must have in their profile to apply for this job.
              </Typography>

              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Required Field"
                  value={fieldInput}
                  onChange={(e) => setFieldInput(e.target.value)}
                  placeholder="e.g. Skills, Education, etc."
                  sx={{ mr: 1 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleAddField}
                  sx={{ minWidth: '100px' }}
                >
                  Add
                </Button>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                {requiredFields.map((field) => (
                  <Chip
                    key={field}
                    label={field}
                    onDelete={() => handleDeleteField(field)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Create Job
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateJob; 