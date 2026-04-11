import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, TipoNotificacion } from '../../../generated/prisma/client';
import { errorResponse } from '../../common/errors/error-response';
import { PrismaService } from '../../prisma/prisma.service';
import { existsSync } from 'fs';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';

type NotificationVariables = Record<string, string | number | boolean | null | undefined>;

type SendResult = {
  sent: boolean;
  error: string | null;
  logId: string | null;
};

const EMAIL_LOGO_CID = 'petlodge-logo';

const NOTIFICATION_LABELS: Record<TipoNotificacion, string> = {
  [TipoNotificacion.REGISTRO_USUARIO]: 'Registro exitoso',
  [TipoNotificacion.CONFIRMACION_RESERVA]: 'Reserva confirmada',
  [TipoNotificacion.MODIFICACION_RESERVA]: 'Reserva actualizada',
  [TipoNotificacion.INICIO_HOSPEDAJE]: 'Ingreso registrado',
  [TipoNotificacion.FIN_HOSPEDAJE]: 'Salida registrada',
  [TipoNotificacion.ESTADO_MASCOTA]: 'Estado de mascota',
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
      throw new NotFoundException(
        errorResponse('NOTIFICATION_TEMPLATE_NOT_FOUND', 'Plantilla de notificacion no encontrada'),
      );
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
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(
          errorResponse(
            'NOTIFICATION_TEMPLATE_NOT_FOUND',
            'Plantilla de notificacion no encontrada',
          ),
        );
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
    let template: {
      id: string;
      tipo: TipoNotificacion;
      subject: string;
      body: string;
      variables: string[];
    } | null = null;
    let user: {
      id: string;
      nombre: string;
      email: string;
      isActive: boolean;
    } | null = null;
    let resolvedReservaId: string | null = null;

    try {
      template = await this.prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        const error = 'Notification template not found.';
        this.logger.warn(`${error} templateId=${templateId}`);
        return { sent: false, error, logId: null };
      }

      user = await this.prisma.user.findUnique({
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
      resolvedReservaId = reservationRef.reservaId;

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
      const logoAttachment = this.getLogoAttachment();
      const html = this.renderHtmlEmail(template.tipo, subject, body, Boolean(logoAttachment));
      const from = this.getFromAddress();

      if (!from) {
        return this.createFailureLog(
          template,
          user.id,
          'MAIL_FROM or MAIL_USER is required to send notifications.',
          resolvedReservaId,
        );
      }

      try {
        await this.createTransporter().sendMail({
          from,
          to: user.email,
          subject,
          text: body,
          html,
          attachments: logoAttachment ? [logoAttachment] : undefined,
        });
      } catch (error: unknown) {
        return this.createFailureLog(
          template,
          user.id,
          this.toErrorMessage(error),
          resolvedReservaId,
        );
      }

      return this.createSuccessLog(template, user.id, resolvedReservaId, user.email);
    } catch (error: unknown) {
      const message = this.toErrorMessage(error);

      if (template && user) {
        return this.createFailureLog(template, user.id, message, resolvedReservaId);
      }

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

  private getFromAddress(): string | null {
    return this.config.get<string>('MAIL_FROM') ?? this.config.get<string>('MAIL_USER') ?? null;
  }

  private renderHtmlEmail(
    tipo: TipoNotificacion,
    subject: string,
    body: string,
    hasLogo: boolean,
  ): string {
    const previewText = this.escapeHtml(this.buildPreviewText(body));
    const title = this.escapeHtml(subject);
    const notificationLabel = this.escapeHtml(NOTIFICATION_LABELS[tipo]);
    const content = this.renderBodyHtml(body);
    const logoMarkup = hasLogo
      ? `<img
            src="cid:${EMAIL_LOGO_CID}"
            alt="PetLodge"
            width="96"
            height="96"
            style="display:block; width:96px; height:96px; margin:0 auto 20px; border:0; outline:none; text-decoration:none;"
          />`
      : '';

    return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5efe8; font-family:Arial, Helvetica, sans-serif; color:#23180f;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
      ${previewText}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5efe8;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="max-width:680px; background-color:#fffaf5; border-radius:28px; overflow:hidden; box-shadow:0 18px 60px rgba(120, 62, 18, 0.16);"
          >
            <tr>
              <td
                style="padding:40px 36px 30px; background:linear-gradient(180deg, #3a322e 0%, #6f635b 100%); text-align:center;"
              >
                ${logoMarkup}
                <div
                  style="display:inline-block; padding:8px 14px; border-radius:999px; background-color:rgba(255, 154, 62, 0.18); border:1px solid rgba(255, 178, 94, 0.38); color:#ffd5aa; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;"
                >
                  ${notificationLabel}
                </div>
                <h1
                  style="margin:18px 0 10px; font-size:32px; line-height:1.2; color:#fff4ea; font-weight:800;"
                >
                  ${title}
                </h1>
                <p style="margin:0; color:#f7dbc0; font-size:15px; line-height:1.7;">
                  Cuidamos cada detalle para que tu experiencia con PetLodge se sienta cercana,
                  clara y confiable.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 36px 14px;">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="background:linear-gradient(180deg, #fff7f0 0%, #fffdfb 100%); border:1px solid #f3d8bd; border-radius:22px;"
                >
                  <tr>
                    <td style="padding:30px 28px;">
                      ${content}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 34px;">
                <p style="margin:0; font-size:13px; line-height:1.8; color:#7b6453;">
                  Este correo fue enviado automaticamente por PetLodge. Si no esperabas este
                  mensaje, puedes ignorarlo.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  private renderBodyHtml(body: string): string {
    const sections = body
      .split(/\n\s*\n/)
      .map((section) => section.trim())
      .filter(Boolean);

    return sections
      .map((section) => {
        const lines = section
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

        const isDataBlock =
          lines.length > 0 && lines.every((line) => /^[^:]{1,40}:\s+.+$/.test(line));

        if (isDataBlock) {
          const rows = lines
            .map((line) => {
              const [rawLabel, ...rest] = line.split(':');
              const value = rest.join(':').trim();

              return `<tr>
                <td style="padding:14px 0; border-bottom:1px solid #f1dfcf; font-size:13px; font-weight:700; color:#8b5a2b; text-transform:uppercase; letter-spacing:0.04em; width:36%;">
                  ${this.escapeHtml(rawLabel)}
                </td>
                <td style="padding:14px 0; border-bottom:1px solid #f1dfcf; font-size:15px; line-height:1.6; color:#2d2016;">
                  ${this.escapeHtml(value)}
                </td>
              </tr>`;
            })
            .join('');

          return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px; background-color:#fff; border:1px solid #f3dfcd; border-radius:18px; padding:0 18px;">
            ${rows}
          </table>`;
        }

        return `<p style="margin:0 0 18px; font-size:16px; line-height:1.8; color:#2f241b;">
          ${lines.map((line) => this.escapeHtml(line)).join('<br />')}
        </p>`;
      })
      .join('');
  }

  private buildPreviewText(body: string): string {
    return body.replace(/\s+/g, ' ').trim().slice(0, 140);
  }

  private getLogoAttachment(): {
    filename: string;
    path: string;
    cid: string;
  } | null {
    const logoPath = this.resolveLogoPath();

    if (!logoPath) {
      return null;
    }

    return {
      filename: 'petlodge-logo.png',
      path: logoPath,
      cid: EMAIL_LOGO_CID,
    };
  }

  private resolveLogoPath(): string | null {
    const candidates = [
      path.resolve(process.cwd(), '../frontend/assets/images/favicon.png'),
      path.resolve(process.cwd(), 'frontend/assets/images/favicon.png'),
      path.resolve(__dirname, '../../../../frontend/assets/images/favicon.png'),
      path.resolve(__dirname, '../../../../../frontend/assets/images/favicon.png'),
    ];

    const logoPath = candidates.find((candidate) => existsSync(candidate));

    if (!logoPath) {
      this.logger.warn(
        'PetLodge email logo was not found. Emails will be sent without inline logo.',
      );
      return null;
    }

    return logoPath;
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

  private async createSuccessLog(
    template: { id: string; tipo: TipoNotificacion },
    userId: string,
    reservaId: string | null,
    email: string,
  ): Promise<SendResult> {
    try {
      const log = await this.prisma.notificationLog.create({
        data: {
          tipo: template.tipo,
          enviado: true,
          userId,
          reservaId,
          templateId: template.id,
        },
      });

      this.logger.log(`Sent ${template.tipo} notification to ${email}`);
      return { sent: true, error: null, logId: log.id };
    } catch (error: unknown) {
      const message = this.toErrorMessage(error);
      this.logger.error(
        `Sent ${template.tipo} notification to ${email}, but failed to write success log: ${message}`,
      );
      return { sent: true, error: message, logId: null };
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
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) => {
      return variables[key] ?? '';
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Unknown notification delivery error.';
  }
}
