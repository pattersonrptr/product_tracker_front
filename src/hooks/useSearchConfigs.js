import { useState, useEffect, useCallback } from 'react';
import apiService from '../api/apiService';
import { useSnackbar } from 'notistack';

const useSearchConfigs = (paginationModel, sortModel, filterModel) => {
    const [searchConfigs, setSearchConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowCount, setRowCount] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    const fetchSearchConfigs = useCallback(async () => {
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

            const response = await apiService.get(`/search_configs/?${queryParams.toString()}`, params);

            setSearchConfigs(response.items);
            setRowCount(response.total_count !== undefined && response.total_count !== null ? response.total_count : 0);
        } catch (err) {
            console.error('Error fetching search configs:', err);
            setError(err);
            enqueueSnackbar('Failed to fetch search configurations.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, sortModel, filterModel, enqueueSnackbar]);

    useEffect(() => {
        fetchSearchConfigs();
    }, [fetchSearchConfigs]);

    return {
        searchConfigs,
        loading,
        error,
        rowCount,
        fetchSearchConfigs
    };
};

export default useSearchConfigs;
