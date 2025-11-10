import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.mototaxi.com';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  async connect(userId: string, userType: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        userId,
        userType,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
    });

    // Restaurar listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      this.socket?.off(event, callback as any);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket no conectado. No se puede emitir:', event);
    }
  }

  // Métodos específicos de la app
  unirseViaje(viajeId: string) {
    this.emit('unirse_viaje', { viajeId });
  }

  actualizarUbicacion(viajeId: string, ubicacion: any) {
    this.emit('actualizar_ubicacion', { viajeId, ubicacion });
  }

  enviarMensaje(viajeId: string, mensaje: string) {
    this.emit('enviar_mensaje', { viajeId, mensaje });
  }

  // Listeners de eventos específicos
  onNuevaOferta(callback: (oferta: any) => void) {
    this.on('nueva_oferta', callback);
  }

  onNuevaSolicitud(callback: (viaje: any) => void) {
    this.on('nueva_solicitud', callback);
  }

  onUbicacionConductor(callback: (ubicacion: any) => void) {
    this.on('ubicacion_conductor', callback);
  }

  onOfertaAceptada(callback: (viaje: any) => void) {
    this.on('oferta_aceptada', callback);
  }

  onEstadoViajeActualizado(callback: (data: any) => void) {
    this.on('estado_viaje_actualizado', callback);
  }

  onNuevoMensaje(callback: (mensaje: any) => void) {
    this.on('nuevo_mensaje', callback);
  }
}

export default new SocketService();
