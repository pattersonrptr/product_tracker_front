import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../components/ConfirmationDialog';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
        enqueueSnackbar('You have been logged out.', { variant: 'info' });
    };

    const handleSessionExpired = (message = 'Your session has expired. Please log in again.') => {
        if (isSessionExpiredModalOpen) {
            return;
        }

        localStorage.removeItem('token');
        setToken(null);
        enqueueSnackbar(message, { variant: 'error' });
        setIsSessionExpiredModalOpen(true);
    };

    useEffect(() => {
        if (token && isSessionExpiredModalOpen) {
            setIsSessionExpiredModalOpen(false);
        }

    }, [token, isSessionExpiredModalOpen]);

    const SessionExpiredModal = ({ open, onClose, onConfirm }) => (
        <ConfirmationDialog
            open={open}
            onCancel={onClose}
            onConfirm={onConfirm}
            title="Session Expired"
            message="Your session has expired due to inactivity or invalidity. Please log in again to continue."
        />
    );


    return (
        <AuthContext.Provider value={{ token, login, logout, handleSessionExpired, isSessionExpiredModalOpen }}>
            {children}
            <SessionExpiredModal
                open={isSessionExpiredModalOpen}
                onClose={() => {
                    setIsSessionExpiredModalOpen(false);
                    navigate('/login');
                }}
                onConfirm={() => {
                    setIsSessionExpiredModalOpen(false);
                    navigate('/login');
                }}
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
