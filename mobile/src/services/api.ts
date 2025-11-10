import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.mototaxi.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        await AsyncStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Si falla el refresh, cerrar sesión
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  verifyOtp: (data: any) => api.post('/auth/verify-otp', data),
  login: (data: any) => api.post('/auth/login', data),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
};

// Viajes API
export const viajesApi = {
  solicitar: (data: any) => api.post('/viajes/solicitar', data),
  obtener: (id: string) => api.get(`/viajes/${id}`),
  iniciar: (id: string) => api.post(`/viajes/${id}/iniciar`),
  finalizar: (id: string) => api.post(`/viajes/${id}/finalizar`),
  calificar: (id: string, data: any) => api.post(`/viajes/${id}/calificar`, data),
  cancelar: (id: string, data: any) => api.post(`/viajes/${id}/cancelar`, data),
};

// Ofertas API
export const ofertasApi = {
  crear: (data: any) => api.post('/ofertas', data),
  aceptar: (id: string) => api.put(`/ofertas/${id}/aceptar`),
  rechazar: (id: string) => api.put(`/ofertas/${id}/rechazar`),
  contraoferta: (id: string, data: any) =>
    api.put(`/ofertas/${id}/contraoferta`, data),
  obtenerPorViaje: (viajeId: string) =>
    api.get(`/ofertas/viaje/${viajeId}`),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getViajes: (params?: any) => api.get('/users/viajes', { params }),
  getEstadisticas: () => api.get('/users/estadisticas'),
  getFavoritos: () => api.get('/users/favoritos'),
  addFavorito: (data: any) => api.post('/users/favoritos', data),
  removeFavorito: (id: string) => api.delete(`/users/favoritos/${id}`),
};

// Conductores API
export const conductoresApi = {
  registrar: (data: any) => api.post('/conductores/registrar', data),
  actualizarDisponibilidad: (data: any) =>
    api.put('/conductores/disponibilidad', data),
  obtenerCercanos: (params: any) =>
    api.get('/conductores/cercanos', { params }),
};
