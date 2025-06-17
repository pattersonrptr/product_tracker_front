import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useSnackbar } from 'notistack';

const useProductDetails = (productId) => {
    const [product, setProduct] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const fetchProductDetails = useCallback(async () => {
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
    }, [productId, enqueueSnackbar]);

    useEffect(() => {
        if (productId) {
            fetchProductDetails();
        }
    }, [productId, fetchProductDetails]);

    return { product, priceHistory, loading, error, fetchProductDetails };
};

export default useProductDetails;
