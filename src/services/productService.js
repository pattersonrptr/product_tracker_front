const getAccessToken = () => localStorage.getItem('accessToken');
const API_BASE_URL = 'http://localhost:8000';


export const fetchProductsService = async (filters, page, itemsPerPage) => {
  const accessToken = getAccessToken();
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

  try {
    const response = await fetch(`${API_BASE_URL}/products/filter/?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch products:", response.status);
      if (response.status === 401 || response.status === 403) {
        return { error: 'unauthorized' };
      }
      return { error: 'fetch_failed' };
    }

    const data = await response.json();
    return { data };

  } catch (error) {
    console.error("Error fetching products:", error);
    return { error: 'network_error' };
  }
};


export const fetchStatsService = async () => {
  const accessToken = getAccessToken();
  try {
    const response = await fetch(`${API_BASE_URL}/products/stats/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    if (!response.ok) {
      console.error("Failed to fetch stats:", response.status);
      return { error: 'fetch_failed' };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { error: 'network_error' };
  }
};


export const deleteProductService = async (productId) => {
  const accessToken = getAccessToken();
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/`,
      {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );
    return response.ok;
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    return false;
  }
};
