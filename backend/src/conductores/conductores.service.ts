import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ConductoresService {
  constructor(private prisma: PrismaService) {}

  async registrarConductor(usuarioId: string, data: any) {
    return this.prisma.conductor.create({
      data: {
        usuarioId,
        ...data,
      },
    });
  }

  async actualizarDisponibilidad(conductorId: string, disponible: boolean, ubicacion?: any) {
    return this.prisma.conductor.update({
      where: { id: conductorId },
      data: {
        disponible,
        ubicacionActual: ubicacion ? JSON.stringify(ubicacion) : undefined,
        ultimaActualizacionUbicacion: new Date(),
      },
    });
  }

  async obtenerConductoresCercanos(latitud: number, longitud: number, radioKm: number = 5) {
    // En producción, usar PostGIS para búsqueda geoespacial
    return this.prisma.conductor.findMany({
      where: {
        disponible: true,
        estadoVerificacion: 'aprobado',
        enServicio: false,
      },
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
      take: 20,
    });
  }
}
