import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { TipoNotificacion, User } from '../../../generated/prisma/client';
import { errorResponse } from '../../common/errors/error-response';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { numeroIdentificacion: dto.numeroIdentificacion }],
      },
    });

    if (existing) {
      throw new ConflictException(
        errorResponse(
          'USER_ALREADY_EXISTS',
          'El correo o numero de identificacion ya esta registrado',
        ),
      );
    }

    const hashed = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        nombre: dto.nombre,
        numeroIdentificacion: dto.numeroIdentificacion,
        email: dto.email,
        password: hashed,
        numeroTelefono: dto.numeroTelefono,
        direccion: dto.direccion,
      },
    });

    await this.notificationsService.sendByType(TipoNotificacion.REGISTRO_USUARIO, user.id, {
      name: user.nombre,
      email: user.email,
    });

    return {
      user: this.toResponse(user),
      access_token: this.sign(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        errorResponse('INVALID_CREDENTIALS', 'Credenciales invalidas'),
      );
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException(
        errorResponse('INVALID_CREDENTIALS', 'Credenciales invalidas'),
      );
    }

    return {
      user: this.toResponse(user),
      access_token: this.sign(user),
    };
  }

  private sign(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  }

  private toResponse(user: User) {
    return {
      id: user.id,
      nombre: user.nombre,
      numeroIdentificacion: user.numeroIdentificacion,
      email: user.email,
      numeroTelefono: user.numeroTelefono,
      direccion: user.direccion,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      fechaRegistro: user.fechaRegistro.toISOString(),
    };
  }
}
