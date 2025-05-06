import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BranchData } from '../../services/statisticsService';

interface BranchWisePlacementChartProps {
  data: BranchData[];
  title: string;
}

const BranchWisePlacementChart: React.FC<BranchWisePlacementChartProps> = ({ data, title }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} Placements`, 'Count']}
                labelFormatter={(label) => `Branch: ${label}`}
              />
              <Bar dataKey="placements" fill="#4caf50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BranchWisePlacementChart; 