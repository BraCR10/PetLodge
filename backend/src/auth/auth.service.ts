import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { numeroIdentificacion: dto.numeroIdentificacion },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('El correo o número de identificación ya está registrado');
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

    return {
      user: this.toResponse(user),
      access_token: this.sign(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
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
