import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TextField, Checkbox, FormControlLabel, Box } from '@mui/material';

// Usamos forwardRef e useImperativeHandle para expor um método 'getFormData'
// que o componente pai (SearchConfigs) poderá chamar para obter os dados do formulário.
const SearchConfigForm = forwardRef(({ initialData }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [frequencyDays, setFrequencyDays] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Efeito para popular o formulário quando `initialData` muda (modo de edição)
    // ou resetar quando `initialData` é nulo (modo de criação)
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

    // Expondo uma função para o componente pai obter os dados do formulário
    useImperativeHandle(ref, () => ({
        getFormData: () => ({
            search_term: searchTerm,
            frequency_days: parseInt(frequencyDays) || 0, // Garante que seja número
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
