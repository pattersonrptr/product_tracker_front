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
import { useSnackbar } from 'notistack';
import GenericFormModal from './GenericFormModal';
import ProductForm from './ProductForm';
import ConfirmationDialog from './ConfirmationDialog';
import PageHeader from './PageHeader';
import useProducts from '../hooks/useProducts';
import apiService from '../api/apiService';

function normalizeFilterModel(filterModel) {
    // Ensures that "is empty" and "is not empty" filters are preserved even without a value
    return {
        ...filterModel,
        items: filterModel.items.map(item => {
            if (
                (item.operator === 'isEmpty' || item.operator === 'isNotEmpty') &&
                (item.value === undefined || item.value === null)
            ) {
                return { ...item, value: '' }; // or null, depending on the backend
            }
            return item;
        }),
    };
}

const Products = () => {
    const [rowSelection, setRowSelection] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [isSavingProduct, setIsSavingProduct] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const productFormRef = useRef(null);

    const {
        products: rows,
        loading,
        error,
        rowCount,
        fetchProducts
    } = useProducts(paginationModel, sortModel, filterModel);

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
            if (currentProduct) {
                await apiService.put(`/products/${currentProduct.id}`, productData);
                enqueueSnackbar('Product updated successfully!', { variant: 'success' });
            } else {
                await apiService.post('/products/', productData);
                enqueueSnackbar('New Product created successfully!', { variant: 'success' });
            }
            fetchProducts();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving product:', err);
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
                await apiService.delete(`/products/delete/${itemToDeleteId}`);
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
            await apiService.delete('/products/bulk/delete', { ids: rowSelection });
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
                field: 'created_at',
                headerName: 'Created At',
                type: 'date',
                width: 180,
                valueFormatter: (value) => {
                    const date = new Date(value);
                    if (!value) return '';
                    return date.toLocaleString('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                }
            },
            {
                field: 'updated_at',
                headerName: 'Updated At',
                width: 150,
                type: 'date',
                valueFormatter: (value) => {
                    const date = new Date(value);
                    if (!value) return '';
                    return date.toLocaleString('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                }
            },
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
                {/* <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateProductModal}>
                    Add Product
                </Button>

                <GridSeparatorIcon sx={{ mx: 1 }} /> */}

                <GridToolbarExport
                    slotProps={{
                        tooltip: { title: 'Export data' },
                        button: { variant: 'outlined' },
                    }}
                />
            </GridToolbarContainer>
        );
    }

    // Disable pagination and sorting while loading
    const handlePaginationModelChange = useCallback(
        (newModel) => {
            if (!loading) {
                setPaginationModel(newModel);
            }
        },
        [loading]
    );

    const handleFilterModelChange = useCallback(
        (newModel) => {
            setFilterModel(normalizeFilterModel(newModel));
        },
        []
    );

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
                onPaginationModelChange={handlePaginationModelChange}
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                filterMode="server"
                onFilterModelChange={handleFilterModelChange}
                loading={loading}
                slots={{ toolbar: CustomToolbar }}
                slotProps={{
                    toolbar: {},
                }}
                onRowSelectionModelChange={setRowSelection}
                rowSelectionModel={rowSelection}
                checkboxSelection
                disableRowSelectionOnClick

                // Disable interaction while loading
                disableColumnMenu={loading}
                disableSelectionOnClick={loading}
                disableColumnFilter={loading}
                disableColumnSelector={loading}
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
