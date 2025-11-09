import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { MetodoPago } from '@prisma/client';

class UbicacionDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsOptional()
  referencia?: string;
}

export class CrearViajeDto {
  @IsNotEmpty()
  origen: UbicacionDto;

  @IsNotEmpty()
  destino: UbicacionDto;

  @IsNumber()
  @Min(3)
  @Max(100)
  precioInicial: number;

  @IsEnum(MetodoPago)
  @IsOptional()
  metodoPago?: MetodoPago = MetodoPago.efectivo;

  @IsString()
  @IsOptional()
  notas?: string;
}

export class CalificarViajeDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  calificacion: number;

  @IsString()
  @IsOptional()
  comentario?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  propina?: number;
}

export class CancelarViajeDto {
  @IsString()
  @IsNotEmpty()
  motivo: string;
}
