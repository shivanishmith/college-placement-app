// Login.tsx
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
  Fade,
  Slide,
} from '@mui/material';
import { styled, keyframes } from '@mui/system';

// Animations
const bubbleAnimation = keyframes`
  0% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(-40px); opacity: 0.5; }
  100% { transform: translateY(0); opacity: 0.7; }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-25px); }
  100% { transform: translateY(0); }
`;

const AnimatedPaper = styled(Paper)(() => ({
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  zIndex: 1,
}));

const StyledButton = styled(Button)(() => ({
  background: '#2980b9',
  color: '#fff',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '10px',
  marginTop: '1rem',
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: '#3498db',
  },
}));

const Bubble = styled('div')(() => ({
  position: 'absolute',
  backgroundColor: '#2980b9',
  borderRadius: '50%',
  animation: `${bubbleAnimation} 8s ease-in-out infinite`,
  opacity: 0.3,
}));

const Background = styled('div')(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: '#fff',
  zIndex: -1,
  overflow: 'hidden',
}));

const Icon = styled('span')<{ top: string; left: string; size: string; animationDelay?: string }>(
  ({ top, left, size, animationDelay }) => ({
    position: 'absolute',
    top,
    left,
    fontSize: size,
    animation: `${floatAnimation} 10s ease-in-out infinite`,
    animationDelay,
    opacity: 0.8,
  })
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setLocalError('Invalid credentials or server error.');
    }
  };

  return (
    <>
      <Background>
        {/* Animated background elements */}
        <Bubble style={{ left: '10%', top: '20%', width: '60px', height: '60px' }} />
        <Bubble style={{ left: '80%', top: '10%', width: '80px', height: '80px' }} />
        <Bubble style={{ left: '50%', top: '70%', width: '40px', height: '40px' }} />

        <Icon top="25%" left="15%" size="3rem">📚</Icon>
        <Icon top="45%" left="65%" size="3.5rem" animationDelay="1s">🧑‍🏫</Icon>
        <Icon top="70%" left="30%" size="4rem" animationDelay="2s">🎓</Icon>
        <Icon top="20%" left="80%" size="3rem" animationDelay="1.5s">✏️</Icon>
        <Icon top="60%" left="50%" size="2.8rem" animationDelay="3s">🧠</Icon>
        <Icon top="35%" left="40%" size="4rem" animationDelay="2.2s">📖</Icon>
        <Icon top="75%" left="80%" size="3rem" animationDelay="1.7s">🚀</Icon>
      </Background>

      <Container maxWidth="sm">
        <Box sx={{ mt: 10, mb: 4 }}>
          <Slide in timeout={1000} direction="up">
            <AnimatedPaper elevation={6}>
              <Typography variant="h4" align="center" color="#2980b9" gutterBottom>
                Login
              </Typography>

              {(localError || authError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {localError || authError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Fade in timeout={1000}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Fade>

                <Fade in timeout={1200}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Fade>

                <StyledButton type="submit" fullWidth>
                  Login
                </StyledButton>
              </Box>

              <Box mt={2} textAlign="center">
                <Typography variant="body2">
                  Don’t have an account? <Link to="/register">Sign up</Link>
                </Typography>
              </Box>
            </AnimatedPaper>
          </Slide>
        </Box>
      </Container>
    </>
  );
};

export default Login;
