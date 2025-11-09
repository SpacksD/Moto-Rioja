import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener perfil de usuario
   */
  async getProfile(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        conductor: {
          select: {
            id: true,
            placa: true,
            marcaMoto: true,
            modeloMoto: true,
            estadoVerificacion: true,
            disponible: true,
            calificacionPromedio: true,
            viajesCompletados: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  /**
   * Actualizar perfil
   */
  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const usuario = await this.prisma.usuario.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        telefono: true,
        nombre: true,
        apellidos: true,
        email: true,
        fechaNacimiento: true,
        genero: true,
        fotoPerfil: true,
        tipoUsuario: true,
        estado: true,
        calificacionPromedio: true,
        totalViajes: true,
      },
    });

    return usuario;
  }

  /**
   * Obtener historial de viajes
   */
  async getViajesHistory(userId: string, tipoUsuario: string, limit = 20, offset = 0) {
    const where = tipoUsuario === 'conductor'
      ? { conductor: { usuarioId: userId } }
      : { pasajeroId: userId };

    const viajes = await this.prisma.viaje.findMany({
      where,
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
        conductor: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellidos: true,
                fotoPerfil: true,
                calificacionPromedio: true,
              },
            },
          },
        },
      },
      orderBy: { fechaSolicitud: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.viaje.count({ where });

    return {
      viajes,
      total,
      limit,
      offset,
    };
  }

  /**
   * Obtener estadísticas del usuario
   */
  async getEstadisticas(userId: string, tipoUsuario: string) {
    if (tipoUsuario === 'conductor') {
      return this.getEstadisticasConductor(userId);
    } else {
      return this.getEstadisticasPasajero(userId);
    }
  }

  /**
   * Estadísticas de conductor
   */
  private async getEstadisticasConductor(userId: string) {
    const conductor = await this.prisma.conductor.findUnique({
      where: { usuarioId: userId },
      include: {
        usuario: true,
      },
    });

    if (!conductor) {
      throw new NotFoundException('Conductor no encontrado');
    }

    const viajes = await this.prisma.viaje.findMany({
      where: {
        conductorId: conductor.id,
        estado: 'viaje_completado',
      },
      select: {
        precioFinalAcordado: true,
        calificacionConductor: true,
        distanciaKm: true,
        fechaSolicitud: true,
      },
    });

    const totalGanancias = viajes.reduce(
      (sum, v) => sum + (Number(v.precioFinalAcordado) || 0),
      0,
    );

    const calificacionPromedio = viajes.reduce(
      (sum, v) => sum + (v.calificacionConductor || 0),
      0,
    ) / viajes.length || 0;

    const distanciaTotal = viajes.reduce(
      (sum, v) => sum + (Number(v.distanciaKm) || 0),
      0,
    );

    return {
      viajesCompletados: conductor.viajesCompletados,
      viajesCancelados: conductor.viajesCancelados,
      totalGanancias,
      saldoDisponible: Number(conductor.saldoDisponible),
      calificacionPromedio,
      distanciaTotal,
      tiempoEnLinea: conductor.tiempoEnLinea,
    };
  }

  /**
   * Estadísticas de pasajero
   */
  private async getEstadisticasPasajero(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    const viajes = await this.prisma.viaje.findMany({
      where: {
        pasajeroId: userId,
        estado: 'viaje_completado',
      },
      select: {
        precioFinalAcordado: true,
        calificacionPasajero: true,
        distanciaKm: true,
      },
    });

    const totalGastado = viajes.reduce(
      (sum, v) => sum + (Number(v.precioFinalAcordado) || 0),
      0,
    );

    const calificacionPromedio = viajes.reduce(
      (sum, v) => sum + (v.calificacionPasajero || 0),
      0,
    ) / viajes.length || 0;

    const distanciaTotal = viajes.reduce(
      (sum, v) => sum + (Number(v.distanciaKm) || 0),
      0,
    );

    return {
      viajesCompletados: usuario.totalViajes,
      totalGastado,
      calificacionPromedio,
      distanciaTotal,
    };
  }

  /**
   * Obtener lugares favoritos
   */
  async getFavoritos(userId: string) {
    return this.prisma.favorito.findMany({
      where: { usuarioId: userId },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Agregar favorito
   */
  async addFavorito(userId: string, data: any) {
    return this.prisma.favorito.create({
      data: {
        usuarioId: userId,
        ...data,
      },
    });
  }

  /**
   * Eliminar favorito
   */
  async removeFavorito(userId: string, favoritoId: string) {
    return this.prisma.favorito.deleteMany({
      where: {
        id: favoritoId,
        usuarioId: userId,
      },
    });
  }
}
