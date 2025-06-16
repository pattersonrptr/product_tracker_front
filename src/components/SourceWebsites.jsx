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
import useSourceWebsites from '../hooks/useSourceWebsites';
import apiService from '../api/apiService';
import GenericFormModal from './GenericFormModal';
import SourceWebsiteForm from './SourceWebsiteForm';
import ConfirmationDialog from './ConfirmationDialog';
import PageHeader from './PageHeader';

const SourceWebsites = () => {
    const [rowSelection, setRowSelection] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWebsite, setCurrentWebsite] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [isSavingWebsite, setIsSavingWebsite] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const sourceWebsiteFormRef = useRef(null);

    const {
        sourceWebsites: rows,
        loading,
        error,
        rowCount,
        fetchSourceWebsites
    } = useSourceWebsites(paginationModel, sortModel, filterModel);

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
            if (currentWebsite) {
                await apiService.put(`/source_websites/${currentWebsite.id}`, websiteData);
                enqueueSnackbar('Source website updated successfully!', { variant: 'success' });
            } else {
                await apiService.post('/source_websites/', websiteData);
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
                await apiService.delete(`/source_websites/delete/${itemToDeleteId}`);
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
            await apiService.delete('/source_websites/bulk/delete', { ids: rowSelection });
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
