import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    TextField,
    Checkbox,
    FormControlLabel,
    Box,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import axiosInstance from '../api/axiosConfig';

const ProductForm = forwardRef(({ initialData }, ref) => {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [sourceWebsiteId, setSourceWebsiteId] = useState('');
    const [description, setDescription] = useState('');
    const [sourceProductCode, setSourceProductCode] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [condition, setCondition] = useState('');
    const [sellerName, setSellerName] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [imageUrls, setImageUrls] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');

    const [sourceWebsites, setSourceWebsites] = useState([]);

    useEffect(() => {
        if (initialData) {
            setUrl(initialData.url || '');
            setTitle(initialData.title || '');
            setSourceWebsiteId(initialData.source_website_id || '');
            setDescription(initialData.description || '');
            setSourceProductCode(initialData.source_product_code || '');
            setCity(initialData.city || '');
            setState(initialData.state || '');
            setCondition(initialData.condition || '');
            setSellerName(initialData.seller_name || '');
            setIsAvailable(initialData.is_available !== undefined ? initialData.is_available : true);
            setImageUrls(initialData.image_urls || '');
            setCurrentPrice(initialData.current_price !== undefined ? initialData.current_price : '');
        } else {
            setUrl('');
            setTitle('');
            setSourceWebsiteId('');
            setDescription('');
            setSourceProductCode('');
            setCity('');
            setState('');
            setCondition('');
            setSellerName('');
            setIsAvailable(true);
            setImageUrls('');
            setCurrentPrice('');
        }
    }, [initialData]);

    useEffect(() => {
        const fetchSourceWebsites = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axiosInstance.get('/source_websites/?page_size=100', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setSourceWebsites(response.data.items);
            } catch (error) {
                console.error('Error fetching source websites for product form:', error);
            }
        };
        fetchSourceWebsites();
    }, []);

    useImperativeHandle(ref, () => ({
        getFormData: () => ({
            url: url,
            title: title,
            source_website_id: parseInt(sourceWebsiteId),
            description: description || null,
            source_product_code: sourceProductCode || null,
            city: city || null,
            state: state || null,
            condition: condition || null,
            seller_name: sellerName || null,
            is_available: isAvailable,
            image_urls: imageUrls || null,
            current_price: parseFloat(currentPrice) || null,
        })
    }));

    return (
        <Box component="form" noValidate autoComplete="off">
            <TextField
                autoFocus
                margin="dense"
                id="title"
                label="Product Title"
                type="text"
                fullWidth
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <TextField
                margin="dense"
                id="url"
                label="Product URL"
                type="url"
                fullWidth
                variant="outlined"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
            />
            <FormControl fullWidth margin="dense" variant="outlined" required>
                <InputLabel id="source-website-label">Source Website</InputLabel>
                <Select
                    labelId="source-website-label"
                    id="source_website_id"
                    value={sourceWebsiteId}
                    label="Source Website"
                    onChange={(e) => setSourceWebsiteId(e.target.value)}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {sourceWebsites.map((website) => (
                        <MenuItem key={website.id} value={website.id}>
                            {website.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                margin="dense"
                id="description"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
                margin="dense"
                id="source_product_code"
                label="Source Product Code"
                type="text"
                fullWidth
                variant="outlined"
                value={sourceProductCode}
                onChange={(e) => setSourceProductCode(e.target.value)}
            />
            <TextField
                margin="dense"
                id="city"
                label="City"
                type="text"
                fullWidth
                variant="outlined"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <TextField
                margin="dense"
                id="state"
                label="State"
                type="text"
                fullWidth
                variant="outlined"
                value={state}
                onChange={(e) => setState(e.target.value)}
            />
            <TextField
                margin="dense"
                id="condition"
                label="Condition"
                type="text"
                fullWidth
                variant="outlined"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
            />
            <TextField
                margin="dense"
                id="seller_name"
                label="Seller Name"
                type="text"
                fullWidth
                variant="outlined"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
            />
            <TextField
                margin="dense"
                id="image_urls"
                label="Image URLs (comma separated)"
                type="text"
                fullWidth
                variant="outlined"
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
            />
            <TextField
                margin="dense"
                id="current_price"
                label="Current Price"
                type="number"
                fullWidth
                variant="outlined"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                    />
                }
                label="Is Available"
            />
        </Box>
    );
});

export default ProductForm;
