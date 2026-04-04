import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: { send: jest.Mock };

  beforeEach(() => {
    notificationsService = {
      send: jest.fn(),
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
});
