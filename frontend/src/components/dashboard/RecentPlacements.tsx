import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import { PlacementData } from '../../services/statisticsService';

interface RecentPlacementsProps {
  data: PlacementData[];
  title: string;
}

const RecentPlacements: React.FC<RecentPlacementsProps> = ({ data, title }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <List sx={{ width: '100%', overflow: 'auto', maxHeight: 400 }}>
          {data.map((placement, index) => (
            <React.Fragment key={placement.id}>
              <ListItem alignItems="flex-start">
                <Box sx={{ mr: 2 }}>
                  <Avatar sx={{ bgcolor: '#3f51b5' }}>
                    <WorkIcon />
                  </Avatar>
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle1" component="span">
                        {placement.studentName}
                      </Typography>
                      <Chip
                        label={placement.package}
                        size="small"
                        sx={{ fontWeight: 'bold', backgroundColor: '#4caf50', color: 'white' }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {placement.role} at {placement.company}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Placed on {formatDate(placement.date)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < data.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentPlacements; 