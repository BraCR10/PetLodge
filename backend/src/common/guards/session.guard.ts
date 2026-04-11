import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { errorResponse } from '../errors/error-response';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearer(request);

    if (!token) {
      throw new UnauthorizedException(errorResponse('NOT_AUTHENTICATED', 'No autenticado'));
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException(errorResponse('INVALID_TOKEN', 'Token invalido o expirado'));
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        errorResponse('ACCOUNT_INACTIVE', 'Cuenta no encontrada o inactiva'),
      );
    }

    request.currentUser = {
      ...user,
      role: user.isAdmin ? 'admin' : 'user',
    };

    return true;
  }

  private extractBearer(request: Request): string | null {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) return null;
    return authorization.slice(7);
  }
}
