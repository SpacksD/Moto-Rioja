import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocketGateway');
  private usuariosConectados: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    const userType = client.handshake.auth.userType;

    this.logger.log(`Cliente conectado: ${client.id} (User: ${userId}, Type: ${userType})`);

    if (userId) {
      this.usuariosConectados.set(userId, client);
      client.join(`user:${userId}`);

      if (userType === 'conductor') {
        client.join('conductores');
      } else if (userType === 'pasajero') {
        client.join('pasajeros');
      }
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId;
    this.logger.log(`Cliente desconectado: ${client.id}`);

    if (userId) {
      this.usuariosConectados.delete(userId);
    }
  }

  @SubscribeMessage('actualizar_ubicacion')
  handleUbicacionUpdate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { viajeId, ubicacion } = data;

    // Emitir ubicación al pasajero
    this.server.to(`viaje:${viajeId}`).emit('ubicacion_conductor', {
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      rumbo: ubicacion.rumbo,
      velocidad: ubicacion.velocidad,
    });

    return { success: true };
  }

  @SubscribeMessage('unirse_viaje')
  handleUnirseViaje(
    @MessageBody() data: { viajeId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`viaje:${data.viajeId}`);
    this.logger.log(`Cliente ${client.id} se unió al viaje ${data.viajeId}`);
    return { success: true };
  }

  @SubscribeMessage('enviar_mensaje')
  handleMensaje(
    @MessageBody() data: { viajeId: string; mensaje: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`viaje:${data.viajeId}`).emit('nuevo_mensaje', {
      mensaje: data.mensaje,
      timestamp: new Date(),
    });

    return { success: true };
  }

  // Métodos auxiliares para emitir eventos desde servicios

  emitirNuevaSolicitud(conductoresIds: string[], viaje: any) {
    conductoresIds.forEach((conductorId) => {
      this.server.to(`user:${conductorId}`).emit('nueva_solicitud', viaje);
    });
  }

  emitirNuevaOferta(pasajeroId: string, oferta: any) {
    this.server.to(`user:${pasajeroId}`).emit('nueva_oferta', oferta);
  }

  emitirOfertaAceptada(conductorId: string, viaje: any) {
    this.server.to(`user:${conductorId}`).emit('oferta_aceptada', viaje);
  }

  emitirEstadoViaje(viajeId: string, estado: string, data?: any) {
    this.server.to(`viaje:${viajeId}`).emit('estado_viaje_actualizado', {
      estado,
      ...data,
    });
  }
}
