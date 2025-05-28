import React from 'react';
import { Box } from '@mui/material';

const Main = ({ children }) => (
  <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
    {children}
  </Box>
);

export default Main;
