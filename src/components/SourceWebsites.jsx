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
import SourceWebsiteForm from './SourceWebsiteForm';
import ConfirmationDialog from './ConfirmationDialog';
import { useSnackbar } from 'notistack';
import PageHeader from './PageHeader';

const SourceWebsites = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowSelection, setRowSelection] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWebsite, setCurrentWebsite] = useState(null);

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [sortModel, setSortModel] = useState([]);
    const [isSavingWebsite, setIsSavingWebsite] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const sourceWebsiteFormRef = useRef(null);

    const fetchSourceWebsites = useCallback(async () => {
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

            const response = await axiosInstance.get(`/source_websites/?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: params,
            });

            setRows(response.data.items);
            setRowCount(response.data.total_count !== undefined && response.data.total_count !== null ? response.data.total_count : 0);

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

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentWebsite(null);
    }, []);

    const handleSaveSourceWebsite = useCallback(async () => {
        if (!sourceWebsiteFormRef.current) return;

        const websiteData = sourceWebsiteFormRef.current.getFormData();

        if (!websiteData.name || websiteData.name.trim() === '') {
            enqueueSnackbar('Website Name is required.', { variant: 'error' });
            return;
        }
        if (!websiteData.base_url || websiteData.base_url.trim() === '') {
            enqueueSnackbar('Base URL is required.', { variant: 'error' });
            return;
        }

        setIsSavingWebsite(true);
        try {
            const token = localStorage.getItem('token');
            if (currentWebsite) {
                await axiosInstance.put(`/source_websites/${currentWebsite.id}`, websiteData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('Source website updated successfully!', { variant: 'success' });
            } else {
                await axiosInstance.post('/source_websites/', websiteData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('New source website created successfully!', { variant: 'success' });
            }
            fetchSourceWebsites();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving source website:', err);
            const errorMessage = err.response?.data?.detail || 'Error saving source website. Please check the data.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setIsSavingWebsite(false);
        }
    }, [currentWebsite, enqueueSnackbar, fetchSourceWebsites, handleCloseModal]);

    const handleOpenCreateWebsiteModal = useCallback(() => {
        setCurrentWebsite(null);
        setIsModalOpen(true);
    }, []);

    const handleConfirmSingleDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        if (itemToDeleteId) {
            try {
                const token = localStorage.getItem('token');
                await axiosInstance.delete(`/source_websites/delete/${itemToDeleteId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                enqueueSnackbar('Source website deleted successfully!', { variant: 'success' });
                fetchSourceWebsites();
            } catch (err) {
                console.error('Error deleting source website:', err);
                enqueueSnackbar('Failed to delete source website.', { variant: 'error' });
            } finally {
                setItemToDeleteId(null);
            }
        }
    }, [itemToDeleteId, enqueueSnackbar, fetchSourceWebsites]);

    const handleConfirmBulkDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axiosInstance.delete('/source_websites/bulk/delete', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                data: { ids: rowSelection }
            });
            enqueueSnackbar('Selected source websites deleted successfully!', { variant: 'success' });
            setRowSelection([]);
            fetchSourceWebsites();
        } catch (err) {
            console.error('Error deleting selected source websites:', err);
            enqueueSnackbar('Failed to delete selected source websites.', { variant: 'error' });
        }
    }, [rowSelection, enqueueSnackbar, fetchSourceWebsites]);

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
            enqueueSnackbar('No websites selected for deletion.', { variant: 'info' });
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
        if (confirmAction === 'singleDelete') return 'Are you sure you want to delete this source website?';
        if (confirmAction === 'bulkDelete') return `Are you sure you want to delete the ${rowSelection.length} selected source websites? This action cannot be undone.`;
        return '';
    }, [confirmAction, rowSelection.length]);

    const columns = useMemo(
        () => [
            { field: 'id', headerName: 'ID', width: 70, renderCell: (params) => `#${params.value}` },
            { field: 'name', headerName: 'Name', flex: 1 },
            { field: 'base_url', headerName: 'Base URL', flex: 2 },
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
                                const websiteToEdit = rows.find(row => row.id === id);
                                if (websiteToEdit) {
                                    setCurrentWebsite(websiteToEdit);
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
                <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateWebsiteModal}>
                    Add Website
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
                <PageHeader title="Source Websites" subtitle="Error loading source websites" divider={false} />
                <Typography variant="body1">Failed to load source websites: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', minHeight: 400 }}>
            <PageHeader
                title="Source Websites"
                subtitle="Manage external websites for product tracking."
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
                onSave={handleSaveSourceWebsite}
                title={currentWebsite ? "Edit Source Website" : "Create New Source Website"}
                isSaving={isSavingWebsite}
            >
                <SourceWebsiteForm initialData={currentWebsite} ref={sourceWebsiteFormRef} />
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

export default SourceWebsites;
