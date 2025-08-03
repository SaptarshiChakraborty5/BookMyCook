import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const register = (userData: any) => api.post('/signup', userData);
export const login = (credentials: any) => api.post('/signin', credentials);
export const getCurrentUser = () => api.get('/users/me');
export const updateProfile = (userData: any) => api.put('/users/me', userData);

// Chef API
export const getChefs = (filters: any = {}) => api.get('/chefs', { params: filters });
export const getChefById = (id: string) => api.get(`/chefs/${id}`);
export const createChefProfile = (profileData: any) => api.post('/chefs/profile', profileData);
export const updateChefProfile = (profileData: any) => api.post('/chefs/profile', profileData);
export const addReview = (chefId: string, reviewData: any) => 
  api.post(`/chefs/${chefId}/reviews`, reviewData);

// Booking API
export const createBooking = (bookingData: any) => api.post('/bookings', bookingData);
export const getBookings = (params: any = {}) => api.get('/bookings', { params });
export const getBookingById = (id: string) => api.get(`/bookings/${id}`);
export const updateBookingStatus = (id: string, status: string) => 
  api.put(`/bookings/${id}/status`, { status });

// Message API
export const sendMessage = (messageData: any) => api.post('/messages', messageData);
export const getMessages = (params: any = {}) => api.get('/messages', { params });
export const markMessagesAsRead = (messageIds: string[]) => 
  api.put('/messages/markRead', { messageIds });

export default api;