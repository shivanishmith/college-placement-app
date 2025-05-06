import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyPlacementData } from '../../services/statisticsService';

interface PlacementTrendChartProps {
  data: MonthlyPlacementData[];
  title: string;
}

const PlacementTrendChart: React.FC<PlacementTrendChartProps> = ({ data, title }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} Placements`, 'Count']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="placements"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlacementTrendChart; 