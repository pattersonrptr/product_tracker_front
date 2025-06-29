import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TextField, Checkbox, FormControlLabel, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import InputMask from 'react-input-mask';

const SearchConfigForm = forwardRef(({ initialData }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [frequencyDays, setFrequencyDays] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [sourceWebsites, setSourceWebsites] = useState([]);
    const [availableWebsites, setAvailableWebsites] = useState([]);
    const [userId, setUserId] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchWebsites = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axiosInstance.get('/source_websites/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAvailableWebsites(response.data.items || []);
            } catch (err) {
                setAvailableWebsites([]);
            }
        };
        fetchWebsites();

        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                setUserId(parsed.id);
            } catch {
                setUserId(null);
            }
        }
    }, []);

    useEffect(() => {
        if (initialData) {
            setSearchTerm(initialData.search_term || '');
            setFrequencyDays(initialData.frequency_days || '');
            setPreferredTime(initialData.preferred_time || '');
            setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);

            let sw = initialData.source_websites || [];
            if (sw.length > 0 && typeof sw[0] === 'object' && sw[0] !== null) {
                sw = sw.map(w => w.id);
            }
            setSourceWebsites(sw);

            setUserId(initialData.user_id || userId);
        } else {
            setSearchTerm('');
            setFrequencyDays('');
            setPreferredTime('');
            setIsActive(true);
            setSourceWebsites([]);
        }
    }, [initialData]);

    const validate = () => {
        const newErrors = {};

        if (!frequencyDays || isNaN(frequencyDays) || parseInt(frequencyDays) <= 0) {
            newErrors.frequencyDays = 'Enter a positive number';
        }

        {/* Validate HH:MM:SS format */}
        if (
            !preferredTime ||
            !/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(preferredTime)
        ) {
            newErrors.preferredTime = 'Enter a valid time (HH:MM:SS)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useImperativeHandle(ref, () => ({
        getFormData: () => {
            if (!validate()) return null;
            return {
                search_term: searchTerm,
                frequency_days: parseInt(frequencyDays) || 0,
                preferred_time: preferredTime,
                is_active: isActive,
                source_websites: sourceWebsites,
                user_id: userId,
            };
        }
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
                error={!!errors.frequencyDays}
                helperText={errors.frequencyDays}
                inputProps={{ min: 1 }}
            />
            {/* Use InputMask for preferred time input */}
            <InputMask
                mask="99:99:99"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                maskChar="_"
            >
                {(inputProps) => (
                    <TextField
                        margin="dense"
                        id="preferred-time"
                        label="Preferred Time (HH:MM:SS)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        error={!!errors.preferredTime}
                        helperText={errors.preferredTime}
                        placeholder="Ex: 08:30:00"
                        {...inputProps}
                    />
                )}
            </InputMask>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                }
                label="Active"
            />
            <FormControl fullWidth margin="dense">
                <InputLabel id="source-websites-label">Source Websites</InputLabel>
                <Select
                    labelId="source-websites-label"
                    id="source-websites"
                    multiple
                    value={sourceWebsites}
                    onChange={(e) => setSourceWebsites(e.target.value)}
                    input={<OutlinedInput label="Source Websites" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((id) => {
                                const site = availableWebsites.find(w => w.id === id);
                                return <Chip key={id} label={site ? site.name : id} />;
                            })}
                        </Box>
                    )}
                >
                    {availableWebsites.map((website) => (
                        <MenuItem key={website.id} value={website.id}>
                            {website.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
});

export default SearchConfigForm;
