import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // Adicionado useRef aqui
import { DataGrid, GridActionsCellItem, GridToolbarContainer } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add'; // Adicionado AddIcon
import { Button, Toolbar, Typography, Box } from '@mui/material';
import axios from 'axios';
// import SourceWebsiteModal from './SourceWebsiteModal'; // Removido, pois será substituído
import GenericFormModal from './GenericFormModal'; // Adicionado
import SearchConfigForm from './SearchConfigForm'; // Adicionado
import ConfirmationDialog from './ConfirmationDialog';
import { useSnackbar } from 'notistack';

const SearchConfigs = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowSelection, setRowSelection] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentConfig, setCurrentConfig] = useState(null); // Corrigido: de currentWebsite para currentConfig

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [sortModel, setSortModel] = useState([]);
    const [isSavingConfig, setIsSavingConfig] = useState(false); // Adicionado para controle de salvamento

    const { enqueueSnackbar } = useSnackbar();

    const searchConfigFormRef = useRef(null); // Adicionado: A ref para o formulário

    const fetchSearchConfigs = useCallback(async () => { // Renomeado para maior clareza
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const params = {
                page: paginationModel.page + 1, // API usually expects 1-based page number
                page_size: paginationModel.pageSize,
                sort_by: sortModel.length > 0 ? sortModel[0].field : undefined,
                sort_order: sortModel.length > 0 ? sortModel[0].sort : undefined,
            };

            filterModel.items.forEach(item => {
                if (item.value) {
                    params[item.field] = item.value;
                }
            });

            const response = await axios.get('http://127.0.0.1:8000/search_configs/', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: params,
            });
            setRows(response.data.items);
            setRowCount(response.data.total_count);
        } catch (err) {
            console.error('Error fetching search configs:', err);
            setError(err);
            enqueueSnackbar('Failed to fetch search configurations.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, sortModel, filterModel, enqueueSnackbar]); // Dependências atualizadas

    useEffect(() => {
        fetchSearchConfigs();
    }, [fetchSearchConfigs]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentConfig(null); // Limpa a config atual ao fechar
    }, []);

    const handleSaveSearchConfig = useCallback(async () => {
        if (!searchConfigFormRef.current) return;

        const configData = searchConfigFormRef.current.getFormData(); // Obtém os dados do formulário

        // Validações básicas (pode expandir no SearchConfigForm.jsx ou aqui)
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
                await axios.put(`http://127.0.0.1:8000/search_configs/${currentConfig.id}`, configData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('Search Config updated successfully!', { variant: 'success' });
            } else {
                await axios.post('http://127.0.0.1:8000/search_configs/', configData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('New Search Config created successfully!', { variant: 'success' });
            }
            fetchSearchConfigs(); // Re-fetch all configs
            handleCloseModal();
        } catch (err) {
            console.error('Error saving Search Config:', err);
            const errorMessage = err.response?.data?.detail || 'Error saving Search Config. Please check the data.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setIsSavingConfig(false);
        }
    }, [currentConfig, enqueueSnackbar, fetchSearchConfigs, handleCloseModal]);

    const handleOpenCreateConfigModal = useCallback(() => {
        setCurrentConfig(null); // Para criar um novo, o currentConfig é nulo
        setIsModalOpen(true);
    }, []);

    // Funções para o diálogo de confirmação
    const handleConfirmSingleDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        if (itemToDeleteId) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://127.0.0.1:8000/search_configs/${itemToDeleteId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                enqueueSnackbar('Search Config deleted successfully!', { variant: 'success' });
                fetchSearchConfigs();
            } catch (err) {
                console.error('Error deleting search config:', err);
                enqueueSnackbar('Failed to delete search config.', { variant: 'error' });
            } finally {
                setItemToDeleteId(null);
            }
        }
    }, [itemToDeleteId, enqueueSnackbar, fetchSearchConfigs]);

    const handleConfirmBulkDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:8000/search_configs/bulk_delete', { ids: rowSelection }, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            enqueueSnackbar('Selected Search Configs deleted successfully!', { variant: 'success' });
            setRowSelection([]); // Limpa a seleção
            fetchSearchConfigs();
        } catch (err) {
            console.error('Error deleting selected search configs:', err);
            enqueueSnackbar('Failed to delete selected search configs.', { variant: 'error' });
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
            { field: 'id', headerName: 'ID', width: 90 },
            { field: 'search_term', headerName: 'Search Term', flex: 1 },
            { field: 'frequency_days', headerName: 'Frequency (Days)', width: 150, type: 'number' },
            { field: 'preferred_time', headerName: 'Preferred Time', width: 150, type: 'string' },
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
                <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateConfigModal}>
                    Add Config
                </Button>
                {rowSelection.length > 0 && (
                    <Button color="error" startIcon={<DeleteIcon />} onClick={handleBulkDelete}>
                        Delete Selected ({rowSelection.length})
                    </Button>
                )}
                {/* Você pode adicionar mais itens de toolbar aqui, se necessário */}
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
                    Search Configurations
                </Typography>
                {/* A toolbar customizada agora é renderizada pelo DataGrid */}
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
                        // Você pode passar props adicionais para CustomToolbar aqui se ela precisar
                    },
                }}
                onRowSelectionModelChange={setRowSelection}
                rowSelectionModel={rowSelection}
                checkboxSelection
                disableRowSelectionOnClick // Impede a seleção ao clicar na linha
            />
            <GenericFormModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSearchConfig}
                title={currentConfig ? "Edit Search Config" : "Create New Search Config"}
                isSaving={isSavingConfig}
            >
                {/* Renderiza o formulário específico de Search Config aqui */}
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