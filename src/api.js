import axios from 'axios';

const BASE_URL = 'https://product-manager-backend-zvel.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Products (templates)
export const getProducts = (params = {}) => api.get('/api/products', { params });
export const getProduct = (code) => api.get(`/api/products/${code}`);
export const createProduct = (data) => api.post('/api/products', data);
export const updateProduct = (code, data) => api.put(`/api/products/${code}`, data);
export const deleteProduct = (code) => api.delete(`/api/products/${code}`);

// Batches
export const getBatches = (productCode) => api.get(`/api/batches/product/${productCode}`);
export const createBatch = (data) => api.post('/api/batches', data);
export const deleteBatch = (id) => api.delete(`/api/batches/${id}`);

// Categories
export const getCategories = () => api.get('/api/categories');
export const createCategory = (data) => api.post('/api/categories', data);

export default api;
