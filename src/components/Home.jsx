import React from 'react';
import { Box, Typography } from '@mui/material';

const UserAccount = () => {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            width="100%"
        >
            <Typography variant="h4" component="h1">
                Logged!
            </Typography>
        </Box>
    );
};

export default UserAccount;
