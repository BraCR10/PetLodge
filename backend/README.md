# PetLodge — Backend

REST API for the PetLodge pet hotel management system.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | NestJS 11 + TypeScript              |
| ORM        | Prisma                              |
| Database   | PostgreSQL (Neon)                   |
| Auth       | JWT + Passport                      |
| Email      | Nodemailer                          |
| Storage    | Supabase Storage                    |
| Docs       | Swagger / OpenAPI 3                 |
| Validation | class-validator + class-transformer |

## Modules

| Module        | Responsibility                                        |
|---------------|-------------------------------------------------------|
| auth          | Register, login, JWT issuance                         |
| users         | User profile read and update                          |
| pets          | Pet CRUD and photo upload                             |
| rooms         | Room listing and date-range availability              |
| reservations  | Booking lifecycle with overlap validation             |
| notifications | Template management, email dispatch, send log         |
| prisma        | Global database client                                |
| common        | Shared guards and decorators                          |

## Domain Model

Field names and types must match the mobile contract exactly.

### Usuario
| Field               | Type    | Notes              |
|---------------------|---------|--------------------|
| id                  | string  | UUID               |
| nombre              | string  |                    |
| numeroIdentificacion| string  | unique             |
| email               | string  | unique             |
| numeroTelefono      | string? |                    |
| direccion           | string? |                    |
| fechaRegistro       | string  | ISO 8601           |
| isAdmin             | boolean | default false      |

> `password` is never returned in any response.

### Mascota
| Field              | Type    | Notes                                    |
|--------------------|---------|------------------------------------------|
| id                 | string  | UUID                                     |
| nombre             | string  |                                          |
| tipo               | string  | `perro\|gato\|conejo\|pajaro\|otro`      |
| raza               | string  |                                          |
| edad               | number  | integer ≥ 0                              |
| sexo               | string  | `macho\|hembra`                          |
| tamaño             | string  | `pequeño\|mediano\|grande`               |
| estadoVacunacion   | boolean |                                          |
| condicionesMedicas | string  | empty string if none                     |
| numeroVeterinario  | string  | empty string if none                     |
| cuidadosEspeciales | string  | empty string if none                     |
| foto               | string? | Supabase public URL                      |

### Reserva
| Field         | Type   | Notes                                           |
|---------------|--------|-------------------------------------------------|
| id            | string | UUID                                            |
| nombreMascota | string | pet name — resolved from relation               |
| fechaEntrada  | string | ISO 8601 date                                   |
| fechaSalida   | string | ISO 8601 date                                   |
| habitacion    | string | room number — resolved from relation            |
| estado        | string | `en progreso\|confirmada\|completada\|cancelada`|

> The request body uses `mascotaId` and `habitacionId` (UUIDs). The response resolves them to names.

### NotificationTemplate
| Field     | Type     | Notes                        |
|-----------|----------|------------------------------|
| id        | string   | UUID                         |
| name      | string   |                              |
| subject   | string   | email subject                |
| body      | string   | supports `{{variable}}` tags |
| variables | string[] | list of placeholder keys     |

## API Endpoints

```
POST   /auth/register
POST   /auth/login

GET    /users/me
PATCH  /users/me
DELETE /users/me

GET    /pets
POST   /pets
GET    /pets/:id
PATCH  /pets/:id
DELETE /pets/:id
POST   /pets/:id/photo              multipart/form-data

GET    /rooms
GET    /rooms/available             ?from=YYYY-MM-DD&to=YYYY-MM-DD

GET    /reservations                ?estado=
POST   /reservations
GET    /reservations/:id
PATCH  /reservations/:id
DELETE /reservations/:id

GET    /notifications/templates
GET    /notifications/templates/:id
PATCH  /notifications/templates/:id
POST   /notifications/send/:id
GET    /notifications/logs
```

All routes except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.

## Environment Variables

```env
DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=7d

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=pet-photos

MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

## Running Locally

```bash
npm install
npx prisma migrate dev --name init
npm run start:dev
```

Swagger UI: `http://localhost:3000/api`
