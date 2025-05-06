import React, { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import "react-toastify/dist/ReactToastify.css";
import Pagination from "./Pagination";
import Filters from "./Filters";
import "./ProductList.css";

const ProductList = ({setIsLoggedIn}) => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 50;
  const [selectedProducts, setSelectedProducts] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken'); // Retrive the access token from localStorage

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
        setProducts(products.filter((product) => product.id !== productId));
        setTotalProducts((prevTotal) => prevTotal - 1);
        toast.success("Product deleted successfully!");
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

    if (productId === "all") {
      // If the "select all" checkbox is checked
      if (isChecked) {
        const allProductIds = products.map((product) => product.id);
        setSelectedProducts(allProductIds);
        // Check all individual checkboxes
        document.querySelectorAll(".product-checkbox").forEach((checkbox) => {
          checkbox.checked = true;
        });
      } else {
        // If "select all" is unchecked, clear the selectedProducts array
        setSelectedProducts([]);
        // Uncheck all individual checkboxes
        document.querySelectorAll(".product-checkbox").forEach((checkbox) => {
          checkbox.checked = false;
        });
      }
    } else {
      // If an individual checkbox is checked/unchecked
      if (isChecked) {
        setSelectedProducts((prevSelected) => [...prevSelected, productId]);
      } else {
        setSelectedProducts((prevSelected) =>
          prevSelected.filter((id) => id !== productId)
        );
      }
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.warn("No products selected for deletion.");
      return;
    }
  
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      for (const productId of selectedProducts) {
        await deleteProduct(productId);
      }
      setSelectedProducts([]); // Clear selected products after deletion
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchStats();
  }, [filters, page]);

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
              <input type="checkbox" className="product-checkbox" />
            </th>
            {/* <th>Product ID</th> */}
            {/* <th>Image</th> */}
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
                  className="delete-button" onClick={() => confirmDelete(product.id)}
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
