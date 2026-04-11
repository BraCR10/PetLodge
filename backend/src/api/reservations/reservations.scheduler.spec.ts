import { Test, TestingModule } from '@nestjs/testing';
import { ReservationStatus } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ReservationsScheduler } from './reservations.scheduler';

type UpdateManyResult = { count: number };
type MockFn = jest.Mock<Promise<UpdateManyResult>, [unknown]>;

const mockPrisma: { reservation: { updateMany: MockFn } } = {
  reservation: {
    updateMany: jest.fn(),
  },
};

describe('ReservationsScheduler', () => {
  let scheduler: ReservationsScheduler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationsScheduler, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    scheduler = module.get<ReservationsScheduler>(ReservationsScheduler);
    jest.clearAllMocks();
  });

  describe('syncReservationStatuses', () => {
    it('transitions CONFIRMADA reservations to EN_PROGRESO when fechaEntrada <= today', async () => {
      mockPrisma.reservation.updateMany.mockResolvedValue({ count: 2 });

      await scheduler.syncReservationStatuses();

      expect(mockPrisma.reservation.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: ReservationStatus.CONFIRMADA,
          }),
          data: { estado: ReservationStatus.EN_PROGRESO },
        }),
      );
    });

    it('transitions EN_PROGRESO reservations to COMPLETADA when fechaSalida <= today', async () => {
      mockPrisma.reservation.updateMany.mockResolvedValue({ count: 3 });

      await scheduler.syncReservationStatuses();

      expect(mockPrisma.reservation.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: ReservationStatus.EN_PROGRESO,
          }),
          data: { estado: ReservationStatus.COMPLETADA },
        }),
      );
    });

    it('runs both transitions in parallel on each execution', async () => {
      mockPrisma.reservation.updateMany.mockResolvedValue({ count: 0 });

      await scheduler.syncReservationStatuses();

      expect(mockPrisma.reservation.updateMany).toHaveBeenCalledTimes(2);
    });

    it('does not throw when no reservations match', async () => {
      mockPrisma.reservation.updateMany.mockResolvedValue({ count: 0 });

      await expect(scheduler.syncReservationStatuses()).resolves.toBeUndefined();
    });
  });
});
