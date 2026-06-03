import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT token into headers if it exists in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Unified API Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    return api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return api.post('/auth/logout');
  },
  getMe: () => api.get('/auth/me'),
};

export const cropService = {
  getCrops: (query = '', category = '', status = 'active') => 
    api.get(`/crops?q=${query}&category=${category}&status=${status}`),
  getCropById: (id) => api.get(`/crops/${id}`),
  createCrop: (cropData) => api.post('/crops/create', cropData),
  updateCrop: (id, cropData) => api.put(`/crops/update/${id}`, cropData),
  deleteCrop: (id) => api.delete(`/crops/delete/${id}`),
};

export const orderService = {
  createOrder: (orderData) => api.post('/orders/create', orderData),
  getOrders: () => api.get('/orders'),
  updateOrderStatus: (id, statusData) => api.put(`/orders/update/${id}`, statusData),
};

export const paymentService = {
  createPayment: (paymentData) => api.post('/payments/create', paymentData),
};

export const reviewService = {
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getReviews: (farmerId) => api.get(`/reviews/${farmerId}`),
};

export const chatService = {
  sendMessage: (messageData) => api.post('/chat', messageData),
  getChatHistory: (contactId) => api.get(`/chat/history/${contactId}`),
  getContacts: () => api.get('/chat/contacts'),
};

export const aiService = {
  predictPrice: (predictionData) => api.post('/ai/predict-price', predictionData),
  detectDisease: (imageAnalysisData) => api.post('/ai/detect-disease', imageAnalysisData),
  recommendCrops: () => api.get('/ai/recommend'),
  chatBot: (message) => api.post('/ai/chatbot', { message }),
};

export default api;
