import React from 'react';
import { Card, CardContent, Typography, Box, SvgIconProps } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<SvgIconProps>;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: '8px',
              backgroundColor: `${color}20`, // 20% opacity
              color: color
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard; 