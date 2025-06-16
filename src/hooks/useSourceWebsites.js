import { useState, useEffect, useCallback } from 'react';
import apiService from '../api/apiService';
import { useSnackbar } from 'notistack';

const useSourceWebsites = (paginationModel, sortModel, filterModel) => {
    const [sourceWebsites, setSourceWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowCount, setRowCount] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    const fetchSourceWebsites = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};

            const offset = paginationModel.page * paginationModel.pageSize;
            const limit = paginationModel.pageSize;
            const queryParams = new URLSearchParams();
            queryParams.append('limit', limit);
            queryParams.append('offset', offset);

            if (sortModel.length > 0) {
                const sortItem = sortModel[0];
                queryParams.append('sort_by', sortItem.field);
                queryParams.append('sort_order', sortItem.sort);
            }

            filterModel.items.forEach(item => {
                if (item.value) {
                    params[`filter_${item.field}_value`] = item.value;
                    params[`filter_${item.field}_operator`] = item.operator;
                }
            });

            const response = await apiService.get(`/source_websites/?${queryParams.toString()}`, params);

            setSourceWebsites(response.items);
            setRowCount(response.total_count !== undefined && response.total_count !== null ? response.total_count : 0);
        } catch (err) {
            console.error('Error fetching source websites:', err);
            setError(err);
            enqueueSnackbar('Failed to fetch source websites.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, sortModel, filterModel, enqueueSnackbar]);

    useEffect(() => {
        fetchSourceWebsites();
    }, [fetchSourceWebsites]);

    return {
        sourceWebsites,
        loading,
        error,
        rowCount,
        fetchSourceWebsites
    };
};

export default useSourceWebsites;
