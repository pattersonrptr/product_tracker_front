import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
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
    const [filterModel, setFilterModel] = useState({ items: [], quickFilterValues: [] });
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

            if (filterModel.quickFilterValues && filterModel.quickFilterValues.length > 0) {
                queryParams.append('name', filterModel.quickFilterValues[0]);
            }
            
            if (sortModel.length > 0) {
                const sortItem = sortModel[0];
                queryParams.append('sort_by', sortItem.field);
                queryParams.append('sort_order', sortItem.sort);
            }

            const response = await axios.get(`http://127.0.0.1:8000/search_configs/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data)
            setRows(response.data);
            setRowCount(10);

        } catch (err) {
            console.error('Erro ao buscar websites:', err);
            setError('Erro ao carregar websites.');
            enqueueSnackbar('Erro ao carregar websites. Tente novamente mais tarde.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, filterModel, sortModel, enqueueSnackbar]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchWebsites();
        }, 500);

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
                enqueueSnackbar('Website deletado com sucesso!', { variant: 'success' });
                fetchWebsites();
            } catch (err) {
                console.error('Erro ao deletar website:', err);
                const errorMessage = err.response?.data?.detail || 'Erro ao deletar website.';
                enqueueSnackbar(errorMessage, { variant: 'error' });
            } finally {
                setItemToDeleteId(null);
            }
        }
    }, [itemToDeleteId, fetchWebsites, enqueueSnackbar]);

    const handleDeleteSelected = useCallback(() => {
        if (rowSelection.length === 0) {
            enqueueSnackbar("Por favor, selecione os itens que deseja deletar.", { variant: 'warning' });
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
                enqueueSnackbar(`${deleted.length} website(s) deletado(s) com sucesso.`, { variant: 'success' });
            }
            if (not_found && not_found.length > 0) {
                enqueueSnackbar(`${not_found.length} website(s) não encontrado(s) para deletar.`, { variant: 'warning' });
            }
            if ((!deleted || deleted.length === 0) && (!not_found || not_found.length === 0)) {
                 enqueueSnackbar(`Nenhum website foi deletado.`, { variant: 'info' });
            }

            fetchWebsites();
            setRowSelection([]);
        } catch (err) {
            console.error('Erro ao deletar websites selecionados:', err);
            const errorMessage = err.response?.data?.detail || 'Erro ao deletar websites selecionados.';
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
                console.log('Website atualizado:', response.data);
                enqueueSnackbar('Website atualizado com sucesso!', { variant: 'success' });
            } else {
                const response = await axios.post('http://127.0.0.1:8000/search_configs/', websiteData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Novo website criado:', response.data);
                enqueueSnackbar('Novo website criado com sucesso!', { variant: 'success' });
            }
            fetchWebsites();
            handleCloseModal();
        } catch (err) {
            console.error('Erro ao salvar website:', err);
            const errorMessage = err.response?.data?.detail || 'Erro ao salvar website. Verifique os dados.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    }, [currentWebsite, fetchWebsites, handleCloseModal, enqueueSnackbar]);

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'search_term', headerName: 'Search Term', width: 150 },
        { field: 'frequency_days', headerName: 'Frequency Days', width: 250 },
        { field: 'is_active', headerName: 'Active', type: 'boolean', width: 100 },
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
                    // showInMenu /* Optional: shows in the cell menu */
                />,
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Update"
                    onClick={() => handleUpdate(params.id)}
                    // showInMenu /* Optional: shows in the cell menu */
                />,
            ],
        },
    ], [handleDelete, handleUpdate]);

    const CustomToolbar = useMemo(() => {
        return function CustomToolbarComponent() {
            return (
                <GridToolbarContainer>
                    <GridToolbarQuickFilter />
                    <Button
                        onClick={handleOpenCreateModal}
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: 'auto' }}
                    >
                        Criar Novo
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
        confirmDialogTitle = "Confirmar Deleção";
        confirmDialogMessage = "Tem certeza que deseja deletar este item?";
    } else if (confirmAction === 'bulkDelete') {
        confirmDialogTitle = "Confirmar Deleção de Múltiplos Itens";
        confirmDialogMessage = `Tem certeza que deseja deletar os ${rowSelection.length} item(s) selecionado(s)?`;
    }

    return (
        <Box sx={{ width: '100%', minHeight: 400 }}>
            <h2>Search Configs</h2>
            {rowSelection.length > 0 && (
                <Toolbar style={{ marginBottom: 10, backgroundColor: '#f5f5f5' }}>
                    <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" component="div">
                        {rowSelection.length} item(s) selecionado(s)
                    </Typography>
                    <Button onClick={handleDeleteSelected} variant="contained" color="error" size="small">
                        Deletar
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
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 },
                    },
                }}
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
