import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EstadoOferta, EstadoViaje } from '@prisma/client';

export interface CrearOfertaDto {
  viajeId: string;
  precioOfertado: number;
  tiempoLlegadaEstimado?: number;
  mensaje?: string;
}

@Injectable()
export class OfertasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear oferta de conductor para un viaje
   */
  async crearOferta(conductorId: string, crearOfertaDto: CrearOfertaDto) {
    const { viajeId, precioOfertado, tiempoLlegadaEstimado, mensaje } = crearOfertaDto;

    // Verificar que el viaje existe y está en estado correcto
    const viaje = await this.prisma.viaje.findUnique({
      where: { id: viajeId },
    });

    if (!viaje) {
      throw new NotFoundException('Viaje no encontrado');
    }

    if (viaje.estado !== EstadoViaje.esperando_ofertas && viaje.estado !== EstadoViaje.negociando) {
      throw new BadRequestException('El viaje no está aceptando ofertas');
    }

    // Verificar límite de ofertas
    const ofertasCount = await this.prisma.ofertaViaje.count({
      where: { viajeId },
    });

    if (ofertasCount >= 10) {
      throw new BadRequestException('Se ha alcanzado el límite de ofertas para este viaje');
    }

    // Verificar si el conductor ya hizo una oferta
    const ofertaExistente = await this.prisma.ofertaViaje.findUnique({
      where: {
        viajeId_conductorId: {
          viajeId,
          conductorId,
        },
      },
    });

    if (ofertaExistente) {
      throw new BadRequestException('Ya has hecho una oferta para este viaje');
    }

    // Crear oferta
    const oferta = await this.prisma.ofertaViaje.create({
      data: {
        viajeId,
        conductorId,
        precioOfertado,
        tiempoLlegadaEstimado,
        mensaje,
        fechaExpiracion: new Date(Date.now() + 3 * 60 * 1000), // 3 minutos
      },
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
    });

    // Actualizar estado del viaje
    if (viaje.estado === EstadoViaje.esperando_ofertas) {
      await this.prisma.viaje.update({
        where: { id: viajeId },
        data: { estado: EstadoViaje.negociando },
      });
    }

    // TODO: Notificar al pasajero via WebSocket

    return oferta;
  }

  /**
   * Aceptar oferta (por parte del pasajero)
   */
  async aceptarOferta(ofertaId: string, pasajeroId: string) {
    const oferta = await this.prisma.ofertaViaje.findUnique({
      where: { id: ofertaId },
      include: {
        viaje: true,
        conductor: true,
      },
    });

    if (!oferta) {
      throw new NotFoundException('Oferta no encontrada');
    }

    if (oferta.viaje.pasajeroId !== pasajeroId) {
      throw new ForbiddenException('No tiene permisos para aceptar esta oferta');
    }

    if (oferta.estado !== EstadoOferta.pendiente) {
      throw new BadRequestException('La oferta no está disponible');
    }

    // Verificar expiración
    if (oferta.fechaExpiracion && new Date() > oferta.fechaExpiracion) {
      await this.prisma.ofertaViaje.update({
        where: { id: ofertaId },
        data: { estado: EstadoOferta.expirada },
      });
      throw new BadRequestException('La oferta ha expirado');
    }

    // Actualizar oferta
    await this.prisma.ofertaViaje.update({
      where: { id: ofertaId },
      data: {
        estado: EstadoOferta.aceptada,
        fechaRespuesta: new Date(),
      },
    });

    // Rechazar otras ofertas
    await this.prisma.ofertaViaje.updateMany({
      where: {
        viajeId: oferta.viajeId,
        id: { not: ofertaId },
        estado: EstadoOferta.pendiente,
      },
      data: { estado: EstadoOferta.rechazada },
    });

    // Actualizar viaje
    const viajeActualizado = await this.prisma.viaje.update({
      where: { id: oferta.viajeId },
      data: {
        conductorId: oferta.conductorId,
        precioFinalAcordado: oferta.precioOfertado,
        estado: EstadoViaje.aceptado,
        fechaAceptacion: new Date(),
      },
      include: {
        conductor: {
          include: {
            usuario: true,
          },
        },
        pasajero: true,
      },
    });

    // Actualizar disponibilidad del conductor
    await this.prisma.conductor.update({
      where: { id: oferta.conductorId },
      data: { enServicio: true },
    });

    // TODO: Notificar al conductor via WebSocket

    return viajeActualizado;
  }

  /**
   * Rechazar oferta
   */
  async rechazarOferta(ofertaId: string, pasajeroId: string) {
    const oferta = await this.prisma.ofertaViaje.findUnique({
      where: { id: ofertaId },
      include: { viaje: true },
    });

    if (!oferta) {
      throw new NotFoundException('Oferta no encontrada');
    }

    if (oferta.viaje.pasajeroId !== pasajeroId) {
      throw new ForbiddenException('No tiene permisos');
    }

    return this.prisma.ofertaViaje.update({
      where: { id: ofertaId },
      data: {
        estado: EstadoOferta.rechazada,
        fechaRespuesta: new Date(),
      },
    });
  }

  /**
   * Hacer contraoferta
   */
  async hacerContraoferta(ofertaId: string, pasajeroId: string, contraofertaPrecio: number, mensaje?: string) {
    const oferta = await this.prisma.ofertaViaje.findUnique({
      where: { id: ofertaId },
      include: { viaje: true },
    });

    if (!oferta) {
      throw new NotFoundException('Oferta no encontrada');
    }

    if (oferta.viaje.pasajeroId !== pasajeroId) {
      throw new ForbiddenException('No tiene permisos');
    }

    const ofertaActualizada = await this.prisma.ofertaViaje.update({
      where: { id: ofertaId },
      data: {
        estado: EstadoOferta.contraoferta,
        contraofertaPrecio,
        contraofertaMensaje: mensaje,
        fechaRespuesta: new Date(),
      },
    });

    // TODO: Notificar al conductor via WebSocket

    return ofertaActualizada;
  }

  /**
   * Obtener ofertas de un viaje
   */
  async obtenerOfertasViaje(viajeId: string) {
    return this.prisma.ofertaViaje.findMany({
      where: { viajeId },
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
    });
  }
}
