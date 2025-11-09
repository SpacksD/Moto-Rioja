import { Controller, Get, Post, Put, Body, Query } from '@nestjs/common';
import { ConductoresService } from './conductores.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('conductores')
export class ConductoresController {
  constructor(private readonly conductoresService: ConductoresService) {}

  @Post('registrar')
  async registrar(@CurrentUser('id') usuarioId: string, @Body() data: any) {
    return this.conductoresService.registrarConductor(usuarioId, data);
  }

  @Put('disponibilidad')
  async actualizarDisponibilidad(
    @CurrentUser('conductor') conductor: any,
    @Body() body: { disponible: boolean; ubicacion?: any },
  ) {
    return this.conductoresService.actualizarDisponibilidad(
      conductor.id,
      body.disponible,
      body.ubicacion,
    );
  }

  @Get('cercanos')
  async obtenerCercanos(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radio') radio?: number,
  ) {
    return this.conductoresService.obtenerConductoresCercanos(lat, lng, radio);
  }
}
