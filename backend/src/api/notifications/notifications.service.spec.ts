import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { Prisma, TipoNotificacion } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

type MockFn = jest.Mock<unknown, unknown[]>;
type PrismaServiceMock = {
  notificationTemplate: { findMany: MockFn; findUnique: MockFn; update: MockFn };
  user: { findUnique: MockFn };
  reservation: { findUnique: MockFn };
  notificationLog: { create: MockFn; findMany: MockFn };
};
type ConfigServiceMock = { get: MockFn };

describe('NotificationsService', () => {
  const template = {
    id: 'template-1',
    tipo: TipoNotificacion.REGISTRO_USUARIO,
    name: 'Registro de usuario',
    subject: 'Bienvenido {{name}}{{missingSuffix}}',
    body: 'Hola {{name}},\n\nTu correo es {{email}}.\n\nMascota: {{petName}}\nHabitacion: {{roomNumber}}',
    variables: ['name', 'email', 'petName', 'missingSuffix'],
  };

  const user = {
    id: 'user-1',
    nombre: 'Andrea',
    email: 'andrea@example.com',
    isActive: true,
  };

  let service: NotificationsService;
  let prisma: PrismaServiceMock;
  let config: ConfigServiceMock;
  let sendMail: MockFn;
  const logoAttachment = {
    filename: 'petlodge-logo.png',
    path: 'C:/fake/petlodge-logo.png',
    cid: 'petlodge-logo',
  };

  beforeEach(() => {
    prisma = {
      notificationTemplate: {
        findMany: jest.fn().mockResolvedValue([template]),
        findUnique: jest.fn().mockResolvedValue(template),
        update: jest.fn().mockResolvedValue(template),
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
    service = new NotificationsService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
    );
    const serviceUnsafe = service as unknown as {
      createTransporter: () => { sendMail: MockFn };
      getLogoAttachment: () => typeof logoAttachment | null;
    };
    jest.spyOn(serviceUnsafe, 'createTransporter').mockReturnValue({ sendMail });
    jest.spyOn(serviceUnsafe, 'getLogoAttachment').mockReturnValue(logoAttachment);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns all notification templates ordered by type', async () => {
    const result = await service.findAll();

    expect(result).toEqual([template]);
    expect(prisma.notificationTemplate.findMany).toHaveBeenCalledWith({
      orderBy: { tipo: 'asc' },
    });
  });

  it('returns one notification template by id', async () => {
    const result = await service.findOne(template.id);

    expect(result).toEqual(template);
    expect(prisma.notificationTemplate.findUnique).toHaveBeenCalledWith({
      where: { id: template.id },
    });
  });

  it('throws not found when the notification template does not exist', async () => {
    prisma.notificationTemplate.findUnique.mockResolvedValueOnce(null);

    await expect(service.findOne('missing-template')).rejects.toThrow(NotFoundException);
    expect(prisma.notificationTemplate.findUnique).toHaveBeenCalledWith({
      where: { id: 'missing-template' },
    });
  });

  it('updates the notification template subject and keeps body unchanged when omitted', async () => {
    const updatedTemplate = {
      ...template,
      subject: 'Reserva confirmada para {{name}}',
    };
    prisma.notificationTemplate.update.mockResolvedValueOnce(updatedTemplate);

    const result = await service.update(template.id, {
      subject: updatedTemplate.subject,
    });

    expect(result).toEqual(updatedTemplate);
    expect(prisma.notificationTemplate.update).toHaveBeenCalledWith({
      where: { id: template.id },
      data: {
        subject: updatedTemplate.subject,
      },
    });
  });

  it('throws not found when updating a missing notification template', async () => {
    prisma.notificationTemplate.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Record to update not found.', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.update('missing-template', {
        body: 'Nuevo cuerpo',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.notificationTemplate.update).toHaveBeenCalledWith({
      where: { id: 'missing-template' },
      data: {
        body: 'Nuevo cuerpo',
      },
    });
  });

  it('returns the authenticated user notification log ordered by send date', async () => {
    prisma.notificationLog.findMany.mockResolvedValueOnce([
      {
        id: 'log-2',
        tipo: TipoNotificacion.CONFIRMACION_RESERVA,
        enviado: true,
        error: null,
        fechaEnvio: new Date('2026-04-04T10:00:00.000Z'),
        reservaId: 'reservation-1',
        template: {
          id: 'template-2',
          tipo: TipoNotificacion.CONFIRMACION_RESERVA,
          name: 'Confirmacion de reserva',
          subject: 'Tu reserva esta confirmada',
        },
      },
      {
        id: 'log-1',
        tipo: TipoNotificacion.REGISTRO_USUARIO,
        enviado: false,
        error: 'SMTP connection failed',
        fechaEnvio: new Date('2026-04-03T09:30:00.000Z'),
        reservaId: null,
        template: {
          id: 'template-1',
          tipo: TipoNotificacion.REGISTRO_USUARIO,
          name: 'Bienvenida de usuario',
          subject: 'Bienvenido a PetLodge',
        },
      },
    ]);

    const result = await service.findLogs(user.id);

    expect(result).toEqual([
      {
        id: 'log-2',
        tipo: TipoNotificacion.CONFIRMACION_RESERVA,
        enviado: true,
        error: null,
        fechaEnvio: '2026-04-04T10:00:00.000Z',
        reservaId: 'reservation-1',
        template: {
          id: 'template-2',
          tipo: TipoNotificacion.CONFIRMACION_RESERVA,
          name: 'Confirmacion de reserva',
          subject: 'Tu reserva esta confirmada',
        },
      },
      {
        id: 'log-1',
        tipo: TipoNotificacion.REGISTRO_USUARIO,
        enviado: false,
        error: 'SMTP connection failed',
        fechaEnvio: '2026-04-03T09:30:00.000Z',
        reservaId: null,
        template: {
          id: 'template-1',
          tipo: TipoNotificacion.REGISTRO_USUARIO,
          name: 'Bienvenida de usuario',
          subject: 'Bienvenido a PetLodge',
        },
      },
    ]);
    expect(prisma.notificationLog.findMany).toHaveBeenCalledWith({
      where: { userId: user.id },
      include: {
        template: {
          select: {
            id: true,
            tipo: true,
            name: true,
            subject: true,
          },
        },
      },
      orderBy: { fechaEnvio: 'desc' },
    });
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
    const firstMail = sendMail.mock.calls[0]?.[0] as { html?: string };
    expect(firstMail.html).toEqual(expect.stringContaining('Registro exitoso'));
    expect(firstMail.html).toEqual(expect.stringContaining('Mascota'));
    expect(firstMail.html).toEqual(expect.stringContaining('Habitacion 11'));
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
