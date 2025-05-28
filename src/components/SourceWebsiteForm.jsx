import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TextField, Checkbox, FormControlLabel, Box } from '@mui/material';

const SourceWebsiteForm = forwardRef(({ initialData }, ref) => {
    const [name, setName] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setBaseUrl(initialData.base_url || '');
            setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);
        } else {
            setName('');
            setBaseUrl('');
            setIsActive(true);
        }
    }, [initialData]);

    useImperativeHandle(ref, () => ({
        getFormData: () => ({
            name: name,
            base_url: baseUrl,
            is_active: isActive,
        })
    }));

    return (
        <Box component="form" noValidate autoComplete="off">
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
        </Box>
    );
});

export default SourceWebsiteForm;
