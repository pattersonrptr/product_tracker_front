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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Toolbar, Typography, Box, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import GenericFormModal from './GenericFormModal';
import ProductForm from './ProductForm';
import ConfirmationDialog from './ConfirmationDialog';
import { useSnackbar } from 'notistack';
import PageHeader from './PageHeader';

const Products = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowSelection, setRowSelection] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [sortModel, setSortModel] = useState([]);
    const [isSavingProduct, setIsSavingProduct] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const productFormRef = useRef(null);

    const fetchProducts = useCallback(async () => {
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

            const response = await axiosInstance.get(`/products/?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: params,
            });

            console.log('API Response for Products:', response.data);

            setRows(response.data.items);
            setRowCount(response.data.total_count !== undefined && response.data.total_count !== null ? response.data.total_count : 0);

        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err);
            enqueueSnackbar('Failed to fetch products.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, sortModel, filterModel, enqueueSnackbar]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentProduct(null);
    }, []);

    const handleSaveProduct = useCallback(async () => {
        if (!productFormRef.current) return;

        const productData = productFormRef.current.getFormData();
        if (!productData) {
            enqueueSnackbar('Please fill all required fields correctly.', { variant: 'error' });
            return;
        }

        if (!productData.title || productData.title.trim() === '') {
            enqueueSnackbar('Product Title is required.', { variant: 'error' });
            return;
        }
        if (!productData.url || productData.url.trim() === '') {
            enqueueSnackbar('Product URL is required.', { variant: 'error' });
            return;
        }
        if (!productData.source_website_id) {
            enqueueSnackbar('Source Website is required.', { variant: 'error' });
            return;
        }
        if (productData.current_price !== null && (isNaN(productData.current_price) || productData.current_price < 0)) {
            enqueueSnackbar('Current Price must be a non-negative number.', { variant: 'error' });
            return;
        }

        setIsSavingProduct(true);
        try {
            const token = localStorage.getItem('token');
            if (currentProduct) {
                await axiosInstance.put(`/products/${currentProduct.id}`, productData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('Product updated successfully!', { variant: 'success' });
            } else {
                await axiosInstance.post('/products/', productData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                enqueueSnackbar('New Product created successfully!', { variant: 'success' });
            }
            fetchProducts();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving product:', err);
            // Tenta extrair mensagem detalhada do backend
            let errorMessage = 'Error saving product. Please check the data.';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map(d => d.msg).join(' | ');
                } else {
                    errorMessage = err.response.data.detail;
                }
            }
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setIsSavingProduct(false);
        }
    }, [currentProduct, enqueueSnackbar, fetchProducts, handleCloseModal]);

    const handleOpenCreateProductModal = useCallback(() => {
        setCurrentProduct(null);
        setIsModalOpen(true);
    }, []);

    const handleConfirmSingleDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        if (itemToDeleteId) {
            try {
                const token = localStorage.getItem('token');
                await axiosInstance.delete(`/products/delete/${itemToDeleteId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                enqueueSnackbar('Product deleted successfully!', { variant: 'success' });
                fetchProducts();
            } catch (err) {
                console.error('Error deleting product:', err);
                enqueueSnackbar('Failed to delete product.', { variant: 'error' });
            } finally {
                setItemToDeleteId(null);
            }
        }
    }, [itemToDeleteId, enqueueSnackbar, fetchProducts]);

    const handleConfirmBulkDelete = useCallback(async () => {
        setIsConfirmDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axiosInstance.delete('/products/bulk/delete', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                data: { ids: rowSelection }
            });
            enqueueSnackbar('Selected Products deleted successfully!', { variant: 'success' });
            setRowSelection([]);
            fetchProducts();
        } catch (err) {
            console.error('Error deleting selected products:', err);
            enqueueSnackbar('Failed to delete selected products.', { variant: 'error' });
        }
    }, [rowSelection, enqueueSnackbar, fetchProducts]);

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
            enqueueSnackbar('No products selected for deletion.', { variant: 'info' });
            return;
        }
        setConfirmAction('bulkDelete');
        setIsConfirmDialogOpen(true);
    }, [rowSelection, enqueueSnackbar]);

    const confirmDialogTitle = useMemo(() => {
        if (confirmAction === 'singleDelete') return 'Confirm Deletion';
        if (confirmAction === 'bulkDelete') return `Confirm Deletion of ${rowSelection.length} Products`;
        return '';
    }, [confirmAction, rowSelection.length]);

    const confirmDialogMessage = useMemo(() => {
        if (confirmAction === 'singleDelete') return 'Are you sure you want to delete this product?';
        if (confirmAction === 'bulkDelete') return `Are you sure you want to delete the ${rowSelection.length} selected products? This action cannot be undone.`;
        return '';
    }, [confirmAction, rowSelection.length]);

    const extractDomain = (url) => {
        try {
            const { hostname } = new URL(url);
            return hostname.replace(/^www\./, '').replace(/\.com.*/, '').replace(/.*?\./, '');
        } catch {
            return '';
        }
    };

    const columns = useMemo(
        () => [
            {
                field: 'title',
                headerName: 'Product',
                flex: 1.5,
                renderCell: (params) => (
                    <MuiLink
                        href={params.row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        {params.row.image_urls && (
                            <Box
                                component="img"
                                src={params.row.image_urls}
                                alt="Product"
                                sx={{
                                    width: 32,
                                    height: 32,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    border: '1px solid #eee',
                                    background: '#fafafa',
                                    mr: 1.2,
                                }}
                            />
                        )}
                        {params.value}
                    </MuiLink>
                ),
            },
            {
                field: 'source_website_id',
                headerName: 'Source Website',
                width: 180,
                renderCell: (params) => extractDomain(params.row.url),
            },
            { field: 'current_price', headerName: 'Price', width: 100, type: 'number',
              valueFormatter: (value) => value !== null ? `R$ ${value.toFixed(2)}` : ''
            },
            { field: 'is_available', headerName: 'Available', width: 100, type: 'boolean' },
            { field: 'condition', headerName: 'Condition', width: 120 },
            { field: 'source_product_code', headerName: 'Source Code', width: 150 },
            {
                field: 'actions',
                type: 'actions',
                headerName: 'Actions',
                width: 90,
                cellClassName: 'actions',
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <GridActionsCellItem
                            icon={
                                <Box component="span" title="View" sx={{ p: 0, m: 0, minWidth: 0 }}>
                                    <VisibilityIcon fontSize="small" />
                                </Box>
                            }
                            label="View"
                            onClick={() => window.open(`/products/${params.id}`, '_blank', 'noopener,noreferrer')}
                            color="inherit"
                            showInMenu={false}
                        />
                        <GridActionsCellItem
                            icon={
                                <Box component="span" title="Edit" sx={{ p: 0, m: 0, minWidth: 0 }}>
                                    <EditIcon fontSize="small" />
                                </Box>
                            }
                            label="Edit"
                            className="textPrimary"
                            onClick={() => {
                                const productToEdit = rows.find(row => row.id === params.id);
                                if (productToEdit) {
                                    setCurrentProduct(productToEdit);
                                    setIsModalOpen(true);
                                }
                            }}
                            color="inherit"
                            showInMenu={false}
                        />
                        <GridActionsCellItem
                            icon={
                                <Box component="span" title="Delete" sx={{ p: 0, m: 0, minWidth: 0 }}>
                                    <DeleteIcon fontSize="small" />
                                </Box>
                            }
                            label="Delete"
                            onClick={handleSingleDelete(params.id)}
                            color="inherit"
                            showInMenu={false}
                        />
                    </Box>
                ),
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
                <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateProductModal}>
                    Add Product
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
                <PageHeader title="Products" subtitle="Error loading products" divider={false} />
                <Typography variant="body1">Failed to load products: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', minHeight: 400 }}>
            <PageHeader
                title="Products"
                subtitle="View and manage your product inventory."
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
                onSave={handleSaveProduct}
                title={currentProduct ? "Edit Product" : "Create New Product"}
                isSaving={isSavingProduct}
            >
                <ProductForm initialData={currentProduct} ref={productFormRef} />
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

export default Products;
