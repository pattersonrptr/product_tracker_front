import React, { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import "react-toastify/dist/ReactToastify.css";
import Pagination from "./Pagination";
import Filters from "./Filters";
import "./ProductList.css";

const ProductList = ({ setIsLoggedIn }) => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 50;
  const [selectedProducts, setSelectedProducts] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      const params = new URLSearchParams({
        ...validFilters,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      });

      const response = await fetch(`http://localhost:8000/products/filter/?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error("Failed to fetch products");
        setProducts([]);

        if (response.status === 401 || response.status === 403) {
          console.log("Token inválido ou expirado, precisa fazer login novamente.");
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setProducts([]);
    }
  }, [filters, page, itemsPerPage, setIsLoggedIn]);

  const fetchStats = async () => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch("http://localhost:8000/products/stats/", {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTotalProducts(data.total_products);
      } else {
        console.error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const deleteProduct = async (productId) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(
        `http://localhost:8000/products/${productId}/`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );
      if (response.ok) {
        setProducts(prevProducts => prevProducts.filter((product) => product.id !== productId));
        setTotalProducts((prevTotal) => prevTotal - 1);
        toast.success("Product deleted successfully!");
        setDeletionOccurred(prev => !prev);
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, title: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const confirmDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(productId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };


  const handleCheckboxChange = (e, productId) => {
    const isChecked = e.target.checked;

    if (productId === "select-all") {
      if (isChecked) {
        const allProductIds = products.map((product) => product.id);
        setSelectedProducts(allProductIds);
      } else {
        setSelectedProducts([]);
      }
    } else {
      if (isChecked) {
        setSelectedProducts((prevSelected) => [...prevSelected, productId]);
      } else {
        setSelectedProducts((prevSelected) =>
          prevSelected.filter((id) => id !== productId)
        );
      }
    }
  };

  const [deletionOccurred, setDeletionOccurred] = useState(false);

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.warn("No products selected for deletion.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      const deletionResults = await Promise.all(
        selectedProducts.map(async (productId) => {
          try {
            const response = await fetch(
              `http://localhost:8000/products/${productId}/`,
              {
                method: "DELETE",
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
              }
            );
            return { id: productId, success: response.ok };
          } catch (error) {
            console.error(`Error deleting product ${productId}:`, error);
            return { id: productId, success: false };
          }
        })
      );

      const successfulDeletions = deletionResults.filter(result => result.success);
      const failedDeletions = deletionResults.filter(result => !result.success);

      if (successfulDeletions.length > 0) {
        toast.success(`${successfulDeletions.length} product(s) deleted successfully!`);
        setProducts(prevProducts =>
          prevProducts.filter(product => successfulDeletions.every(res => res.id !== product.id))
        );
        const newTotalProducts = totalProducts - successfulDeletions.length;
        setTotalProducts(newTotalProducts);

        const lastPage = Math.ceil(newTotalProducts / itemsPerPage);

        if (page > lastPage && lastPage > 0) {
          setPage(lastPage);
        } else if (newTotalProducts === 0) {
          setPage(1);
        } else {
          setDeletionOccurred(prev => !prev);
        }
      }

      if (failedDeletions.length > 0) {
        toast.error(`Failed to delete ${failedDeletions.length} product(s).`);
      }

      setSelectedProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, page, filters, deletionOccurred]);

  useEffect(() => {
    fetchStats();
  }, [filters]);


  return (
    <div className="product-list">
      <Filters
        filters={filters}
        onSearchChange={handleSearch}
        onFilterChange={handleFilterChange}
      />
      <div className="actions-menu">
        <button className="delete-selected-button" onClick={handleDeleteSelected}>
          Delete Selected
        </button>
      </div>

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
            <th>Price History</th>
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
              <td>{product.current_price ? product.price_history : 'N/A'}</td>
              <td>{product.created_at ? formatDate(product.created_at) : "N/A"}</td>
              <td>{product.updated_at ? formatDate(product.updated_at) : "N/A"}</td>
              <td>
                <button className="update-button">
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </button>
                <button
                  className="delete-button"
                  onClick={() => confirmDelete(product.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={page}
        totalItems={totalProducts}
        itemsPerPage={itemsPerPage}
        onPageChange={(newPage) => setPage(newPage)}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProductList;