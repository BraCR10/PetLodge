import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: { send: jest.Mock; findLogs: jest.Mock };

  beforeEach(() => {
    notificationsService = {
      send: jest.fn(),
      findLogs: jest.fn(),
    };

    controller = new NotificationsController(
      notificationsService as unknown as NotificationsService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('manually sends a notification template using the route id and request body', async () => {
    const result = {
      sent: true,
      error: null,
      logId: 'log-1',
    };
    notificationsService.send.mockResolvedValue(result);

    const response = await controller.send('template-1', {
      userId: 'user-1',
      reservaId: 'reservation-1',
      variables: {
        petName: 'Milo',
        roomNumber: 'Habitacion 11',
      },
    });

    expect(response).toEqual(result);
    expect(notificationsService.send).toHaveBeenCalledWith(
      'template-1',
      'user-1',
      {
        petName: 'Milo',
        roomNumber: 'Habitacion 11',
      },
      'reservation-1',
    );
  });

  it('returns the notification log for the authenticated user', async () => {
    const result = [
      {
        id: 'log-1',
        tipo: 'REGISTRO_USUARIO',
        enviado: true,
        error: null,
        fechaEnvio: '2026-04-04T10:00:00.000Z',
        reservaId: null,
        template: {
          id: 'template-1',
          tipo: 'REGISTRO_USUARIO',
          name: 'Bienvenida de usuario',
          subject: 'Bienvenido a PetLodge',
        },
      },
    ];
    notificationsService.findLogs.mockResolvedValue(result);

    const response = await controller.findLogs({ id: 'user-1' } as AuthenticatedUser);

    expect(response).toEqual(result);
    expect(notificationsService.findLogs).toHaveBeenCalledWith('user-1');
  });
});
