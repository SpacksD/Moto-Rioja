import { Module } from '@nestjs/common';
import { ViajesService } from './viajes.service';
import { ViajesController } from './viajes.controller';
import { OfertasModule } from '../ofertas/ofertas.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { GeolocationModule } from '../geolocation/geolocation.module';

@Module({
  imports: [OfertasModule, NotificacionesModule, GeolocationModule],
  controllers: [ViajesController],
  providers: [ViajesService],
  exports: [ViajesService],
})
export class ViajesModule {}
