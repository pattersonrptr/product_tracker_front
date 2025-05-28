import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const PageHeader = ({ title, subtitle, divider = true }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
          {subtitle}
        </Typography>
      )}
      {divider && <Divider sx={{ my: 2 }} />}
    </Box>
  );
};

export default PageHeader;
