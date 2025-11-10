import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ofertasApi } from '../../services/api';

interface Oferta {
  id: string;
  precioOfertado: number;
  tiempoLlegadaEstimado?: number;
  mensaje?: string;
  estado: string;
  conductor: any;
}

interface OfertasState {
  ofertas: Oferta[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OfertasState = {
  ofertas: [],
  isLoading: false,
  error: null,
};

export const crearOferta = createAsyncThunk(
  'ofertas/crear',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await ofertasApi.crear(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear oferta');
    }
  }
);

export const aceptarOferta = createAsyncThunk(
  'ofertas/aceptar',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ofertasApi.aceptar(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al aceptar oferta');
    }
  }
);

export const rechazarOferta = createAsyncThunk(
  'ofertas/rechazar',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ofertasApi.rechazar(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al rechazar oferta');
    }
  }
);

export const hacerContraoferta = createAsyncThunk(
  'ofertas/contraoferta',
  async (
    { id, precio, mensaje }: { id: string; precio: number; mensaje?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await ofertasApi.contraoferta(id, {
        contraofertaPrecio: precio,
        mensaje,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error en contraoferta');
    }
  }
);

export const obtenerOfertasViaje = createAsyncThunk(
  'ofertas/obtenerPorViaje',
  async (viajeId: string, { rejectWithValue }) => {
    try {
      const response = await ofertasApi.obtenerPorViaje(viajeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener ofertas');
    }
  }
);

const ofertasSlice = createSlice({
  name: 'ofertas',
  initialState,
  reducers: {
    addOferta: (state, action) => {
      state.ofertas.unshift(action.payload);
    },
    clearOfertas: (state) => {
      state.ofertas = [];
    },
  },
  extraReducers: (builder) => {
    // Crear oferta
    builder
      .addCase(crearOferta.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(crearOferta.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(crearOferta.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Aceptar oferta
    builder
      .addCase(aceptarOferta.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(aceptarOferta.fulfilled, (state) => {
        state.isLoading = false;
        state.ofertas = [];
      })
      .addCase(aceptarOferta.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Obtener ofertas
    builder
      .addCase(obtenerOfertasViaje.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(obtenerOfertasViaje.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ofertas = action.payload;
      })
      .addCase(obtenerOfertasViaje.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addOferta, clearOfertas } = ofertasSlice.actions;
export default ofertasSlice.reducer;
