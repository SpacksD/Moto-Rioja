import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ViajesService } from './viajes.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CrearViajeDto, CalificarViajeDto, CancelarViajeDto } from './dto/crear-viaje.dto';

@Controller('viajes')
export class ViajesController {
  constructor(private readonly viajesService: ViajesService) {}

  /**
   * Crear nueva solicitud de viaje
   * POST /api/viajes/solicitar
   */
  @Post('solicitar')
  async crearViaje(
    @CurrentUser('id') pasajeroId: string,
    @Body() crearViajeDto: CrearViajeDto,
  ) {
    return this.viajesService.crearViaje(pasajeroId, crearViajeDto);
  }

  /**
   * Obtener detalles de un viaje
   * GET /api/viajes/:id
   */
  @Get(':id')
  async obtenerViaje(
    @Param('id') viajeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.viajesService.obtenerViaje(viajeId, userId);
  }

  /**
   * Iniciar viaje (conductor)
   * POST /api/viajes/:id/iniciar
   */
  @Post(':id/iniciar')
  async iniciarViaje(
    @Param('id') viajeId: string,
    @CurrentUser('conductor') conductor: any,
  ) {
    return this.viajesService.iniciarViaje(viajeId, conductor.id);
  }

  /**
   * Finalizar viaje (conductor)
   * POST /api/viajes/:id/finalizar
   */
  @Post(':id/finalizar')
  async finalizarViaje(
    @Param('id') viajeId: string,
    @CurrentUser('conductor') conductor: any,
  ) {
    return this.viajesService.finalizarViaje(viajeId, conductor.id);
  }

  /**
   * Calificar viaje
   * POST /api/viajes/:id/calificar
   */
  @Post(':id/calificar')
  async calificarViaje(
    @Param('id') viajeId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tipoUsuario') tipoUsuario: string,
    @Body() calificarDto: CalificarViajeDto,
  ) {
    return this.viajesService.calificarViaje(viajeId, userId, tipoUsuario, calificarDto);
  }

  /**
   * Cancelar viaje
   * POST /api/viajes/:id/cancelar
   */
  @Post(':id/cancelar')
  async cancelarViaje(
    @Param('id') viajeId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tipoUsuario') tipoUsuario: string,
    @Body() cancelarDto: CancelarViajeDto,
  ) {
    return this.viajesService.cancelarViaje(viajeId, userId, tipoUsuario, cancelarDto);
  }
}
