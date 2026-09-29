import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('drivepulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('drivepulse_token');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const carApi = {
  getAll: (params) => api.get('/cars', { params }),
  getById: (id) => api.get(`/cars/${id}`),
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
  delete: (id) => api.delete(`/cars/${id}`),
};

export const bookingApi = {
  estimateFare: (data) => api.post('/bookings/estimate-fare', data),
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getByCode: (code) => api.get(`/bookings/code/${code}`),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel`),
};

export const driverApi = {
  getProfile: () => api.get('/driver/profile'),
  updateStatus: (data) => api.post('/driver/location', data),
  getPendingRequests: () => api.get('/driver/pending-requests'),
  getMyTrips: () => api.get('/driver/my-trips'),
  acceptTrip: (bookingId) => api.post(`/driver/accept/${bookingId}`),
  getStats: () => api.get('/driver/stats'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getDrivers: () => api.get('/admin/drivers'),
  verifyDriver: (id, status) => api.patch(`/admin/drivers/${id}/verify`, { status }),
  getAllTrips: () => api.get('/admin/trips'),
};

export default api;
