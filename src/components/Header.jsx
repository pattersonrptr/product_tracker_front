import React from 'react';
import { Button, Box, Typography } from '@mui/material';

const Header = ({ username, onLogout }) => {
  return (
    <header style={{ backgroundColor: '#f0f0f0', padding: '10px 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h4" component="h1" sx={{ flex: 1, textAlign: 'center' }}>
        Product Tracker
      </Typography>
      {username && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Olá, <b>{username}</b>
          </Typography>
          <Button variant="outlined" color="error" onClick={onLogout}>
            Sair
          </Button>
        </Box>
      )}
    </header>
  );
};

export default Header;
