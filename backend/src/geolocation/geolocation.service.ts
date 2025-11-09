import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class GeolocationService {
  constructor(private prisma: PrismaService) {}

  async guardarUbicacion(viajeId: string, conductorId: string, ubicacion: any) {
    return this.prisma.historialUbicacion.create({
      data: {
        viajeId,
        conductorId,
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud,
        velocidad: ubicacion.velocidad,
        rumbo: ubicacion.rumbo,
        precision: ubicacion.precision,
      },
    });
  }

  async obtenerRutaViaje(viajeId: string) {
    return this.prisma.historialUbicacion.findMany({
      where: { viajeId },
      orderBy: { timestamp: 'asc' },
    });
  }

  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(valor: number): number {
    return (valor * Math.PI) / 180;
  }
}
