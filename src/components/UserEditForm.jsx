import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, TextField, Checkbox, FormControlLabel, Grid, Stack } from '@mui/material';

const UserEditForm = forwardRef(({ initialData }, ref) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState('');
    const [passwordLengthError, setPasswordLengthError] = useState('');
    const [currentPasswordRequiredError, setCurrentPasswordRequiredError] = useState('');

    useEffect(() => {
        if (initialData) {
            setUsername(initialData.username || '');
            setEmail(initialData.email || '');
            setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setPasswordMatchError('');
            setPasswordLengthError('');
            setCurrentPasswordRequiredError('');
        }
    }, [initialData]);

    useEffect(() => {
        if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
            setPasswordMatchError('New passwords do not match.');
        } else {
            setPasswordMatchError('');
        }

        if (newPassword && newPassword.length > 0 && newPassword.length < 6) {
            setPasswordLengthError('New password must be at least 6 characters long.');
        } else {
            setPasswordLengthError('');
        }

        if (newPassword && newPassword.length > 0 && !currentPassword) {
            setCurrentPasswordRequiredError('Current password is required to change password.');
        } else {
            setCurrentPasswordRequiredError('');
        }
    }, [newPassword, confirmNewPassword, currentPassword]);


    useImperativeHandle(ref, () => ({
        getFormData: () => {
            const data = {
                username,
                email,
                is_active: isActive,
            };

            if (newPassword) {
                data.current_password = currentPassword;
                data.new_password = newPassword;
            }
            return data;
        },
        validateForm: () => {
            let isValid = true;
            if (!username.trim() || !email.trim()) {
                isValid = false;
            }

            if (newPassword) {
                if (!currentPassword.trim()) {
                    setCurrentPasswordRequiredError('Current password is required to change password.');
                    isValid = false;
                } else {
                    setCurrentPasswordRequiredError('');
                }
                if (newPassword !== confirmNewPassword) {
                    setPasswordMatchError('New passwords do not match.');
                    isValid = false;
                } else {
                    setPasswordMatchError('');
                }
                if (newPassword.length < 6) {
                    setPasswordLengthError('New password must be at least 6 characters long.');
                    isValid = false;
                } else {
                    setPasswordLengthError('');
                }
            } else {
                setPasswordMatchError('');
                setPasswordLengthError('');
                setCurrentPasswordRequiredError('');
            }

            return isValid;
        }
    }));

    return (
        <Box component="form" noValidate autoComplete="off">
            <Stack spacing={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Active Account"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Change Password (optional)</Typography>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Current Password"
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            variant="outlined"
                            size="small"
                            error={!!currentPasswordRequiredError}
                            helperText={currentPasswordRequiredError || "Required if setting new password"}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            variant="outlined"
                            size="small"
                            error={!!passwordMatchError || !!passwordLengthError}
                            helperText={passwordMatchError || passwordLengthError || "Minimum 6 characters. Leave blank if you don't want to change password."}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Confirm New Password"
                            type="password"
                            value={confirmNewPassword}
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            variant="outlined"
                            size="small"
                            error={!!passwordMatchError}
                            helperText={passwordMatchError}
                        />
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
});

export default UserEditForm;
