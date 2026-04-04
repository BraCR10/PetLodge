//Script that seeds the database with initial data for rooms. 
//It creates 10 standard rooms and 5 special rooms, all marked as available.
//The script uses the Prisma Client to perform upsert operations, ensuring 
//that if a room with the same number already exists, it will be updated 
//instead of creating a duplicate entry.
import 'dotenv/config';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import { PrismaClient, TipoNotificacion } from '../generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run the Prisma seed script.');
}

const prisma = new PrismaClient({
  adapter: new PrismaNeonHttp(databaseUrl, {}),
} as ConstructorParameters<typeof PrismaClient>[0]);

const standardRooms = Array.from({ length: 10 }, (_, index) => ({
  numero: `Habitación ${index + 1}`,
  tipo: 'estandar',
  isAvailable: true,
}));

const specialRooms = Array.from({ length: 5 }, (_, index) => ({
  numero: `Habitación ${index + 11}`,
  tipo: 'especial',
  isAvailable: true,
}));

const rooms = [...standardRooms, ...specialRooms];

type SeedNotificationTemplate = {
  tipo: TipoNotificacion;
  name: string;
  subject: string;
  body: string;
  variables: string[];
};

function toTemplateBody(body: string): string {
  return body.replace(/\{([a-zA-Z0-9_]+)\}/g, '{{$1}}');
}

const notificationTemplates: SeedNotificationTemplate[] = [
  {
    tipo: TipoNotificacion.REGISTRO_USUARIO,
    name: 'User registration',
    subject: 'Welcome to PetLodge',
    body: toTemplateBody(
      'Dear {name},\n\nThank you for registering with PetLodge. Your account has been successfully created.\n\nBest regards,\nPetLodge Team',
    ),
    variables: ['name', 'email'],
  },
  {
    tipo: TipoNotificacion.CONFIRMACION_RESERVA,
    name: 'Reservation confirmation',
    subject: 'Reservation Confirmed',
    body: toTemplateBody(
      'Dear {name},\n\nYour reservation for {petName} has been confirmed for {checkInDate} to {checkOutDate}.\n\nRoom: {roomNumber}\n\nBest regards,\nPetLodge Team',
    ),
    variables: ['name', 'petName', 'checkInDate', 'checkOutDate', 'roomNumber'],
  },
  {
    tipo: TipoNotificacion.MODIFICACION_RESERVA,
    name: 'Reservation modification',
    subject: 'Reservation Modified',
    body: toTemplateBody(
      'Dear {name},\n\nYour reservation for {petName} has been modified.\n\nNew dates: {checkInDate} to {checkOutDate}\n\nBest regards,\nPetLodge Team',
    ),
    variables: ['name', 'petName', 'checkInDate', 'checkOutDate'],
  },
  {
    tipo: TipoNotificacion.INICIO_HOSPEDAJE,
    name: 'Logging start',
    subject: 'Pet Check-In Successful',
    body: toTemplateBody(
      'Dear {name},\n\n{petName} has been successfully checked in to PetLodge.\n\nCheck-in time: {checkInTime}\n\nBest regards,\nPetLodge Team',
    ),
    variables: ['name', 'petName', 'checkInTime'],
  },
  {
    tipo: TipoNotificacion.FIN_HOSPEDAJE,
    name: 'Logging end',
    subject: 'Pet Check-Out Complete',
    body: toTemplateBody(
      'Dear {name},\n\n{petName} has been successfully checked out from PetLodge.\n\nThank you for choosing us!\n\nBest regards,\nPetLodge Team',
    ),
    variables: ['name', 'petName'],
  },
  {
    tipo: TipoNotificacion.ESTADO_MASCOTA,
    name: 'Pet status update',
    subject: 'Update on your pet',
    body: toTemplateBody(
      'Dear {name},\n\nWe wanted to update you on {petName}:\n\n{statusMessage}\n\nBest regards,\nPetLodge Team',
    ),
    variables: ['name', 'petName', 'statusMessage'],
  },
];

async function main(): Promise<void> {
  await Promise.all([
    ...rooms.map((room) =>
      prisma.room.upsert({
        where: { numero: room.numero },
        update: {
          tipo: room.tipo,
          isAvailable: room.isAvailable,
        },
        create: room,
      }),
    ),
    ...notificationTemplates.map((template) =>
      prisma.notificationTemplate.upsert({
        where: { tipo: template.tipo },
        update: {
          name: template.name,
          subject: template.subject,
          body: template.body,
          variables: template.variables,
        },
        create: template,
      }),
    ),
  ]);

  console.log(
    `Seeded ${rooms.length} rooms and ${notificationTemplates.length} notification templates.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed database.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
