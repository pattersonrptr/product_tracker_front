import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const GenericFormModal = ({
    open,
    onClose,
    onSave,
    title,
    children,
    saveButtonText = "Save",
    cancelButtonText = "Cancel",
    isSaving = false
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSaving}>
                    {cancelButtonText}
                </Button>
                <Button onClick={onSave} disabled={isSaving} variant="contained" color="primary">
                    {isSaving ? 'Saving...' : saveButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GenericFormModal;
