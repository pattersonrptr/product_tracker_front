import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f0f0f0',
        py: 1,
        textAlign: 'center',
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100%',
        zIndex: 9999,
      }}
    >
      <Typography variant="body2" color="textSecondary">
        &copy; 2025 Product Tracker
      </Typography>
    </Box>
  );
};

export default Footer;
