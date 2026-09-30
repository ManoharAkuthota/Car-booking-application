import axios from 'axios';
import { INITIAL_VEHICLES, DEMO_USERS, DEMO_DRIVERS } from './mockData';
import { emitDispatchEvent } from '../utils/dispatchEvents';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
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

// In-memory / localStorage fleet state helper
const getStoredCars = () => {
  const stored = localStorage.getItem('drivepulse_cars');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  localStorage.setItem('drivepulse_cars', JSON.stringify(INITIAL_VEHICLES));
  return INITIAL_VEHICLES;
};

const getStoredBookings = () => {
  const stored = localStorage.getItem('drivepulse_bookings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return [];
};

const saveBookings = (bookings) => {
  localStorage.setItem('drivepulse_bookings', JSON.stringify(bookings));
};

export const authApi = {
  login: async (data) => {
    try {
      return await api.post('/auth/login', data);
    } catch (err) {
      console.warn("Backend unavailable, using simulated authentication:", err.message);
      let user = DEMO_USERS.customer;
      if (data.email?.includes('driver')) user = DEMO_USERS.driver;
      if (data.email?.includes('admin')) user = DEMO_USERS.admin;
      const simToken = `sim_jwt_${btoa(JSON.stringify(user))}`;
      localStorage.setItem('drivepulse_token', simToken);
      localStorage.setItem('drivepulse_user', JSON.stringify(user));
      return { data: { token: simToken, user } };
    }
  },
  register: async (data) => {
    try {
      return await api.post('/auth/register', data);
    } catch (err) {
      console.warn("Backend unavailable, registering user in simulation mode");
      const user = {
        id: Date.now(),
        fullName: data.fullName || 'New Rider',
        email: data.email,
        role: data.role || 'ROLE_CUSTOMER',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };
      const simToken = `sim_jwt_${btoa(JSON.stringify(user))}`;
      localStorage.setItem('drivepulse_token', simToken);
      localStorage.setItem('drivepulse_user', JSON.stringify(user));
      return { data: { token: simToken, user } };
    }
  },
  getMe: async () => {
    try {
      return await api.get('/auth/me');
    } catch (err) {
      const stored = localStorage.getItem('drivepulse_user');
      if (stored) {
        return { data: JSON.parse(stored) };
      }
      return { data: DEMO_USERS.customer };
    }
  },
};

export const carApi = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/cars', { params });
      if (!res.data || typeof res.data === 'string') throw new Error('Invalid JSON response');
      return res;
    } catch (err) {
      console.warn("Backend unavailable, loading local fleet vehicles:", err.message);
      let list = getStoredCars();
      if (params.category && params.category !== 'ALL') {
        list = list.filter((c) => c.category === params.category);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((c) => c.make.toLowerCase().includes(q) || c.model.toLowerCase().includes(q));
      }
      if (params.seats) {
        list = list.filter((c) => c.seats >= Number(params.seats));
      }
      return { data: list };
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/cars/${id}`);
    } catch (err) {
      const list = getStoredCars();
      const car = list.find((c) => c.id === Number(id)) || list[0];
      return { data: car };
    }
  },
  create: async (data) => {
    try {
      return await api.post('/cars', data);
    } catch (err) {
      const list = getStoredCars();
      const newCar = { ...data, id: Date.now(), rating: 5.0, totalTrips: 0, status: 'AVAILABLE' };
      list.push(newCar);
      localStorage.setItem('drivepulse_cars', JSON.stringify(list));
      return { data: newCar };
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/cars/${id}`, data);
    } catch (err) {
      const list = getStoredCars();
      const idx = list.findIndex((c) => c.id === Number(id));
      if (idx !== -1) list[idx] = { ...list[idx], ...data };
      localStorage.setItem('drivepulse_cars', JSON.stringify(list));
      return { data: list[idx] };
    }
  },
  updateStatus: async (id, status) => {
    try {
      return await api.patch(`/cars/${id}/status`, { status });
    } catch (err) {
      let list = getStoredCars();
      const idx = list.findIndex((c) => c.id === Number(id));
      if (idx !== -1) {
        list[idx] = { ...list[idx], status };
        localStorage.setItem('drivepulse_cars', JSON.stringify(list));
        return { data: list[idx] };
      }
      return { data: { id, status } };
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/cars/${id}`);
    } catch (err) {
      let list = getStoredCars();
      list = list.filter((c) => c.id !== Number(id));
      localStorage.setItem('drivepulse_cars', JSON.stringify(list));
      return { data: { success: true } };
    }
  },
};

export const bookingApi = {
  estimateFare: async (data) => {
    try {
      return await api.post('/bookings/estimate-fare', data);
    } catch (err) {
      // Calculate realistic distance via coordinates
      const lat1 = data.pickupLat || 12.9784;
      const lon1 = data.pickupLng || 77.6408;
      const lat2 = data.dropoffLat || 13.1986;
      const lon2 = data.dropoffLng || 77.7066;

      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceKm = Math.round((R * c * 1.3) * 10) / 10 || 12.5;

      const cars = getStoredCars();
      const car = cars.find((c) => c.id === Number(data.carId)) || cars[0];

      const baseFare = car.baseFare || 25;
      const distanceFare = Math.round(distanceKm * car.pricePerKm * 100) / 100;
      const subtotal = baseFare + distanceFare;
      const taxFare = Math.round(subtotal * 0.05 * 100) / 100;
      const totalFare = Math.round((subtotal + taxFare) * 100) / 100;
      const estimatedDurationMins = Math.round(distanceKm * 2.2);

      return {
        data: {
          carId: car.id,
          distanceKm,
          estimatedDurationMins,
          baseFare,
          distanceFare,
          taxFare,
          totalFare,
        }
      };
    }
  },
  createBooking: async (data) => {
    try {
      const res = await api.post('/bookings', data);
      if (!res.data || typeof res.data === 'string') throw new Error('Invalid JSON response');
      return res;
    } catch (err) {
      const cars = getStoredCars();
      const car = cars.find((c) => c.id === Number(data.carId)) || cars[0];
      const bookings = getStoredBookings();

      const newBooking = {
        id: Date.now(),
        bookingCode: `DP-${Math.floor(100000 + Math.random() * 900000)}`,
        status: data.status || 'REQUESTED',
        otp: String(Math.floor(1000 + Math.random() * 9000)),
        customer: DEMO_USERS.customer,
        driver: data.status === 'ACCEPTED' ? DEMO_USERS.driver : null,
        car,
        pickupAddress: data.pickupAddress || 'Indiranagar 100ft Rd',
        dropoffAddress: data.dropoffAddress || 'Kempegowda Airport (BLR)',
        pickupLat: data.pickupLat || 12.9784,
        pickupLng: data.pickupLng || 77.6408,
        dropoffLat: data.dropoffLat || 13.1986,
        dropoffLng: data.dropoffLng || 77.7066,
        distanceKm: data.distanceKm || 15.2,
        estimatedDurationMins: data.estimatedDurationMins || 28,
        baseFare: car.baseFare,
        distanceFare: Math.round((data.distanceKm || 15.2) * car.pricePerKm * 100) / 100,
        taxFare: Math.round(((car.baseFare + (data.distanceKm || 15.2) * car.pricePerKm) * 0.05) * 100) / 100,
        totalFare: Math.round(((car.baseFare + (data.distanceKm || 15.2) * car.pricePerKm) * 1.05) * 100) / 100,
        paymentMethod: data.paymentMethod || 'UPI',
        specialInstructions: data.specialInstructions || '',
        createdAt: new Date().toISOString(),
      };

      bookings.unshift(newBooking);
      saveBookings(bookings);
      try {
        emitDispatchEvent({ type: 'RIDE_REQUESTED', booking: newBooking });
      } catch (e) {}
      return { data: newBooking };
    }
  },
  getMyBookings: async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      if (!res.data || typeof res.data === 'string') throw new Error('Invalid JSON response');
      return res;
    } catch (err) {
      return { data: getStoredBookings() };
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/bookings/${id}`);
    } catch (err) {
      const bookings = getStoredBookings();
      const b = bookings.find((x) => x.id === Number(id)) || bookings[0];
      return { data: b };
    }
  },
  getByCode: async (code) => {
    try {
      return await api.get(`/bookings/code/${code}`);
    } catch (err) {
      const bookings = getStoredBookings();
      const b = bookings.find((x) => x.bookingCode === code) || bookings[0];
      return { data: b };
    }
  },
  updateStatus: async (id, data) => {
    try {
      return await api.patch(`/bookings/${id}/status`, data);
    } catch (err) {
      const bookings = getStoredBookings();
      const idx = bookings.findIndex((x) => x.id === Number(id));
      if (idx !== -1) {
        bookings[idx].status = data.status;
        saveBookings(bookings);
        return { data: bookings[idx] };
      }
      return { data: { status: data.status } };
    }
  },
  cancelBooking: async (id) => {
    try {
      return await api.post(`/bookings/${id}/cancel`);
    } catch (err) {
      const bookings = getStoredBookings();
      const idx = bookings.findIndex((x) => x.id === Number(id));
      if (idx !== -1) {
        bookings[idx].status = 'CANCELLED';
        saveBookings(bookings);
        return { data: bookings[idx] };
      }
      return { data: { success: true } };
    }
  },
};

export const driverApi = {
  getProfile: async () => {
    try {
      return await api.get('/driver/profile');
    } catch (err) {
      return { data: DEMO_USERS.driver };
    }
  },
  updateStatus: async (data) => {
    try {
      return await api.post('/driver/location', data);
    } catch (err) {
      return { data: { success: true } };
    }
  },
  getPendingRequests: async () => {
    try {
      return await api.get('/driver/pending-requests');
    } catch (err) {
      const bookings = getStoredBookings();
      return { data: bookings.filter((b) => b.status === 'REQUESTED') };
    }
  },
  getMyTrips: async () => {
    try {
      return await api.get('/driver/my-trips');
    } catch (err) {
      const bookings = getStoredBookings();
      return { data: bookings.filter((b) => b.status !== 'REQUESTED' && b.status !== 'CANCELLED') };
    }
  },
  acceptTrip: async (bookingId) => {
    try {
      return await api.post(`/driver/accept/${bookingId}`);
    } catch (err) {
      const bookings = getStoredBookings();
      const idx = bookings.findIndex((b) => b.id === Number(bookingId));
      if (idx !== -1) {
        bookings[idx].status = 'ACCEPTED';
        bookings[idx].driver = DEMO_USERS.driver;
        saveBookings(bookings);
        try {
          emitDispatchEvent({ type: 'RIDE_ACCEPTED', booking: bookings[idx] });
        } catch (e) {}
        return { data: bookings[idx] };
      }
      return { data: { success: true } };
    }
  },
  getStats: async () => {
    try {
      return await api.get('/driver/stats');
    } catch (err) {
      const bookings = getStoredBookings();
      const completed = bookings.filter((b) => b.status === 'COMPLETED');
      const earnings = completed.reduce((sum, b) => sum + (b.totalFare || 0), 2840);
      return {
        data: {
          totalTrips: completed.length + 14,
          todayEarnings: earnings,
          rating: 4.92,
          isOnline: true,
        }
      };
    }
  },
};

export const adminApi = {
  getStats: async () => {
    try {
      return await api.get('/admin/stats');
    } catch (err) {
      const bookings = getStoredBookings();
      const completed = bookings.filter((b) => b.status === 'COMPLETED');
      const totalRevenue = completed.reduce((sum, b) => sum + (b.totalFare || 0), 8420.50);
      return {
        data: {
          totalBookings: bookings.length + 28,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalCars: 10,
          totalDrivers: 4,
          activeTrips: bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS').length,
        }
      };
    }
  },
  getDrivers: async () => {
    try {
      const res = await api.get('/admin/drivers');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return {
          data: res.data.map((d, index) => {
            const fallback = DEMO_DRIVERS.find((m) => m.id === d.id) || DEMO_DRIVERS[index % DEMO_DRIVERS.length];
            return {
              ...fallback,
              ...d,
              reviews: d.reviews || fallback.reviews,
              tripHistory: d.tripHistory || fallback.tripHistory,
            };
          })
        };
      }
      return { data: DEMO_DRIVERS };
    } catch (err) {
      return { data: DEMO_DRIVERS };
    }
  },
  getDriverById: async (id) => {
    try {
      const res = await api.get(`/admin/drivers/${id}`);
      return res;
    } catch (err) {
      const driver = DEMO_DRIVERS.find((d) => d.id === Number(id)) || DEMO_DRIVERS[0];
      return { data: driver };
    }
  },
  getDriverTrips: async (driverId) => {
    try {
      const res = await api.get(`/admin/drivers/${driverId}/trips`);
      return res;
    } catch (err) {
      const driver = DEMO_DRIVERS.find((d) => d.id === Number(driverId)) || DEMO_DRIVERS[0];
      return { data: driver.tripHistory || [] };
    }
  },
  getTripDetails: async (tripId) => {
    try {
      const res = await api.get(`/bookings/${tripId}`);
      return res;
    } catch (err) {
      for (const d of DEMO_DRIVERS) {
        const trip = (d.tripHistory || []).find((t) => t.id === Number(tripId) || t.bookingCode === tripId);
        if (trip) return { data: trip };
      }
      const stored = getStoredBookings();
      const b = stored.find((t) => t.id === Number(tripId) || t.bookingCode === tripId);
      if (b) return { data: b };
      return { data: DEMO_DRIVERS[0].tripHistory[0] };
    }
  },
  verifyDriver: async (id, status) => {
    try {
      return await api.patch(`/admin/drivers/${id}/verify`, { status });
    } catch (err) {
      return { data: { id, status } };
    }
  },
  getAllTrips: async () => {
    try {
      return await api.get('/admin/trips');
    } catch (err) {
      return { data: getStoredBookings() };
    }
  },
};

export default api;
