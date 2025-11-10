import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { viajesApi } from '../../services/api';

interface Viaje {
  id: string;
  codigoViaje: string;
  estado: string;
  origenDireccion: string;
  destinoDireccion: string;
  precioSugerido: number;
  precioInicialPasajero: number;
  precioFinalAcordado?: number;
  distanciaKm: number;
  conductor?: any;
  pasajero?: any;
}

interface ViajesState {
  viajeActual: Viaje | null;
  historial: Viaje[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ViajesState = {
  viajeActual: null,
  historial: [],
  isLoading: false,
  error: null,
};

export const solicitarViaje = createAsyncThunk(
  'viajes/solicitar',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await viajesApi.solicitar(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al solicitar viaje');
    }
  }
);

export const obtenerViaje = createAsyncThunk(
  'viajes/obtener',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await viajesApi.obtener(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener viaje');
    }
  }
);

export const calificarViaje = createAsyncThunk(
  'viajes/calificar',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await viajesApi.calificar(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al calificar');
    }
  }
);

export const cancelarViaje = createAsyncThunk(
  'viajes/cancelar',
  async ({ id, motivo }: { id: string; motivo: string }, { rejectWithValue }) => {
    try {
      const response = await viajesApi.cancelar(id, { motivo });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cancelar');
    }
  }
);

const viajesSlice = createSlice({
  name: 'viajes',
  initialState,
  reducers: {
    setViajeActual: (state, action) => {
      state.viajeActual = action.payload;
    },
    clearViajeActual: (state) => {
      state.viajeActual = null;
    },
    updateViajeEstado: (state, action) => {
      if (state.viajeActual) {
        state.viajeActual.estado = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Solicitar viaje
    builder
      .addCase(solicitarViaje.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(solicitarViaje.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viajeActual = action.payload;
      })
      .addCase(solicitarViaje.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Obtener viaje
    builder
      .addCase(obtenerViaje.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(obtenerViaje.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viajeActual = action.payload;
      })
      .addCase(obtenerViaje.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Calificar viaje
    builder
      .addCase(calificarViaje.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(calificarViaje.fulfilled, (state) => {
        state.isLoading = false;
        state.viajeActual = null;
      })
      .addCase(calificarViaje.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancelar viaje
    builder
      .addCase(cancelarViaje.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelarViaje.fulfilled, (state) => {
        state.isLoading = false;
        state.viajeActual = null;
      })
      .addCase(cancelarViaje.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setViajeActual, clearViajeActual, updateViajeEstado } =
  viajesSlice.actions;
export default viajesSlice.reducer;
