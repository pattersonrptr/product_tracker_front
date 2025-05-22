import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';

const SourceWebsiteModal = ({ open, onClose, onSave, currentWebsite }) => {
    const [name, setName] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (currentWebsite) {
            setName(currentWebsite.name || '');
            setBaseUrl(currentWebsite.base_url || '');
            setIsActive(currentWebsite.is_active !== undefined ? currentWebsite.is_active : true);
        } else {
            setName('');
            setBaseUrl('');
            setIsActive(true);
        }
    }, [open, currentWebsite]);

    const handleSave = () => {
        onSave({ name, base_url: baseUrl, is_active: isActive });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{currentWebsite ? "Edit Website" : "Register New Website"}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="base_url"
                    label="Base URL"
                    type="url"
                    fullWidth
                    variant="outlined"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                    }
                    label="Active"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SourceWebsiteModal;
