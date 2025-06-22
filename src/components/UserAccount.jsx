import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Chip,
    Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';
import UserEditForm from './UserEditForm';
import { jwtDecode } from 'jwt-decode';
import GenericFormModal from './GenericFormModal';

const UserAccount = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { logout } = useAuth();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const editFormRef = useRef(null);

    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUsernameFromToken, setCurrentUsernameFromToken] = useState(null);

    useEffect(() => {
        const initializeUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                logout();
                return;
            }

            let usernameFromToken = null;
            let userIdFromToken = null;
            try {
                const decoded = jwtDecode(token);
                usernameFromToken = decoded.sub;
                userIdFromToken = decoded.user_id;
                setCurrentUsernameFromToken(usernameFromToken);

                if (userIdFromToken) {
                    setCurrentUserId(userIdFromToken);
                }
            } catch (e) {
                console.error("Failed to decode token on init for UserAccount:", e);
                enqueueSnackbar('Invalid token. Please log in again.', { variant: 'error' });
                logout();
                return;
            }

            let userObjFromLocalStorage = null;
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    userObjFromLocalStorage = JSON.parse(userStr);

                    if (userObjFromLocalStorage &&
                       ( (userIdFromToken && userObjFromLocalStorage.id === userIdFromToken) ||
                         (!userIdFromToken && userObjFromLocalStorage.username === usernameFromToken) )
                       )
                    {
                        setUser(userObjFromLocalStorage);
                        setCurrentUserId(userObjFromLocalStorage.id);
                        setLoading(false);
                        return;
                    } else {
                        localStorage.removeItem('user');
                        console.log("LocalStorage user data mismatch or incomplete, will refetch.");
                    }
                }
            } catch (e) {
                console.error("Failed to parse user from localStorage on init:", e);
                localStorage.removeItem('user');
            }


            if (usernameFromToken) {
                setLoading(true);
                try {
                    const resp = await axiosInstance.get(`/users/username/${usernameFromToken}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const fetchedUser = resp.data;
                    setCurrentUserId(fetchedUser.id);
                    setUser(fetchedUser);
                    localStorage.setItem('user', JSON.stringify(fetchedUser));
                } catch (error) {
                    console.error('Error fetching user data by username:', error);
                    enqueueSnackbar('Failed to fetch user data. Please log in again.', { variant: 'error' });
                    logout();
                } finally {
                    setLoading(false);
                }
            } else {
                enqueueSnackbar('Username not found in token. Please log in again.', { variant: 'error' });
                setLoading(false);
                logout();
            }
        };

        initializeUserData();
    }, [enqueueSnackbar, logout]);

    const refreshUser = useCallback(async () => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await axiosInstance.get(`/users/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUser(resp.data);
            localStorage.setItem('user', JSON.stringify(resp.data));
        } catch (err) {
            console.error('Failed to refresh user data:', err);
            enqueueSnackbar('Failed to refresh user data.', { variant: 'error' });
            setUser(null);
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [currentUserId, enqueueSnackbar, logout]);


    const handleOpenEdit = () => setEditModalOpen(true);
    const handleCloseEdit = () => setEditModalOpen(false);

    const handleSaveEditConfirmation = () => {
        if (!editFormRef.current) {
            enqueueSnackbar('Form reference not available.', { variant: 'error' });
            return;
        }
        if (!editFormRef.current.validateForm()) {
            enqueueSnackbar('Please correct the form errors before updating.', { variant: 'error' });
            return;
        }
        setIsConfirmDialogOpen(true);
    };

    const handleCancelConfirmDialog = () => {
        setIsConfirmDialogOpen(false);
    };

    const handleConfirmUpdate = async () => {
        setIsConfirmDialogOpen(false);
        if (!editFormRef.current || !currentUserId) return;

        const formData = editFormRef.current.getFormData();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await axiosInstance.put(`/users/${currentUserId}`, formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            setUser(resp.data);
            localStorage.setItem('user', JSON.stringify(resp.data));

            enqueueSnackbar('User updated successfully!', { variant: 'success' });
            setEditModalOpen(false);
        } catch (err) {
            console.error('Error updating user:', err);
            let msg = 'Error updating user.';
            if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === 'string') {
                    msg = err.response.data.detail;
                } else if (Array.isArray(err.response.data.detail)) {
                    msg = err.response.data.detail.map(d => d.msg || d.loc.join('.') + ' error').join(' | ');
                }
            }
            enqueueSnackbar(msg, { variant: 'error' });
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 170px)">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    User data not available. Please log in again.
                </Typography>
                <Button onClick={logout} variant="contained" sx={{ mt: 2 }}>Go to Login</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3, borderRadius: 2, boxShadow: 2, bgcolor: 'background.paper' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" gutterBottom>User Account</Typography>
                <Button variant="contained" startIcon={<EditIcon />} onClick={handleOpenEdit}>
                    Edit
                </Button>
            </Box>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="subtitle2">Username</Typography>
                    <Typography>{user.username}</Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle2">Email</Typography>
                    <Typography>{user.email}</Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle2">Status</Typography>
                    <Chip label={user.is_active ? 'Active' : 'Inactive'} color={user.is_active ? 'success' : 'default'} size="small" />
                </Box>
            </Stack>

            <GenericFormModal
                open={editModalOpen}
                onClose={handleCloseEdit}
                onSave={handleSaveEditConfirmation}
                title="Edit User"
                isSaving={isSaving}
            >
                <UserEditForm initialData={user} ref={editFormRef} />
            </GenericFormModal>

            <ConfirmationDialog
                open={isConfirmDialogOpen}
                onCancel={handleCancelConfirmDialog}
                onConfirm={handleConfirmUpdate}
                title="Confirm Account Update"
                message="Are you sure you want to update your account details?"
            />
        </Box>
    );
};

export default UserAccount;
