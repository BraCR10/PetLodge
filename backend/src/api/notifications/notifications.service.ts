import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, TipoNotificacion } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';

type NotificationVariables = Record<string, string | number | boolean | null | undefined>;

type SendResult = {
  sent: boolean;
  error: string | null;
  logId: string | null;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findAll() {
    return this.prisma.notificationTemplate.findMany({
      orderBy: { tipo: 'asc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Plantilla de notificacion no encontrada');
    }

    return template;
  }

  async update(id: string, dto: UpdateNotificationTemplateDto) {
    try {
      return await this.prisma.notificationTemplate.update({
        where: { id },
        data: {
          ...(dto.subject !== undefined ? { subject: dto.subject } : {}),
          ...(dto.body !== undefined ? { body: dto.body } : {}),
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Plantilla de notificacion no encontrada');
      }

      throw error;
    }
  }

  async findLogs(userId: string) {
    const logs = await this.prisma.notificationLog.findMany({
      where: { userId },
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

    return logs.map((log) => ({
      id: log.id,
      tipo: log.tipo,
      enviado: log.enviado,
      error: log.error,
      fechaEnvio: log.fechaEnvio.toISOString(),
      reservaId: log.reservaId,
      template: log.template,
    }));
  }

  async sendByType(
    tipo: TipoNotificacion,
    userId: string,
    variables?: NotificationVariables,
    reservaId?: string,
  ): Promise<SendResult> {
    try {
      const template = await this.prisma.notificationTemplate.findUnique({
        where: { tipo },
        select: { id: true },
      });

      if (!template) {
        const error = `Notification template for type ${tipo} was not found.`;
        this.logger.warn(error);
        return { sent: false, error, logId: null };
      }

      return this.send(template.id, userId, variables, reservaId);
    } catch (error: unknown) {
      const message = this.toErrorMessage(error);
      this.logger.error(`Unexpected error resolving template type ${tipo}: ${message}`);
      return { sent: false, error: message, logId: null };
    }
  }

  async send(
    templateId: string,
    userId: string,
    variables: NotificationVariables = {},
    reservaId?: string,
  ): Promise<SendResult> {
    try {
      const template = await this.prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        const error = 'Notification template not found.';
        this.logger.warn(`${error} templateId=${templateId}`);
        return { sent: false, error, logId: null };
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nombre: true,
          email: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        const error = 'Target user was not found or is inactive.';
        this.logger.warn(`${error} userId=${userId}`);
        return { sent: false, error, logId: null };
      }

      const reservationRef = await this.resolveReservationReference(reservaId, user.id);
      if (!reservationRef.valid) {
        return this.createFailureLog(template, user.id, reservationRef.error, null);
      }

      const replacements = this.normalizeVariables({
        name: user.nombre,
        email: user.email,
        ...variables,
      });
      const missingVariables = template.variables.filter(
        (key) => !Object.prototype.hasOwnProperty.call(replacements, key),
      );

      if (missingVariables.length > 0) {
        this.logger.warn(
          `Template ${template.tipo} is being sent with missing variables: ${missingVariables.join(', ')}`,
        );
      }

      const subject = this.interpolate(template.subject, replacements);
      const body = this.interpolate(template.body, replacements);
      const from = this.config.get<string>('MAIL_FROM') ?? this.config.get<string>('MAIL_USER');

      if (!from) {
        return this.createFailureLog(
          template,
          user.id,
          'MAIL_FROM or MAIL_USER is required to send notifications.',
          reservationRef.reservaId,
        );
      }

      await this.createTransporter().sendMail({
        from,
        to: user.email,
        subject,
        text: body,
      });

      const log = await this.prisma.notificationLog.create({
        data: {
          tipo: template.tipo,
          enviado: true,
          userId: user.id,
          reservaId: reservationRef.reservaId,
          templateId: template.id,
        },
      });

      this.logger.log(`Sent ${template.tipo} notification to ${user.email}`);
      return { sent: true, error: null, logId: log.id };
    } catch (error: unknown) {
      const message = this.toErrorMessage(error);
      this.logger.error(`Unexpected notification failure for template ${templateId}: ${message}`);
      return { sent: false, error: message, logId: null };
    }
  }

  private createTransporter(): nodemailer.Transporter {
    const host = this.config.get<string>('MAIL_HOST');
    const port = Number(this.config.get<string>('MAIL_PORT') ?? '587');
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');

    if (!host) {
      throw new Error('MAIL_HOST is required to send notifications.');
    }

    if (!Number.isFinite(port)) {
      throw new Error('MAIL_PORT must be a valid number.');
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  private async resolveReservationReference(
    reservaId: string | undefined,
    userId: string,
  ): Promise<{ valid: true; reservaId: string | null } | { valid: false; error: string }> {
    if (!reservaId) {
      return { valid: true, reservaId: null };
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservaId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!reservation) {
      return {
        valid: false,
        error: `Reservation ${reservaId} was not found.`,
      };
    }

    if (reservation.userId !== userId) {
      return {
        valid: false,
        error: `Reservation ${reservaId} does not belong to user ${userId}.`,
      };
    }

    return { valid: true, reservaId: reservation.id };
  }

  private async createFailureLog(
    template: { id: string; tipo: TipoNotificacion },
    userId: string,
    error: string,
    reservaId: string | null,
  ): Promise<SendResult> {
    try {
      const log = await this.prisma.notificationLog.create({
        data: {
          tipo: template.tipo,
          enviado: false,
          error,
          userId,
          reservaId,
          templateId: template.id,
        },
      });

      this.logger.error(`Failed to send ${template.tipo} notification: ${error}`);
      return {
        sent: false,
        error,
        logId: log.id,
      };
    } catch (logError: unknown) {
      const logMessage = this.toErrorMessage(logError);
      this.logger.error(
        `Failed to send ${template.tipo} notification and also failed to write log: ${error}. Log error: ${logMessage}`,
      );
      return {
        sent: false,
        error,
        logId: null,
      };
    }
  }

  private normalizeVariables(values: NotificationVariables): Record<string, string> {
    return Object.entries(values).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value === undefined || value === null) {
        return acc;
      }

      acc[key] = String(value);
      return acc;
    }, {});
  }

  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (full, key: string) => {
      return variables[key] ?? full;
    });
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Unknown notification delivery error.';
  }
}
