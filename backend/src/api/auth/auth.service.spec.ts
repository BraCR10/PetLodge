import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { TipoNotificacion } from '../../../generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };
  let notificationsService: { sendByType: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    notificationsService = {
      sendByType: jest.fn().mockResolvedValue({
        sent: true,
        error: null,
        logId: 'log-1',
      }),
    };

    service = new AuthService(
      prisma as any,
      jwtService as unknown as JwtService,
      notificationsService as unknown as NotificationsService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the registration notification after creating the user', async () => {
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed-password');
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      nombre: 'Andrea',
      numeroIdentificacion: '123456789',
      email: 'andrea@example.com',
      password: 'hashed-password',
      numeroTelefono: null,
      direccion: null,
      isAdmin: false,
      isActive: true,
      fechaRegistro: new Date('2026-04-01T15:00:00.000Z'),
    });

    await service.register({
      nombre: 'Andrea',
      numeroIdentificacion: '123456789',
      email: 'andrea@example.com',
      password: 'supersegura',
      numeroTelefono: undefined,
      direccion: undefined,
    });

    expect(notificationsService.sendByType).toHaveBeenCalledWith(
      TipoNotificacion.REGISTRO_USUARIO,
      'user-1',
      {
        name: 'Andrea',
        email: 'andrea@example.com',
      },
    );
  });
});
