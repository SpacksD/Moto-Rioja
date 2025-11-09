import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async enviarNotificacion(usuarioId: string, tipo: string, titulo: string, mensaje: string, data?: any) {
    return this.prisma.notificacion.create({
      data: {
        usuarioId,
        tipo,
        titulo,
        mensaje,
        data: data || {},
      },
    });
  }

  async obtenerNotificaciones(usuarioId: string, limit = 20) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async marcarComoLeida(notificacionId: string) {
    return this.prisma.notificacion.update({
      where: { id: notificacionId },
      data: {
        leida: true,
        fechaLectura: new Date(),
      },
    });
  }
}
