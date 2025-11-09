import { IsString, IsNotEmpty, IsEnum, IsOptional, IsPhoneNumber, Matches, MinLength, MaxLength } from 'class-validator';
import { TipoUsuario } from '@prisma/client';

export class RegisterDto {
  @IsPhoneNumber('PE')
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @IsOptional()
  codigoPais?: string = '+51';

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  apellidos?: string;

  @IsEnum(TipoUsuario)
  @IsNotEmpty()
  tipoUsuario: TipoUsuario;
}

export class VerifyOtpDto {
  @IsPhoneNumber('PE')
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'El código debe ser de 6 dígitos' })
  codigo: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LoginDto {
  @IsPhoneNumber('PE')
  @IsNotEmpty()
  telefono: string;
}
