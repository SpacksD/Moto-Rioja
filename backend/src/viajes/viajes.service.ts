import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CrearViajeDto, CalificarViajeDto, CancelarViajeDto } from './dto/crear-viaje.dto';
import { EstadoViaje } from '@prisma/client';
import { nanoid } from 'nanoid';

@Injectable()
export class ViajesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcular precio sugerido basado en distancia y tiempo
   */
  private calcularPrecioSugerido(distanciaKm: number, duracionMin: number): number {
    const tarifaBase = 2.0;
    const precioPorKm = 1.5;
    const precioPorMin = 0.2;
    const precioMinimo = 3.0;

    const precioBase = tarifaBase + (distanciaKm * precioPorKm) + (duracionMin * precioPorMin);

    // Aplicar factores (hora pico, clima, etc.)
    const hora = new Date().getHours();
    let factor = 1.0;

    if ((hora >= 7 && hora <= 9) || (hora >= 17 && hora <= 20)) {
      factor = 1.3; // Hora pico
    }

    return Math.max(precioBase * factor, precioMinimo);
  }

  /**
   * Generar código único de viaje
   */
  private generarCodigoViaje(): string {
    return 'MT' + nanoid(8).toUpperCase();
  }

  /**
   * Crear nueva solicitud de viaje
   */
  async crearViaje(pasajeroId: string, crearViajeDto: CrearViajeDto) {
    // Calcular distancia y tiempo estimado (mockup - integrar Google Maps API)
    const distanciaKm = this.calcularDistancia(
      crearViajeDto.origen.latitud,
      crearViajeDto.origen.longitud,
      crearViajeDto.destino.latitud,
      crearViajeDto.destino.longitud,
    );

    const duracionEstimada = Math.ceil((distanciaKm / 30) * 60); // Asumiendo 30km/h
    const precioSugerido = this.calcularPrecioSugerido(distanciaKm, duracionEstimada);

    // Crear viaje
    const viaje = await this.prisma.viaje.create({
      data: {
        codigoViaje: this.generarCodigoViaje(),
        pasajeroId,
        origenLatitud: crearViajeDto.origen.latitud,
        origenLongitud: crearViajeDto.origen.longitud,
        origenDireccion: crearViajeDto.origen.direccion,
        origenReferencia: crearViajeDto.origen.referencia,
        destinoLatitud: crearViajeDto.destino.latitud,
        destinoLongitud: crearViajeDto.destino.longitud,
        destinoDireccion: crearViajeDto.destino.direccion,
        destinoReferencia: crearViajeDto.destino.referencia,
        distanciaCalculadaKm: distanciaKm,
        duracionEstimada,
        precioSugerido,
        precioInicialPasajero: crearViajeDto.precioInicial,
        metodoPago: crearViajeDto.metodoPago,
        notas: crearViajeDto.notas,
        estado: EstadoViaje.esperando_ofertas,
      },
      include: {
        pasajero: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            fotoPerfil: true,
            calificacionPromedio: true,
          },
        },
      },
    });

    // TODO: Notificar a conductores cercanos via WebSocket

    return viaje;
  }

  /**
   * Obtener detalles de un viaje
   */
  async obtenerViaje(viajeId: string, userId: string) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id: viajeId },
      include: {
        pasajero: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            telefono: true,
            fotoPerfil: true,
            calificacionPromedio: true,
          },
        },
        conductor: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellidos: true,
                telefono: true,
                fotoPerfil: true,
                calificacionPromedio: true,
              },
            },
          },
        },
        ofertas: {
          include: {
            conductor: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellidos: true,
                    fotoPerfil: true,
                    calificacionPromedio: true,
                  },
                },
              },
            },
          },
          orderBy: { precioOfertado: 'asc' },
        },
      },
    });

    if (!viaje) {
      throw new NotFoundException('Viaje no encontrado');
    }

    // Verificar permisos
    const conductor = await this.prisma.conductor.findUnique({
      where: { usuarioId: userId },
    });

    const tienePermiso =
      viaje.pasajeroId === userId ||
      viaje.conductorId === conductor?.id;

    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para ver este viaje');
    }

    return viaje;
  }

  /**
   * Iniciar viaje (conductor confirma inicio)
   */
  async iniciarViaje(viajeId: string, conductorId: string) {
    const conductor = await this.prisma.conductor.findUnique({
      where: { id: conductorId },
    });

    const viaje = await this.prisma.viaje.findUnique({
      where: { id: viajeId },
    });

    if (!viaje || viaje.conductorId !== conductorId) {
      throw new ForbiddenException('No autorizado');
    }

    if (viaje.estado !== EstadoViaje.conductor_llegado) {
      throw new BadRequestException('El viaje no está en estado correcto para iniciar');
    }

    return this.prisma.viaje.update({
      where: { id: viajeId },
      data: {
        estado: EstadoViaje.viaje_iniciado,
        fechaInicioViaje: new Date(),
      },
    });
  }

  /**
   * Finalizar viaje
   */
  async finalizarViaje(viajeId: string, conductorId: string) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id: viajeId },
    });

    if (!viaje || viaje.conductorId !== conductorId) {
      throw new ForbiddenException('No autorizado');
    }

    if (viaje.estado !== EstadoViaje.viaje_iniciado) {
      throw new BadRequestException('El viaje no está en estado de viaje iniciado');
    }

    // Calcular duración real
    const duracionReal = viaje.fechaInicioViaje
      ? Math.floor((new Date().getTime() - viaje.fechaInicioViaje.getTime()) / 60000)
      : null;

    const viajeActualizado = await this.prisma.viaje.update({
      where: { id: viajeId },
      data: {
        estado: EstadoViaje.viaje_completado,
        fechaFinViaje: new Date(),
        duracionReal,
      },
      include: {
        pasajero: true,
        conductor: {
          include: {
            usuario: true,
          },
        },
      },
    });

    // Actualizar estadísticas
    await Promise.all([
      this.prisma.usuario.update({
        where: { id: viaje.pasajeroId },
        data: { totalViajes: { increment: 1 } },
      }),
      this.prisma.conductor.update({
        where: { id: conductorId },
        data: {
          viajesCompletados: { increment: 1 },
          saldoGanado: { increment: Number(viaje.precioFinalAcordado) },
        },
      }),
    ]);

    return viajeActualizado;
  }

  /**
   * Calificar viaje
   */
  async calificarViaje(
    viajeId: string,
    userId: string,
    tipoUsuario: string,
    calificarDto: CalificarViajeDto,
  ) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id: viajeId },
    });

    if (!viaje) {
      throw new NotFoundException('Viaje no encontrado');
    }

    if (viaje.estado !== EstadoViaje.viaje_completado) {
      throw new BadRequestException('Solo se pueden calificar viajes completados');
    }

    const conductor = await this.prisma.conductor.findUnique({
      where: { usuarioId: userId },
    });

    // Verificar permisos y actualizar calificación correspondiente
    if (tipoUsuario === 'pasajero' && viaje.pasajeroId === userId) {
      return this.prisma.viaje.update({
        where: { id: viajeId },
        data: {
          calificacionConductor: calificarDto.calificacion,
          comentarioConductor: calificarDto.comentario,
          propina: calificarDto.propina || 0,
        },
      });
    } else if (tipoUsuario === 'conductor' && viaje.conductorId === conductor?.id) {
      return this.prisma.viaje.update({
        where: { id: viajeId },
        data: {
          calificacionPasajero: calificarDto.calificacion,
          comentarioPasajero: calificarDto.comentario,
        },
      });
    } else {
      throw new ForbiddenException('No tiene permisos para calificar este viaje');
    }
  }

  /**
   * Cancelar viaje
   */
  async cancelarViaje(viajeId: string, userId: string, tipoUsuario: string, cancelarDto: CancelarViajeDto) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id: viajeId },
    });

    if (!viaje) {
      throw new NotFoundException('Viaje no encontrado');
    }

    const conductor = await this.prisma.conductor.findUnique({
      where: { usuarioId: userId },
    });

    // Determinar quién cancela
    let nuevoEstado: EstadoViaje;
    if (viaje.pasajeroId === userId) {
      nuevoEstado = EstadoViaje.cancelado_pasajero;
    } else if (viaje.conductorId === conductor?.id) {
      nuevoEstado = EstadoViaje.cancelado_conductor;
      // Incrementar contador de cancelaciones del conductor
      await this.prisma.conductor.update({
        where: { id: conductor.id },
        data: { viajesCancelados: { increment: 1 } },
      });
    } else {
      throw new ForbiddenException('No tiene permisos para cancelar este viaje');
    }

    return this.prisma.viaje.update({
      where: { id: viajeId },
      data: {
        estado: nuevoEstado,
        motivoCancelacion: cancelarDto.motivo,
        fechaCancelacion: new Date(),
      },
    });
  }

  /**
   * Calcular distancia entre dos puntos (fórmula de Haversine)
   */
  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    return Math.round(distancia * 100) / 100;
  }

  private toRad(valor: number): number {
    return valor * Math.PI / 180;
  }
}
