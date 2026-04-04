import { ConfigService } from '@nestjs/config';
import { TipoNotificacion } from '../../../generated/prisma/client';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const template = {
    id: 'template-1',
    tipo: TipoNotificacion.REGISTRO_USUARIO,
    subject: 'Bienvenido {{name}}{{missingSuffix}}',
    body:
      'Hola {{name}},\n\nTu correo es {{email}}.\n\nMascota: {{petName}}\nHabitacion: {{roomNumber}}',
    variables: ['name', 'email', 'petName', 'missingSuffix'],
  };

  const user = {
    id: 'user-1',
    nombre: 'Andrea',
    email: 'andrea@example.com',
    isActive: true,
  };

  let service: NotificationsService;
  let prisma: {
    notificationTemplate: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock };
    reservation: { findUnique: jest.Mock };
    notificationLog: { create: jest.Mock; findMany: jest.Mock };
  };
  let config: { get: jest.Mock };
  let sendMail: jest.Mock;
  const logoAttachment = {
    filename: 'petlodge-logo.png',
    path: 'C:/fake/petlodge-logo.png',
    cid: 'petlodge-logo',
  };

  beforeEach(() => {
    prisma = {
      notificationTemplate: {
        findUnique: jest.fn().mockResolvedValue(template),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
      },
      reservation: {
        findUnique: jest.fn(),
      },
      notificationLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    config = {
      get: jest.fn((key: string) => {
        const values: Record<string, string | undefined> = {
          MAIL_FROM: 'no-reply@petlodge.test',
          MAIL_HOST: 'smtp.petlodge.test',
          MAIL_PORT: '587',
          MAIL_USER: 'smtp-user',
          MAIL_PASS: 'smtp-pass',
        };

        return values[key];
      }),
    };

    sendMail = jest.fn().mockResolvedValue(undefined);
    service = new NotificationsService(prisma as any, config as unknown as ConfigService);
    jest.spyOn(service as any, 'createTransporter').mockReturnValue({
      sendMail,
    } as any);
    jest.spyOn(service as any, 'getLogoAttachment').mockReturnValue(logoAttachment);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the email, replaces placeholders, and writes a success log', async () => {
    prisma.notificationLog.create.mockResolvedValue({ id: 'log-success' });

    const result = await service.send(template.id, user.id, {
      petName: 'Milo',
      roomNumber: 'Habitacion 11',
    });

    expect(result).toEqual({
      sent: true,
      error: null,
      logId: 'log-success',
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: 'no-reply@petlodge.test',
      to: 'andrea@example.com',
      subject: 'Bienvenido Andrea',
      text: 'Hola Andrea,\n\nTu correo es andrea@example.com.\n\nMascota: Milo\nHabitacion: Habitacion 11',
      html: expect.stringContaining('cid:petlodge-logo'),
      attachments: [logoAttachment],
    });
    expect(sendMail.mock.calls[0][0].html).toEqual(expect.stringContaining('Registro exitoso'));
    expect(sendMail.mock.calls[0][0].html).toEqual(expect.stringContaining('Mascota'));
    expect(sendMail.mock.calls[0][0].html).toEqual(expect.stringContaining('Habitacion 11'));
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        tipo: TipoNotificacion.REGISTRO_USUARIO,
        enviado: true,
        userId: user.id,
        reservaId: null,
        templateId: template.id,
      },
    });
  });

  it('writes a failure log when sendMail fails', async () => {
    sendMail.mockRejectedValue(new Error('SMTP connection failed'));
    prisma.notificationLog.create.mockResolvedValue({ id: 'log-failure' });

    const result = await service.send(template.id, user.id, {
      petName: 'Milo',
      roomNumber: 'Habitacion 11',
    });

    expect(result).toEqual({
      sent: false,
      error: 'SMTP connection failed',
      logId: 'log-failure',
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        tipo: TipoNotificacion.REGISTRO_USUARIO,
        enviado: false,
        error: 'SMTP connection failed',
        userId: user.id,
        reservaId: null,
        templateId: template.id,
      },
    });
  });

  it('writes a failure log when the sender address is missing', async () => {
    config.get.mockImplementation((key: string) => {
      const values: Record<string, string | undefined> = {
        MAIL_HOST: 'smtp.petlodge.test',
        MAIL_PORT: '587',
      };

      return values[key];
    });
    prisma.notificationLog.create.mockResolvedValue({ id: 'log-missing-from' });

    const result = await service.send(template.id, user.id, {
      petName: 'Milo',
      roomNumber: 'Habitacion 11',
    });

    expect(result).toEqual({
      sent: false,
      error: 'MAIL_FROM or MAIL_USER is required to send notifications.',
      logId: 'log-missing-from',
    });
    expect(sendMail).not.toHaveBeenCalled();
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        tipo: TipoNotificacion.REGISTRO_USUARIO,
        enviado: false,
        error: 'MAIL_FROM or MAIL_USER is required to send notifications.',
        userId: user.id,
        reservaId: null,
        templateId: template.id,
      },
    });
  });
});
