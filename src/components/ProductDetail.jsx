import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert, Link as MuiLink } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import { useSnackbar } from 'notistack';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const productResponse = await axiosInstance.get(`/products/${productId}`);
                setProduct(productResponse.data);

                const historyResponse = await axiosInstance.get(`/price_history/product/${productId}`);
                const formattedPriceHistory = historyResponse.data
                    .map(item => ({
                        ...item,
                        price: parseFloat(item.price),
                        created_at_formatted: new Date(item.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        }),
                        created_at_full: new Date(item.created_at).toLocaleString('pt-BR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                        }),
                    }))
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                
                setPriceHistory(formattedPriceHistory);

            } catch (err) {
                console.error("Failed to fetch product details or price history:", err);
                setError("Failed to load product details. Please try again.");
                enqueueSnackbar("Failed to load product details.", { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductDetails();
        }
    }, [productId, enqueueSnackbar]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">Product not found.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Product Details
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {product.title}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <Typography component="span" fontWeight="bold">ID:</Typography> {product.id}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <Typography component="span" fontWeight="bold">Description:</Typography> {product.description || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <Typography component="span" fontWeight="bold">Current Price:</Typography> R$ {product.current_price ? parseFloat(product.current_price).toFixed(2) : 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <Typography component="span" fontWeight="bold">Location:</Typography> {product.city}, {product.state}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <Typography component="span" fontWeight="bold">Condition:</Typography> {product.condition}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <Typography component="span" fontWeight="bold">Available:</Typography> {product.is_available ? 'Yes' : 'No'}
                </Typography>
                {product.url && (
                    <Typography variant="body1" gutterBottom>
                        <Typography component="span" fontWeight="bold">Source URL:</Typography>{' '}
                        <MuiLink href={product.url} target="_blank" rel="noopener">
                            {product.url}
                        </MuiLink>
                    </Typography>
                )}
                {product.image_urls && (
                    <Box mt={2}>
                        <img src={product.image_urls.split(',')[0]} alt={product.title} style={{ maxWidth: '300px', height: 'auto', borderRadius: '8px' }} />
                    </Box>
                )}
            </Paper>

            <Typography variant="h5" gutterBottom>
                Price History
            </Typography>
            <Paper sx={{ p: 3 }}>
                {priceHistory.length > 0 ? (
                    <Box sx={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={priceHistory}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="created_at_formatted" />
                                <YAxis domain={['dataMin', 'dataMax']} tickFormatter={(value) => `R$ ${value.toFixed(2)}`} />
                                <Tooltip
                                    formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Price']}
                                    labelFormatter={(label, payload) => {
                                        const dataItem = payload && payload.length > 0 ? payload[0].payload : null;
                                        return dataItem ? `Date: ${dataItem.created_at_full}` : `Date: ${label}`;
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <Typography variant="h6" mt={3} mb={1}>Raw Price Data:</Typography>
                        <ul>
                            {priceHistory.map((historyItem, index) => (
                                <li key={index}>
                                    R$ {historyItem.price.toFixed(2)} on {new Date(historyItem.created_at).toLocaleString('pt-BR')}
                                </li>
                            ))}
                        </ul>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No price history available for this product.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default ProductDetail;
