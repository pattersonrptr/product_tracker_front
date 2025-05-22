import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataGrid, GridActionsCellItem, GridToolbarContainer } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Toolbar, Typography, Box } from '@mui/material';
import axios from 'axios';
import SourceWebsiteModal from './SourceWebsiteModal';
import ConfirmationDialog from './ConfirmationDialog';
import { useSnackbar } from 'notistack';

const SearchConfigs = () => {
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

    const { enqueueSnackbar } = useSnackbar();

    const fetchWebsites = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const offset = paginationModel.page * paginationModel.pageSize;
            const limit = paginationModel.pageSize;

            const queryParams = new URLSearchParams();
            queryParams.append('limit', limit);
            queryParams.append('offset', offset);

            if (filterModel.items && filterModel.items.length > 0) {
                filterModel.items.forEach(item => {
                    if (item.value !== undefined && item.value !== null) {
                        let filterValue = item.value;
                        if (item.field === 'is_active' && typeof item.value === 'boolean') {
                            filterValue = item.value ? 'true' : 'false';
                        }
                        
                        queryParams.append(`filter_${item.field}_value`, filterValue);
                        if (item.operator) {
                            queryParams.append(`filter_${item.field}_operator`, item.operator);
                        }
                    }
                });
            }

            if (sortModel.length > 0) {
                const sortItem = sortModel[0];
                queryParams.append('sort_by', sortItem.field);
                queryParams.append('sort_order', sortItem.sort);
            }

            const response = await axios.get(`http://127.0.0.1:8000/search_configs/?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setRows(response.data.items);
            setRowCount(response.data.total_count);

        } catch (err) {
            console.error('Error fetching websites:', err);
            setError('Error loading websites.');
            enqueueSnackbar('Error loading websites. Please try again later.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, filterModel, sortModel, enqueueSnackbar]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchWebsites();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [fetchWebsites]);

    const handleDelete = useCallback((id) => {
        setItemToDeleteId(id);
        setConfirmAction('singleDelete');
        setIsConfirmDialogOpen(true);
    }, []);

    const handleConfirmSingleDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        if (itemToDeleteId) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://127.0.0.1:8000/search_configs/${itemToDeleteId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                enqueueSnackbar('Website deleted successfully!', { variant: 'success' });
                fetchWebsites();
            } catch (err) {
                console.error('Error deleting website:', err);
                const errorMessage = err.response?.data?.detail || 'Error deleting website.';
                enqueueSnackbar(errorMessage, { variant: 'error' });
            } finally {
                setItemToDeleteId(null);
            }
        }
    }, [itemToDeleteId, fetchWebsites, enqueueSnackbar]);

    const handleDeleteSelected = useCallback(() => {
        if (rowSelection.length === 0) {
            enqueueSnackbar("Please select the items you want to delete.", { variant: 'warning' });
            return;
        }
        setConfirmAction('bulkDelete');
        setIsConfirmDialogOpen(true);
    }, [rowSelection, enqueueSnackbar]);

    const handleConfirmBulkDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://127.0.0.1:8000/search_configs/bulk/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: { ids: rowSelection }
            });

            const { deleted, not_found } = response.data;

            if (deleted && deleted.length > 0) {
                enqueueSnackbar(`${deleted.length} website(s) deleted successfully.`, { variant: 'success' });
            }
            if (not_found && not_found.length > 0) {
                enqueueSnackbar(`${not_found.length} website(s) not found for deletion.`, { variant: 'warning' });
            }
            if ((!deleted || deleted.length === 0) && (!not_found || not_found.length === 0)) {
                 enqueueSnackbar(`No website was deleted.`, { variant: 'info' });
            }

            fetchWebsites();
            setRowSelection([]);
        } catch (err) {
            console.error('Error deleting selected websites:', err);
            const errorMessage = err.response?.data?.detail || 'Error deleting selected websites.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    }, [rowSelection, fetchWebsites, enqueueSnackbar]);

    const handleCancelConfirmDialog = useCallback(() => {
        setIsConfirmDialogOpen(false);
        setConfirmAction(null);
        setItemToDeleteId(null);
    }, []);

    const websiteToToJson = useCallback((website) => {
        return JSON.parse(JSON.stringify(website));
    }, []);

    const handleUpdate = useCallback((id) => {
        const websiteToEdit = rows.find(row => row.id === id);
        if (websiteToEdit) {
            setCurrentWebsite(websiteToToJson(websiteToEdit)); 
            setIsModalOpen(true);
        }
    }, [rows, websiteToToJson]);

    const handleOpenCreateModal = useCallback(() => {
        setCurrentWebsite(null);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentWebsite(null);
    }, []);

    const handleSaveWebsite = useCallback(async (websiteData) => {
        try {
            const token = localStorage.getItem('token');
            if (currentWebsite) {
                const response = await axios.put(`http://127.0.0.1:8000/search_configs/${currentWebsite.id}`, websiteData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Website updated:', response.data);
                enqueueSnackbar('Website updated successfully!', { variant: 'success' });
            } else {
                const response = await axios.post('http://127.0.0.1:8000/search_configs/', websiteData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('New website created:', response.data);
                enqueueSnackbar('New website created successfully!', { variant: 'success' });
            }
            fetchWebsites();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving website:', err);
            const errorMessage = err.response?.data?.detail || 'Error saving website. Please check the data.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    }, [currentWebsite, fetchWebsites, handleCloseModal, enqueueSnackbar]);

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'search_term', headerName: 'Search Term', width: 200 },
        { field: 'is_active', headerName: 'Active', type: 'boolean', width: 100 },
        { field: 'frequency_days', headerName: 'Frequency (days)', type: 'number', width: 140 },
        { field: 'preferred_time', headerName: 'Preferred Time', width: 130 },
        { field: 'user_id', headerName: 'User ID', width: 90 },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleDelete(params.id)}
                    // showInMenu
                />,
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Update"
                    onClick={() => handleUpdate(params.id)}
                    // showInMenu
                />,
            ],
        },
    ], [handleDelete, handleUpdate]);

    const CustomToolbar = useMemo(() => {
        return function CustomToolbarComponent() {
            return (
                <GridToolbarContainer>
                    <Button
                        onClick={handleOpenCreateModal}
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: 'auto' }}
                    >
                        Create New
                    </Button>
                </GridToolbarContainer>
            );
        };
    }, [handleOpenCreateModal]);

    if (error && rows.length === 0) {
        return <div>{error}</div>;
    }

    let confirmDialogTitle = "";
    let confirmDialogMessage = "";

    if (confirmAction === 'singleDelete') {
        confirmDialogTitle = "Confirm Deletion";
        confirmDialogMessage = "Are you sure you want to delete this item?";
    } else if (confirmAction === 'bulkDelete') {
        confirmDialogTitle = "Confirm Multiple Deletion";
        confirmDialogMessage = `Are you sure you want to delete the ${rowSelection.length} selected item(s)?`;
    }

    return (
        <Box sx={{ width: '100%', minHeight: 400 }}>
            <h2>Search Configs</h2>
            {rowSelection.length > 0 && (
                <Toolbar style={{ marginBottom: 10, backgroundColor: '#f5f5f5' }}>
                    <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" component="div">
                        {rowSelection.length} item(s) selected
                    </Typography>
                    <Button onClick={handleDeleteSelected} variant="contained" color="error" size="small">
                        Delete
                    </Button>
                </Toolbar>
            )}
            <DataGrid
                key="search-configs-data-grid" 
                rows={rows}
                columns={columns}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                checkboxSelection
                disableRowSelectionOnClick
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
                        // Reserved for a future CustomToolbar, maybe adding a quick filter field
                        // or other custom actions
                    },
                }}
                onRowSelectionModelChange={setRowSelection}
                rowSelectionModel={rowSelection}
            />
            <SourceWebsiteModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveWebsite}
                currentWebsite={currentWebsite}
            />
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
