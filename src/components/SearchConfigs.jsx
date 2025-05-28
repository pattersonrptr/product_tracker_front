import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    DataGrid,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridSeparatorIcon
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Button, Toolbar, Typography, Box } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import GenericFormModal from './GenericFormModal';
import SearchConfigForm from './SearchConfigForm';
import ConfirmationDialog from './ConfirmationDialog';
import { useSnackbar } from 'notistack';
import PageHeader from './PageHeader';

const SearchConfigs = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowSelection, setRowSelection] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentConfig, setCurrentConfig] = useState(null);

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [sortModel, setSortModel] = useState([]);
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const searchConfigFormRef = useRef(null);

    const fetchSearchConfigs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
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

            const response = await axiosInstance.get(`/search_configs/?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: params,
            });

            setRows(response.data.items);
            setRowCount(response.data.total_count !== undefined && response.data.total_count !== null ? response.data.total_count : 0);

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

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentConfig(null);
    }, []);

    const handleSaveSearchConfig = useCallback(async () => {
        if (!searchConfigFormRef.current) return;

        const configData = searchConfigFormRef.current.getFormData();

        if (!configData.search_term || configData.search_term.trim() === '') {
            enqueueSnackbar('Search Term is required.', { variant: 'error' });
            return;
        }
        if (isNaN(configData.frequency_days) || configData.frequency_days <= 0) {
            enqueueSnackbar('Frequency must be a positive number.', { variant: 'error' });
            return;
        }

        setIsSavingConfig(true);
        try {
            const token = localStorage.getItem('token');
            if (currentConfig) {
                await axiosInstance.put(`/search_configs/${currentConfig.id}`, configData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('Search configuration updated successfully!', { variant: 'success' });
            } else {
                await axiosInstance.post('/search_configs/', configData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('New search configuration created successfully!', { variant: 'success' });
            }
            fetchSearchConfigs();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving search config:', err);
            const errorMessage = err.response?.data?.detail || 'Error saving search configuration. Please check the data.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setIsSavingConfig(false);
        }
    }, [currentConfig, enqueueSnackbar, fetchSearchConfigs, handleCloseModal]);

    const handleOpenCreateConfigModal = useCallback(() => {
        setCurrentConfig(null);
        setIsModalOpen(true);
    }, []);

    const handleConfirmSingleDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        if (itemToDeleteId) {
            try {
                const token = localStorage.getItem('token');
                await axiosInstance.delete(`/search_configs/delete/${itemToDeleteId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                enqueueSnackbar('Search configuration deleted successfully!', { variant: 'success' });
                fetchSearchConfigs();
            } catch (err) {
                console.error('Error deleting search config:', err);
                enqueueSnackbar('Failed to delete search configuration.', { variant: 'error' });
            } finally {
                setItemToDeleteId(null);
            }
        }
    }, [itemToDeleteId, enqueueSnackbar, fetchSearchConfigs]);

    const handleConfirmBulkDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axiosInstance.delete('/search_configs/bulk/delete', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                data: { ids: rowSelection }
            });
            enqueueSnackbar('Selected search configurations deleted successfully!', { variant: 'success' });
            setRowSelection([]);
            fetchSearchConfigs();
        } catch (err) {
            console.error('Error deleting selected search configs:', err);
            enqueueSnackbar('Failed to delete selected search configurations.', { variant: 'error' });
        }
    }, [rowSelection, enqueueSnackbar, fetchSearchConfigs]);

    const handleCancelConfirmDialog = useCallback(() => {
        setIsConfirmDialogOpen(false);
        setItemToDeleteId(null);
        setConfirmAction(null);
    }, []);

    const handleSingleDelete = useCallback((id) => () => {
        setItemToDeleteId(id);
        setConfirmAction('singleDelete');
        setIsConfirmDialogOpen(true);
    }, []);

    const handleBulkDelete = useCallback(() => {
        if (rowSelection.length === 0) {
            enqueueSnackbar('No configurations selected for deletion.', { variant: 'info' });
            return;
        }
        setConfirmAction('bulkDelete');
        setIsConfirmDialogOpen(true);
    }, [rowSelection, enqueueSnackbar]);

    const confirmDialogTitle = useMemo(() => {
        if (confirmAction === 'singleDelete') return 'Confirm Deletion';
        if (confirmAction === 'bulkDelete') return `Confirm Deletion of ${rowSelection.length} Items`;
        return '';
    }, [confirmAction, rowSelection.length]);

    const confirmDialogMessage = useMemo(() => {
        if (confirmAction === 'singleDelete') return 'Are you sure you want to delete this search configuration?';
        if (confirmAction === 'bulkDelete') return `Are you sure you want to delete the ${rowSelection.length} selected search configurations? This action cannot be undone.`;
        return '';
    }, [confirmAction, rowSelection.length]);

    const columns = useMemo(
        () => [
            { field: 'id', headerName: 'ID', width: 70, renderCell: (params) => `#${params.value}` },
            { field: 'search_term', headerName: 'Search Term', flex: 1 },
            { field: 'frequency_days', headerName: 'Frequency (Days)', width: 150, type: 'number' },
            { field: 'preferred_time', headerName: 'Preferred Time', width: 150, type: 'string' },
            { field: 'is_active', headerName: 'Active', width: 100, type: 'boolean' },
            {
                field: 'created_at',
                headerName: 'Created At',
                width: 180,
                type: 'dateTime',
                valueFormatter: (params) => {
                    if (!params || params.value === null || params.value === undefined) return '';
                    return new Date(params.value).toLocaleString();
                },
            },
            {
                field: 'actions',
                type: 'actions',
                headerName: 'Actions',
                width: 100,
                cellClassName: 'actions',
                getActions: ({ id }) => {
                    return [
                        <GridActionsCellItem
                            icon={<EditIcon />}
                            label="Edit"
                            className="textPrimary"
                            onClick={() => {
                                const configToEdit = rows.find(row => row.id === id);
                                if (configToEdit) {
                                    setCurrentConfig(configToEdit);
                                    setIsModalOpen(true);
                                }
                            }}
                            color="inherit"
                        />,
                        <GridActionsCellItem
                            icon={<DeleteIcon />}
                            label="Delete"
                            onClick={handleSingleDelete(id)}
                            color="inherit"
                        />,
                    ];
                },
            },
        ],
        [rows, handleSingleDelete]
    );

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector
                    slotProps={{ tooltip: { title: 'Change density' } }}
                />
                <Box sx={{ flexGrow: 1 }} />

                {rowSelection.length > 0 && (
                    <Button color="error" startIcon={<DeleteIcon />} onClick={handleBulkDelete}>
                        Delete Selected ({rowSelection.length})
                    </Button>
                )}
                <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateConfigModal}>
                    Add Config
                </Button>

                <GridSeparatorIcon sx={{ mx: 1 }} />

                <GridToolbarExport
                    slotProps={{
                        tooltip: { title: 'Export data' },
                        button: { variant: 'outlined' },
                    }}
                />
            </GridToolbarContainer>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                <PageHeader title="Search Configurations" subtitle="Error loading configurations" divider={false} />
                <Typography variant="body1">Failed to load search configurations: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', minHeight: 400 }}>
            <PageHeader
                title="Search Configurations"
                subtitle="Manage your automated product search settings."
            />
            <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[10, 25, 50, 100]}
                rowCount={rowCount}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                filterMode="server"
                onFilterModelChange={setFilterModel}
                loading={loading}
                slots={{ toolbar: CustomToolbar }}
                slotProps={{
                    toolbar: {},
                }}
                onRowSelectionModelChange={setRowSelection}
                rowSelectionModel={rowSelection}
                checkboxSelection
                disableRowSelectionOnClick
            />
            <GenericFormModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSearchConfig}
                title={currentConfig ? "Edit Search Configuration" : "Create New Search Configuration"}
                isSaving={isSavingConfig}
            >
                <SearchConfigForm initialData={currentConfig} ref={searchConfigFormRef} />
            </GenericFormModal>
            <ConfirmationDialog
                open={isConfirmDialogOpen}
                title={confirmDialogTitle}
                message={confirmDialogMessage}
                onConfirm={confirmAction === 'singleDelete' ? handleConfirmSingleDelete : handleConfirmBulkDelete}
                onCancel={handleCancelConfirmDialog}
            />
        </Box>
    );
};

export default SearchConfigs;
