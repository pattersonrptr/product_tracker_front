import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const ConfirmationDialog = ({ open, title, message, onConfirm, onCancel }) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="primary">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
