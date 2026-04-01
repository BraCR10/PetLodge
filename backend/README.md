# PetLodge — Backend

REST API for the PetLodge pet hotel management system.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | NestJS 11 + TypeScript              |
| ORM        | Prisma 7 + Neon adapter             |
| Database   | PostgreSQL (Neon)                   |
| Auth       | JWT + Passport                      |
| Email      | Nodemailer                          |
| Storage    | AWS S3                              |
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

## Environment Variables

```env
DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=7d

AWS_ENDPOINT=
AWS_REGION=
S3_ID=
S3_SECRET_KEY=
S3_BUCKET=pet-photos

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
