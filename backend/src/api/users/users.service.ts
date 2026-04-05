import { Injectable, ConflictException } from '@nestjs/common';
import { User } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

type UserResponse = Omit<User, 'password' | 'fechaRegistro'> & { fechaRegistro: string };
type UserWithRole = User & { role?: string };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(user: User): UserResponse {
    return this.toResponse(user);
  }

  async update(userId: string, dto: UpdateUserDto): Promise<UserResponse> {
    // Check if email or numeroIdentificacion already exist on another user
    if (dto.email || dto.numeroIdentificacion) {
      const existing = await this.prisma.user.findFirst({
        where: {
          AND: [
            {
              OR: [{ email: dto.email }, { numeroIdentificacion: dto.numeroIdentificacion }],
            },
            {
              NOT: { id: userId }, // Exclude current user
            },
          ],
        },
      });

      if (existing) {
        if (existing.email === dto.email) {
          throw new ConflictException('El correo ya está registrado');
        }
        if (existing.numeroIdentificacion === dto.numeroIdentificacion) {
          throw new ConflictException('El número de identificación ya está registrado');
        }
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    return this.toResponse(updated);
  }

  async deactivate(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  private toResponse(user: UserWithRole): UserResponse {
    const { password: _password, role: _role, fechaRegistro, ...rest } = user;
    return { ...rest, fechaRegistro: fechaRegistro.toISOString() };
  }
}
