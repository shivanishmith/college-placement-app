import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  AssignmentInd as RoleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setRole(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password should be at least 6 characters long');
      return;
    }

    try {
      await register(name, email, password, role);
      navigate('/login', { state: { message: 'Registration successful. Please login.' } });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(to right, #e3f2fd, #fff)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={600}>
              Register
            </Typography>

            {(localError || authError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {localError || authError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={role}
                  label="Role"
                  onChange={handleRoleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <RoleIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                </Select>
              </FormControl>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    backgroundColor: '#1976d2',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#115293',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Register
                </Button>
              </motion.div>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                    Login here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Register;
