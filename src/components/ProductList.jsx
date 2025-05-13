import React, { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowsRotate, faSpinner } from '@fortawesome/free-solid-svg-icons';
import "react-toastify/dist/ReactToastify.css";
import Pagination from "./Pagination";
import Filters from "./Filters";
import "./ProductList.css";
import ConfirmationModal from './ConfirmationModal';
import ActionsMenu from './ActionsMenu';
import useDeletion from './hooks/useDeletion';

import { fetchProductsService, fetchStatsService, deleteProductService } from "../services/productService";

const ProductList = ({ setIsLoggedIn }) => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage] = useState(50);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deletionOccurred, setDeletionOccurred] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchProductsService(filters, page, itemsPerPage);
    setIsLoading(false);

    if (result?.data) {
      setProducts(result.data);
    } else if (result?.error === 'unauthorized') {
      console.log("Invalid or expired token, need to log in again.");
      setIsLoggedIn(false);
      setProducts([]);
    } else {
      console.error("Failed to fetch products");
      setProducts([]);
    }
  }, [filters, page, itemsPerPage, setIsLoggedIn]);

  const clearSelectedProducts = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const {
    isConfirmationOpen,
    itemIdToDelete,
    isBulkDelete,
    openConfirmationModal: openDeletionConfirmationModal,
    closeConfirmationModal: closeDeletionConfirmationModal,
    handleConfirmDelete,
    setIsBulkDelete: setDeletionHookIsBulkDelete,
    setItemsToDelete: setDeletionHookItemsToDelete,
  } = useDeletion({
    onDeleteItem: deleteProductService,
    updateItemList: setProducts,
    updateTotalItems: setTotalProducts,
    getItemId: (product) => product.id,
    onProductsChanged: fetchProducts,
    onClearSelectedProducts: clearSelectedProducts,
  });


  const fetchStats = async () => {
    const result = await fetchStatsService();
    if (result?.data) {
      setTotalProducts(result.data.total_products);
    } else {
      console.error("Failed to fetch stats");
    }
  };


  const handleSearch = (e) => {
    setFilters({ ...filters, title: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleCheckboxChange = (e, productId) => {
    const isChecked = e.target.checked;
    console.log('handleCheckboxChange called', { productId, isChecked });
    if (productId === "select-all") {
      setSelectedProducts(isChecked ? [...products].map((product) => product.id) : []);
      console.log('selectedProducts after select-all:', isChecked ? products.map((product) => product.id) : []);
    } else {
      setSelectedProducts((prevState) => {
        const updatedSelection = isChecked
          ? [...prevState, productId]
          : prevState.filter((id) => id !== productId);
        console.log('selectedProducts after individual check:', updatedSelection);
        return updatedSelection;
      });
    }
  };


  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) {
      toast.warn("No products selected for deletion.");
      return;
    }
    setDeletionHookIsBulkDelete(true);
    setDeletionHookItemsToDelete([...selectedProducts]);
    openDeletionConfirmationModal(null);
  };

  useEffect(() => {
    fetchProducts();
  }, [filters, page, deletionOccurred]);


  useEffect(() => {
    fetchStats();
  }, [filters]);

  return (
    <div className="product-list">
      <div className="table-toolbar">
        <Filters
          filters={filters}
          onSearchChange={handleSearch}
          onFilterChange={handleFilterChange}
        />
        <div className="toolbar-separator-horizontal" />
        <ActionsMenu label="Actions">
          <button className="delete-selected-button" onClick={handleDeleteSelected}>
            Delete Selected
          </button>
          {/* Later, I can add more buttons here */}
        </ActionsMenu>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading products...</p>
        </div>
      ) : (
        products.length === 0 ? (
          <div className="no-products-container">
            <p>There are no products.</p>
          </div>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    name="select-all"
                    className="product-checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={(e) => handleCheckboxChange(e, "select-all")}
                  />
                </th>
                <th>Source Website</th>
                <th>Title</th>
                <th>Price</th>
                <th>Condition</th>
                <th>Seller</th>
                <th>Location</th>
                <th>Availability</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="product-checkbox"
                      value={product.id}
                      onChange={(e) => handleCheckboxChange(e, product.id)}
                      checked={selectedProducts.includes(product.id)}
                    />
                  </td>
                  <td>
                    {(product.source_product_code?.split(" - ")[0]) ?? "N/A"}
                  </td>
                  <td>
                    <img
                      src={product.image_urls}
                      alt={product?.title}
                      className="product-image"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                      {product.title ?? "N/A"}
                    </a>
                  </td>
                  <td>
                    {product.current_price
                      ? product.current_price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                      : "N/A"}
                  </td>
                  <td>{product.condition ?? "N/A"}</td>
                  <td>{product.seller_name ?? "N/A"}</td>
                  <td>{product.city ? product.city : "N/A"} | {product.state ? product.state : "N/A"}</td>
                  <td>{product.is_available !== undefined && product.is_available !== null ? (product.is_available ? "Available" : "Unavailable") : "N/A"}</td>
                  <td>{product.created_at ? formatDate(product.created_at) : "N/A"}</td>
                  <td>{product.updated_at ? formatDate(product.updated_at) : "N/A"}</td>
                  <td>
                    <button className="update-button">
                      <FontAwesomeIcon icon={faArrowsRotate} />
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => openDeletionConfirmationModal(product.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {products.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={totalProducts}
          itemsPerPage={itemsPerPage}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        message={isBulkDelete ? `Are you sure you want to delete ${selectedProducts.length} products?` : "Are you sure you want to delete this product?"}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeletionConfirmationModal}
      />
    </div>
  );
};

export default ProductList;