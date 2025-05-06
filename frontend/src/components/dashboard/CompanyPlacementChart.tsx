import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CompanyData } from '../../services/statisticsService';

interface CompanyPlacementChartProps {
  data: CompanyData[];
  title: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

// Custom tooltip formatter
const CustomTooltip = ({ active, payload, totalPlacements }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = data.value;
    const percent = ((value / totalPlacements) * 100).toFixed(1);
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <p style={{ margin: 0 }}>{`${data.name}: ${value} placements`}</p>
        <p style={{ margin: 0 }}>{`${percent}% of total`}</p>
      </div>
    );
  }
  return null;
};

const CompanyPlacementChart: React.FC<CompanyPlacementChartProps> = ({ data, title }) => {
  const totalPlacements = data.reduce((sum, item) => sum + item.placements, 0);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="placements"
                nameKey="company"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip totalPlacements={totalPlacements} />} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CompanyPlacementChart; 