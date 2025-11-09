import { Controller, Post, Body } from '@nestjs/common';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('procesar')
  async procesar(@Body() body: { viajeId: string; metodoPago: string }) {
    return this.pagosService.procesarPago(body.viajeId, body.metodoPago);
  }
}
