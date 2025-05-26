import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TextField, Checkbox, FormControlLabel, Box } from '@mui/material';

const SearchConfigForm = forwardRef(({ initialData }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [frequencyDays, setFrequencyDays] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (initialData) {
            setSearchTerm(initialData.search_term || '');
            setFrequencyDays(initialData.frequency_days || '');
            setPreferredTime(initialData.preferred_time || '');
            setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);
        } else {
            setSearchTerm('');
            setFrequencyDays('');
            setPreferredTime('');
            setIsActive(true);
        }
    }, [initialData]);

    useImperativeHandle(ref, () => ({
        getFormData: () => ({
            search_term: searchTerm,
            frequency_days: parseInt(frequencyDays) || 0,
            preferred_time: preferredTime,
            is_active: isActive,
        })
    }));

    return (
        <Box component="form" noValidate autoComplete="off">
            <TextField
                autoFocus
                margin="dense"
                id="search-term"
                label="Search Term"
                type="text"
                fullWidth
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <TextField
                margin="dense"
                id="frequency-days"
                label="Frequency (days)"
                type="number"
                fullWidth
                variant="outlined"
                value={frequencyDays}
                onChange={(e) => setFrequencyDays(e.target.value)}
            />
            <TextField
                margin="dense"
                id="preferred-time"
                label="Preferred Time (HH:MM)"
                type="text"
                fullWidth
                variant="outlined"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
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

export default SearchConfigForm;
