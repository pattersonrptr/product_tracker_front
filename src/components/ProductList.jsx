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
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString));
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

      <table className="product-table">
        <thead>
          <tr>
            <th>Product ID</th>
            {/* <th>Image</th> */}
            <th>Source</th>
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
              <td>{product.id}</td>
              {/* <td>{product.image_urls}</td> */}
              <td>{product.source_website_id}</td>
              <td>
                <a href={product.url} target="_blank" rel="noopener noreferrer">
                  {product.title}
                </a>
              </td>
              <td>{product.price}</td>
              <td>{product.condition}</td>
              <td>{product.seller_type}</td>
              <td>{product.location}</td>
              <td>{product.is_available}</td>
              <td>{product.price_history}</td>
              <td>{formatDate(product.created_at)}</td>
              <td>{formatDate(product.updated_at)}</td>
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
