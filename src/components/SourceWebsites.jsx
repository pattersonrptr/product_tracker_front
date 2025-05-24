import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DataGrid, GridActionsCellItem, GridToolbarContainer } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Button, Toolbar, Typography, Box } from '@mui/material';
import axios from 'axios';
import GenericFormModal from './GenericFormModal';
import SourceWebsiteForm from './SourceWebsiteForm';
import ConfirmationDialog from './ConfirmationDialog';
import { useSnackbar } from 'notistack';

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

    const fetchWebsites = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const params = {
                page: paginationModel.page + 1,
                page_size: paginationModel.pageSize,
                sort_by: sortModel.length > 0 ? sortModel[0].field : undefined,
                sort_order: sortModel.length > 0 ? sortModel[0].sort : undefined,
            };

            filterModel.items.forEach(item => {
                if (item.value) {
                    params[item.field] = item.value;
                }
            });

            const response = await axios.get('http://127.0.0.1:8000/source_websites/', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: params,
            });
            setRows(response.data.items);
            setRowCount(response.data.total_count);
        } catch (err) {
            console.error('Error fetching source websites:', err);
            setError(err);
            enqueueSnackbar('Failed to fetch source websites.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, sortModel, filterModel, enqueueSnackbar]);

    useEffect(() => {
        fetchWebsites();
    }, [fetchWebsites]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentWebsite(null);
    }, []);

    const handleSaveWebsite = useCallback(async () => {
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
                await axios.put(`http://127.0.0.1:8000/source_websites/${currentWebsite.id}`, websiteData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('Website updated successfully!', { variant: 'success' });
            } else {
                await axios.post('http://127.0.0.1:8000/source_websites/', websiteData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('New Website created successfully!', { variant: 'success' });
            }
            fetchWebsites();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving website:', err);
            const errorMessage = err.response?.data?.detail || 'Error saving website. Please check the data.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setIsSavingWebsite(false);
        }
    }, [currentWebsite, enqueueSnackbar, fetchWebsites, handleCloseModal]);

    const handleOpenCreateWebsiteModal = useCallback(() => {
        setCurrentWebsite(null);
        setIsModalOpen(true);
    }, []);

    const handleConfirmSingleDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        if (itemToDeleteId) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://127.0.0.1:8000/source_websites/delete/${itemToDeleteId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                enqueueSnackbar('Source Website deleted successfully!', { variant: 'success' });
                fetchWebsites();
            } catch (err) {
                console.error('Error deleting source website:', err);
                enqueueSnackbar('Failed to delete source website.', { variant: 'error' });
            } finally {
                setItemToDeleteId(null);
            }
        }
    }, [itemToDeleteId, enqueueSnackbar, fetchWebsites]);

    const handleConfirmBulkDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://127.0.0.1:8000/source_websites/bulk/delete', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                data: { ids: rowSelection }
            });
            enqueueSnackbar('Selected Source Websites deleted successfully!', { variant: 'success' });
            setRowSelection([]);
            fetchWebsites();
        } catch (err) {
            console.error('Error deleting selected source websites:', err);
            enqueueSnackbar('Failed to delete selected source websites.', { variant: 'error' });
        }
    }, [rowSelection, enqueueSnackbar, fetchWebsites]);

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
            { field: 'id', headerName: 'ID', width: 90 },
            { field: 'name', headerName: 'Name', flex: 1 },
            { field: 'base_url', headerName: 'Base URL', flex: 2 },
            { field: 'is_active', headerName: 'Active', width: 100, type: 'boolean' },
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
                <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateWebsiteModal}>
                    Add Website
                </Button>
                {rowSelection.length > 0 && (
                    <Button color="error" startIcon={<DeleteIcon />} onClick={handleBulkDelete}>
                        Delete Selected ({rowSelection.length})
                    </Button>
                )}
            </GridToolbarContainer>
        );
    }

    if (error) {
        return <Typography color="error">Error: {error.message}</Typography>;
    }

    return (
        <Box sx={{ width: '100%', minHeight: 400 }}>
            <Toolbar sx={{ justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="div">
                    Source Websites
                </Typography>
            </Toolbar>
            <DataGrid
                rows={rows}
                columns={columns}
                rowCount={rowCount}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                filterMode="server"
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                loading={loading}
                slots={{ toolbar: CustomToolbar }}
                slotProps={{
                    toolbar: {
                        // You can pass additional props to CustomToolbar here if needed
                    },
                }}
                onRowSelectionModelChange={setRowSelection}
                rowSelectionModel={rowSelection}
                checkboxSelection
                disableRowSelectionOnClick
            />
            <GenericFormModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveWebsite}
                title={currentWebsite ? "Edit Website" : "Register New Website"}
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
