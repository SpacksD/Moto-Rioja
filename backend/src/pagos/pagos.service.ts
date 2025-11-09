import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  async procesarPago(viajeId: string, metodoPago: string) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id: viajeId },
    });

    if (!viaje) {
      throw new Error('Viaje no encontrado');
    }

    // Lógica de procesamiento de pago
    const comision = Number(viaje.precioFinalAcordado) * 0.15;
    const pagoConductor = Number(viaje.precioFinalAcordado) - comision;

    // Crear transacciones
    await this.prisma.transaccion.createMany({
      data: [
        {
          usuarioId: viaje.conductorId || '',
          viajeId,
          tipo: 'pago_viaje',
          monto: pagoConductor,
          metodoPago,
          estado: 'completado',
        },
        {
          usuarioId: viaje.pasajeroId,
          viajeId,
          tipo: 'comision',
          monto: comision,
          metodoPago,
          estado: 'completado',
        },
      ],
    });

    return { success: true, message: 'Pago procesado correctamente' };
  }
}
