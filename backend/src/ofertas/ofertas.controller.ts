import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { OfertasService, CrearOfertaDto } from './ofertas.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ofertas')
export class OfertasController {
  constructor(private readonly ofertasService: OfertasService) {}

  /**
   * Crear oferta para un viaje (conductor)
   * POST /api/ofertas
   */
  @Post()
  async crearOferta(
    @CurrentUser('conductor') conductor: any,
    @Body() crearOfertaDto: CrearOfertaDto,
  ) {
    return this.ofertasService.crearOferta(conductor.id, crearOfertaDto);
  }

  /**
   * Aceptar oferta (pasajero)
   * PUT /api/ofertas/:id/aceptar
   */
  @Put(':id/aceptar')
  async aceptarOferta(
    @Param('id') ofertaId: string,
    @CurrentUser('id') pasajeroId: string,
  ) {
    return this.ofertasService.aceptarOferta(ofertaId, pasajeroId);
  }

  /**
   * Rechazar oferta (pasajero)
   * PUT /api/ofertas/:id/rechazar
   */
  @Put(':id/rechazar')
  async rechazarOferta(
    @Param('id') ofertaId: string,
    @CurrentUser('id') pasajeroId: string,
  ) {
    return this.ofertasService.rechazarOferta(ofertaId, pasajeroId);
  }

  /**
   * Hacer contraoferta (pasajero)
   * PUT /api/ofertas/:id/contraoferta
   */
  @Put(':id/contraoferta')
  async hacerContraoferta(
    @Param('id') ofertaId: string,
    @CurrentUser('id') pasajeroId: string,
    @Body() body: { contraofertaPrecio: number; mensaje?: string },
  ) {
    return this.ofertasService.hacerContraoferta(
      ofertaId,
      pasajeroId,
      body.contraofertaPrecio,
      body.mensaje,
    );
  }

  /**
   * Obtener ofertas de un viaje
   * GET /api/ofertas/viaje/:viajeId
   */
  @Get('viaje/:viajeId')
  async obtenerOfertasViaje(@Param('viajeId') viajeId: string) {
    return this.ofertasService.obtenerOfertasViaje(viajeId);
  }
}
