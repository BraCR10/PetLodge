// Script that seeds the database with initial room data and notification templates.
import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient, TipoNotificacion } from '../generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run the Prisma seed script.');
}

const adapter = new PrismaNeon({ connectionString: databaseUrl });

const prisma = new PrismaClient({
  adapter,
} as ConstructorParameters<typeof PrismaClient>[0]);

const standardRooms = Array.from({ length: 10 }, (_, index) => ({
  numero: `Habitación ${index + 1}`,
}));

const specialRooms = Array.from({ length: 5 }, (_, index) => ({
  numero: `Habitación ${index + 11}`,
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
    name: 'Bienvenida de usuario',
    subject: 'Bienvenido a PetLodge',
    body: toTemplateBody(
      'Hola {{name}},\n\nTu cuenta en PetLodge ya esta lista y puedes empezar a gestionar tus reservas y mascotas.\n\nGracias por confiar en nosotros.\n\nEquipo PetLodge',
    ),
    variables: ['name', 'email'],
  },
  {
    tipo: TipoNotificacion.CONFIRMACION_RESERVA,
    name: 'Confirmacion de reserva',
    subject: 'Tu reserva esta confirmada',
    body: toTemplateBody(
      'Hola {{name}},\n\nLa reserva de {{petName}} fue confirmada con exito.\n\nFechas: {{checkInDate}} al {{checkOutDate}}\nHabitacion: {{roomNumber}}\n\nTe esperamos en PetLodge.\n\nEquipo PetLodge',
    ),
    variables: ['name', 'petName', 'checkInDate', 'checkOutDate', 'roomNumber'],
  },
  {
    tipo: TipoNotificacion.MODIFICACION_RESERVA,
    name: 'Modificacion de reserva',
    subject: 'Tu reserva fue actualizada',
    body: toTemplateBody(
      'Hola {{name}},\n\nHicimos cambios en la reserva de {{petName}}.\n\nNuevas fechas: {{checkInDate}} al {{checkOutDate}}\n\nSi deseas revisar otro detalle, estaremos encantados de ayudarte.\n\nEquipo PetLodge',
    ),
    variables: ['name', 'petName', 'checkInDate', 'checkOutDate'],
  },
  {
    tipo: TipoNotificacion.INICIO_HOSPEDAJE,
    name: 'Inicio de hospedaje',
    subject: '{{petName}} ya ingreso a PetLodge',
    body: toTemplateBody(
      'Hola {{name}},\n\nTe contamos que {{petName}} ya ingreso de forma segura a PetLodge.\n\nHora de ingreso: {{checkInTime}}\n\nTe mantendremos al tanto si hay novedades.\n\nEquipo PetLodge',
    ),
    variables: ['name', 'petName', 'checkInTime'],
  },
  {
    tipo: TipoNotificacion.FIN_HOSPEDAJE,
    name: 'Fin de hospedaje',
    subject: '{{petName}} finalizo su hospedaje',
    body: toTemplateBody(
      'Hola {{name}},\n\n{{petName}} ya finalizo su hospedaje con nosotros.\n\nGracias por elegir PetLodge y permitirnos cuidar a tu mascota.\n\nEquipo PetLodge',
    ),
    variables: ['name', 'petName'],
  },
  {
    tipo: TipoNotificacion.ESTADO_MASCOTA,
    name: 'Actualizacion de mascota',
    subject: 'Novedades sobre {{petName}}',
    body: toTemplateBody(
      'Hola {{name}},\n\nQueremos compartirte una actualizacion sobre {{petName}}:\n\n{{statusMessage}}\n\nGracias por confiar en PetLodge.\n\nEquipo PetLodge',
    ),
    variables: ['name', 'petName', 'statusMessage'],
  },
];

async function main(): Promise<void> {
  await Promise.all([
    ...rooms.map((room) =>
      prisma.room.upsert({
        where: { numero: room.numero },
        update: {},
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
