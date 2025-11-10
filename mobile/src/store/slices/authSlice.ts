import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../services/api';
import socketService from '../../services/socket';

interface User {
  id: string;
  telefono: string;
  nombre: string;
  apellidos?: string;
  tipoUsuario: 'pasajero' | 'conductor';
  fotoPerfil?: string;
  calificacionPromedio: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  telefono: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpSent: false,
  telefono: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await authApi.register(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al registrar');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(data);
      const { accessToken, refreshToken, usuario } = response.data;

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(usuario));

      // Conectar WebSocket
      socketService.connect(usuario.id, usuario.tipoUsuario);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Código inválido');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (telefono: string, { rejectWithValue }) => {
    try {
      const response = await authApi.login({ telefono });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al enviar código');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  socketService.disconnect();
});

export const loadStoredAuth = createAsyncThunk('auth/loadStored', async () => {
  const [accessToken, refreshToken, userStr] = await AsyncStorage.multiGet([
    'accessToken',
    'refreshToken',
    'user',
  ]);

  if (accessToken[1] && refreshToken[1] && userStr[1]) {
    const user = JSON.parse(userStr[1]);
    socketService.connect(user.id, user.tipoUsuario);

    return {
      accessToken: accessToken[1],
      refreshToken: refreshToken[1],
      user,
    };
  }

  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOtpSent: (state) => {
      state.otpSent = false;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.telefono = action.payload.telefono;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.usuario;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.otpSent = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.telefono = action.payload.telefono;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      return initialState;
    });

    // Load stored auth
    builder.addCase(loadStoredAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      }
    });
  },
});

export const { clearError, resetOtpSent } = authSlice.actions;
export default authSlice.reducer;
