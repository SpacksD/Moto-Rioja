import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto, VerifyOtpDto, LoginDto } from './dto/register.dto';
import * as crypto from 'crypto';

interface OtpStore {
  [telefono: string]: {
    codigo: string;
    expiracion: Date;
    intentos: number;
  };
}

@Injectable()
export class AuthService {
  private otpStore: OtpStore = {};
  private readonly OTP_EXPIRATION_MINUTES = 5;
  private readonly MAX_OTP_ATTEMPTS = 3;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Registrar nuevo usuario y enviar OTP
   */
  async register(registerDto: RegisterDto) {
    // Verificar si el teléfono ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { telefono: registerDto.telefono },
    });

    if (existingUser) {
      throw new ConflictException('El número de teléfono ya está registrado');
    }

    // Generar y enviar OTP
    const otp = await this.generateAndSendOtp(registerDto.telefono);

    // Guardar datos temporalmente (en producción, usar Redis)
    // Por ahora, solo devolvemos el código en desarrollo
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    return {
      message: 'Código OTP enviado exitosamente',
      telefono: registerDto.telefono,
      ...(isDevelopment && { codigo: otp }), // Solo en desarrollo
    };
  }

  /**
   * Verificar OTP y crear usuario
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto, registerData?: RegisterDto) {
    const { telefono, codigo } = verifyOtpDto;

    // Verificar OTP
    const isValid = await this.validateOtp(telefono, codigo);
    if (!isValid) {
      throw new UnauthorizedException('Código OTP inválido o expirado');
    }

    // Buscar o crear usuario
    let usuario = await this.prisma.usuario.findUnique({
      where: { telefono },
      include: {
        conductor: true,
      },
    });

    if (!usuario && registerData) {
      // Crear nuevo usuario
      usuario = await this.prisma.usuario.create({
        data: {
          telefono: registerData.telefono,
          codigoPais: registerData.codigoPais || '+51',
          nombre: registerData.nombre,
          apellidos: registerData.apellidos,
          tipoUsuario: registerData.tipoUsuario,
          estado: 'activo',
        },
        include: {
          conductor: true,
        },
      });
    }

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Actualizar último acceso
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    // Limpiar OTP usado
    delete this.otpStore[telefono];

    // Generar tokens
    const tokens = await this.generateTokens(usuario.id, usuario.telefono, usuario.tipoUsuario);

    return {
      ...tokens,
      usuario: {
        id: usuario.id,
        telefono: usuario.telefono,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        tipoUsuario: usuario.tipoUsuario,
        estado: usuario.estado,
        fotoPerfil: usuario.fotoPerfil,
        calificacionPromedio: usuario.calificacionPromedio,
        esConductor: !!usuario.conductor,
        conductorId: usuario.conductor?.id,
      },
    };
  }

  /**
   * Login (enviar OTP)
   */
  async login(loginDto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { telefono: loginDto.telefono },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (usuario.estado === 'baneado' || usuario.estado === 'suspendido') {
      throw new UnauthorizedException('Usuario suspendido o baneado');
    }

    // Generar y enviar OTP
    const otp = await this.generateAndSendOtp(loginDto.telefono);

    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    return {
      message: 'Código OTP enviado exitosamente',
      telefono: loginDto.telefono,
      ...(isDevelopment && { codigo: otp }), // Solo en desarrollo
    };
  }

  /**
   * Refrescar token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const usuario = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return this.generateTokens(usuario.id, usuario.telefono, usuario.tipoUsuario);
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  /**
   * Generar OTP y enviarlo
   */
  private async generateAndSendOtp(telefono: string): Promise<string> {
    // Generar código de 6 dígitos
    const codigo = crypto.randomInt(100000, 999999).toString();

    // Guardar en store (en producción usar Redis)
    this.otpStore[telefono] = {
      codigo,
      expiracion: new Date(Date.now() + this.OTP_EXPIRATION_MINUTES * 60 * 1000),
      intentos: 0,
    };

    // Enviar SMS (integrar con Twilio en producción)
    await this.sendSms(telefono, codigo);

    return codigo;
  }

  /**
   * Validar OTP
   */
  private async validateOtp(telefono: string, codigo: string): Promise<boolean> {
    const otpData = this.otpStore[telefono];

    if (!otpData) {
      return false;
    }

    // Verificar intentos
    if (otpData.intentos >= this.MAX_OTP_ATTEMPTS) {
      delete this.otpStore[telefono];
      throw new BadRequestException('Máximo de intentos alcanzado. Solicite un nuevo código');
    }

    // Verificar expiración
    if (new Date() > otpData.expiracion) {
      delete this.otpStore[telefono];
      return false;
    }

    // Verificar código
    if (otpData.codigo !== codigo) {
      otpData.intentos++;
      return false;
    }

    return true;
  }

  /**
   * Enviar SMS (mock - integrar con Twilio)
   */
  private async sendSms(telefono: string, codigo: string): Promise<void> {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    if (isDevelopment) {
      console.log(`📱 SMS enviado a ${telefono}: Tu código es ${codigo}`);
      return;
    }

    // Integración con Twilio
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: `Tu código de verificación MotoTaxi Connect es: ${codigo}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: telefono,
    // });
  }

  /**
   * Generar tokens JWT
   */
  private async generateTokens(userId: string, telefono: string, tipoUsuario: string) {
    const payload = {
      sub: userId,
      telefono,
      tipoUsuario,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION') || '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
