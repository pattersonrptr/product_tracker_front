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
import { useSnackbar } from 'notistack';
import useSearchConfigs from '../hooks/useSearchConfigs';
import apiService from '../api/apiService';
import GenericFormModal from './GenericFormModal';
import SearchConfigForm from './SearchConfigForm';
import ConfirmationDialog from './ConfirmationDialog';
import PageHeader from './PageHeader';

const SearchConfigs = () => {
    const [rowSelection, setRowSelection] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentConfig, setCurrentConfig] = useState(null);

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const searchConfigFormRef = useRef(null);

    const {
        searchConfigs: rows,
        loading,
        error,
        rowCount,
        fetchSearchConfigs
    } = useSearchConfigs(paginationModel, sortModel, filterModel);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentConfig(null);
    }, []);

    const handleSaveSearchConfig = useCallback(async () => {
        if (!searchConfigFormRef.current) return;

        const configData = searchConfigFormRef.current.getFormData();
        if (!configData) {
            return;
        }

        if (!configData.user_id) {
            const user = localStorage.getItem('user');
            if (user) {
                try {
                    const parsed = JSON.parse(user);
                    configData.user_id = parsed.id;
                } catch {
                    // fallback: do nothing
                }
            }
        }

        if (!configData.search_term || configData.search_term.trim() === '') {
            enqueueSnackbar('Search Term is required.', { variant: 'error' });
            return;
        }
        if (isNaN(configData.frequency_days) || configData.frequency_days <= 0) {
            enqueueSnackbar('Frequency must be a positive number.', { variant: 'error' });
            return;
        }
        if (!configData.source_websites || configData.source_websites.length === 0) {
            enqueueSnackbar('At least one source website must be selected.', { variant: 'error' });
            return;
        }

        setIsSavingConfig(true);
        try {
            if (currentConfig) {
                await apiService.put(`/search_configs/${currentConfig.id}`, configData);
                enqueueSnackbar('Search configuration updated successfully!', { variant: 'success' });
            } else {
                await apiService.post('/search_configs/', configData);
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
                await apiService.delete(`/search_configs/delete/${itemToDeleteId}`);
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
            await apiService.delete('/search_configs/bulk/delete', { ids: rowSelection });
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
            { field: 'search_term', headerName: 'Search Term', flex: 1 },
            { field: 'frequency_days', headerName: 'Frequency (Days)', width: 150, type: 'number' },
            { field: 'preferred_time', headerName: 'Preferred Time', width: 150, type: 'string' },
            { field: 'is_active', headerName: 'Active', width: 100, type: 'boolean' },
            {
                field: 'source_websites',
                headerName: 'Source Websites',
                flex: 1,
                minWidth: 180,
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                    const sw = params.row.source_websites || [];
                    if (!Array.isArray(sw) || sw.length === 0) return '';
                    return (
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '4px',
                            minHeight: '32px'
                        }}>
                            {sw.map(site =>
                                <span
                                    key={site.id}
                                    style={{
                                        background: '#e0e0e0',
                                        borderRadius: 8,
                                        padding: '2px 8px',
                                        fontSize: 12,
                                        marginRight: 4,
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap',
                                        lineHeight: '24px',
                                        height: '24px',
                                    }}
                                >
                                    {site.name}
                                </span>
                            )}
                        </Box>
                    );
                }
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
