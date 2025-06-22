import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import logo from '../assets/logo-product-tracker-1.png'

const Header = ({ onLogout, isLoggedIn }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAccountClick = () => {
        navigate('/account');
        handleClose();
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundImage: 'linear-gradient(to right, #3f51b5, #3f51b5, #5c6bc0)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            }}
        >
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                    <img
                        src={logo}
                        alt="Product Tracker Logo"
                        style={{ height: '60px', marginRight: '10px' }}
                    />
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            color: '#ffffff',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        Product Tracker
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {isLoggedIn && (
                    <Box>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleAccountClick}>Account</MenuItem>
                            <MenuItem onClick={onLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
