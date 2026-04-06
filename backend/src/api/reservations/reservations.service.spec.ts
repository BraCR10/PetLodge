import { ReservationStatus, TipoNotificacion } from '../../../generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: {
    pet: { findUnique: jest.Mock };
    room: { findUnique: jest.Mock };
    reservation: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let notificationsService: { sendByType: jest.Mock };

  beforeEach(() => {
    prisma = {
      pet: {
        findUnique: jest.fn(),
      },
      room: {
        findUnique: jest.fn(),
      },
      reservation: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    notificationsService = {
      sendByType: jest.fn().mockResolvedValue({
        sent: true,
        error: null,
        logId: 'log-1',
      }),
    };

    service = new ReservationsService(
      prisma as any,
      notificationsService as unknown as NotificationsService,
    );
  });

  it('sends confirmation notification when a reservation is created', async () => {
    const createdReservation = {
      id: 'reservation-1',
      userId: 'user-1',
      mascotaId: 'pet-1',
      habitacionId: 'room-1',
      fechaEntrada: new Date('2026-04-10T00:00:00.000Z'),
      fechaSalida: new Date('2026-04-12T00:00:00.000Z'),
      esEspecial: true,
      serviciosAdicionales: 'bano',
      estado: ReservationStatus.CONFIRMADA,
      fechaCreacion: new Date('2026-04-01T15:00:00.000Z'),
      pet: {
        id: 'pet-1',
        nombre: 'Milo',
        userId: 'user-1',
        isActive: true,
      },
      room: {
        id: 'room-1',
        numero: 'Habitacion 11',
      },
    };

    prisma.pet.findUnique.mockResolvedValue({
      id: 'pet-1',
      nombre: 'Milo',
      userId: 'user-1',
      isActive: true,
    });
    prisma.room.findUnique.mockResolvedValue({ id: 'room-1' });
    prisma.reservation.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdReservation);
    prisma.reservation.create.mockResolvedValue({ id: 'reservation-1' });

    await service.create('user-1', {
      mascotaId: 'pet-1',
      habitacionId: 'room-1',
      fechaEntrada: '2026-04-10',
      fechaSalida: '2026-04-12',
      tipoHospedaje: 'especial',
      serviciosAdicionales: ['bano'],
    });

    expect(notificationsService.sendByType).toHaveBeenCalledWith(
      TipoNotificacion.CONFIRMACION_RESERVA,
      'user-1',
      {
        petName: 'Milo',
        checkInDate: '10/04/2026',
        checkOutDate: '12/04/2026',
        roomNumber: 'Habitacion 11',
      },
      'reservation-1',
    );
  });

  it('sends modification notification when a reservation is updated', async () => {
    const existingReservation = {
      id: 'reservation-1',
      userId: 'user-1',
      mascotaId: 'pet-1',
      habitacionId: 'room-1',
      fechaEntrada: new Date('2026-04-10T00:00:00.000Z'),
      fechaSalida: new Date('2026-04-12T00:00:00.000Z'),
      esEspecial: true,
      serviciosAdicionales: 'bano',
      estado: ReservationStatus.CONFIRMADA,
      fechaCreacion: new Date('2026-04-01T15:00:00.000Z'),
      pet: {
        id: 'pet-1',
        nombre: 'Milo',
        userId: 'user-1',
        isActive: true,
      },
      room: {
        id: 'room-1',
        numero: 'Habitacion 11',
      },
    };

    const updatedReservation = {
      id: 'reservation-1',
      userId: 'user-1',
      mascotaId: 'pet-1',
      habitacionId: 'room-1',
      fechaEntrada: new Date('2026-04-11T00:00:00.000Z'),
      fechaSalida: new Date('2026-04-13T00:00:00.000Z'),
      esEspecial: true,
      serviciosAdicionales: 'bano,paseo',
      estado: ReservationStatus.CONFIRMADA,
      fechaCreacion: new Date('2026-04-01T15:00:00.000Z'),
      pet: {
        id: 'pet-1',
        nombre: 'Milo',
        userId: 'user-1',
        isActive: true,
      },
      room: {
        id: 'room-1',
        numero: 'Habitacion 11',
      },
    };

    prisma.reservation.findUnique
      .mockResolvedValueOnce(existingReservation)
      .mockResolvedValueOnce(updatedReservation);
    prisma.reservation.findFirst.mockResolvedValue(null);
    prisma.reservation.update.mockResolvedValue({ id: 'reservation-1' });

    await service.update('reservation-1', 'user-1', {
      fechaEntrada: '2026-04-11',
      fechaSalida: '2026-04-13',
      serviciosAdicionales: ['bano', 'paseo'],
    });

    expect(notificationsService.sendByType).toHaveBeenCalledWith(
      TipoNotificacion.MODIFICACION_RESERVA,
      'user-1',
      {
        petName: 'Milo',
        checkInDate: '11/04/2026',
        checkOutDate: '13/04/2026',
        roomNumber: 'Habitacion 11',
      },
      'reservation-1',
    );
  });
});
