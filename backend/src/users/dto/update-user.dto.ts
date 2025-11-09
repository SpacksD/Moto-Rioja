import { IsString, IsOptional, IsEmail, IsDateString, IsEnum } from 'class-validator';
import { Genero } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellidos?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string;

  @IsEnum(Genero)
  @IsOptional()
  genero?: Genero;

  @IsString()
  @IsOptional()
  fotoPerfil?: string;

  @IsOptional()
  preferencias?: any;
}
