import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { getAllStudents } from '../../services/studentService';
import { User } from '../../types/User';

const StudentsList: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getAllStudents();
        setStudents(data);
        setFilteredStudents(data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to fetch students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Student Profiles
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Search and view profiles of students in the system.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredStudents.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No students found
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredStudents.map((student, index) => (
                  <React.Fragment key={student._id}>
                    <ListItem 
                      button 
                      onClick={() => handleStudentClick(student._id)}
                      sx={{ 
                        transition: 'background-color 0.2s',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={student.imageUrl}>
                          {!student.imageUrl && <PersonIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={student.name} 
                        secondary={student.email} 
                      />
                    </ListItem>
                    {index < filteredStudents.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default StudentsList; 