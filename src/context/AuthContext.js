import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { setTokenRemovedCallback, setAuthTokenUpdatedCallback } from '../api/axiosConfig';

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

    const logout = useCallback(() => {
        console.log("AuthContext: Performing logout.");
        localStorage.removeItem('token');
        setToken(null);
        // Notifies axiosConfig that the token has been removed
        if (setTokenRemovedCallback) {
            setTokenRemovedCallback();
        }
        navigate('/login');
        enqueueSnackbar('You have been logged out.', { variant: 'info' });
    }, [navigate, enqueueSnackbar]);

    const handleSessionExpired = useCallback((message = 'Your session has expired. Please log in again.') => {
        if (isSessionExpiredModalOpen) {
            return;
        }

        console.log("AuthContext: handleSessionExpired called with message:", message);
        localStorage.removeItem('token');
        setToken(null);
        // Notifies axiosConfig that the token has been removed
        if (setTokenRemovedCallback) {
            setTokenRemovedCallback();
        }
        enqueueSnackbar(message, { variant: 'error' });
        setIsSessionExpiredModalOpen(true);
    }, [isSessionExpiredModalOpen, enqueueSnackbar]);

    const setNewTokenFromRefresh = useCallback((newToken) => {
        console.log("AuthContext: setNewTokenFromRefresh called. Updating state.");
        setToken(newToken);
    }, []);

    useEffect(() => {
        setTokenRemovedCallback(logout);
        setAuthTokenUpdatedCallback(setNewTokenFromRefresh);

        if (token && isSessionExpiredModalOpen) {
            setIsSessionExpiredModalOpen(false);
        }

    }, [token, isSessionExpiredModalOpen, logout, setNewTokenFromRefresh]);

    const SessionExpiredModal = ({ open, onClose, onConfirm }) => (
        <ConfirmationDialog
            open={open}
            onClose={onClose}
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
