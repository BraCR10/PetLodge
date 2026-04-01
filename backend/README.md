# PetLodge — Backend

REST API for the PetLodge pet hotel management system.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | NestJS 11 + TypeScript              |
| ORM        | Prisma 7 + Neon adapter             |
| Database   | PostgreSQL (Neon)                   |
| Auth       | JWT (`@nestjs/jwt`) + bcryptjs      |
| Email      | Nodemailer                          |
| Storage    | AWS S3                              |
| Docs       | Swagger / OpenAPI 3                 |
| Validation | class-validator + class-transformer |
| Logging    | Winston + nest-winston              |

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
| common        | Shared guards, decorators, filters, interceptors      |

## Environment Variables

```env
DATABASE_URL=
JWT_SECRET=

AWS_ENDPOINT=
AWS_REGION=
S3_ID=
S3_SECRET_KEY=
S3_BUCKET=

AVATAR_API=https://api.dicebear.com/7.x/initials/svg?seed=

MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=

PORT=3000
NODE_ENV=development
```

## Running Locally

```bash
npm install
npx prisma migrate dev
npm run start:dev
```

## Swagger UI

Once the server is running, open your browser at:

```
http://localhost:3000/api
```

### Authenticating in Swagger

1. Call `POST /auth/register` or `POST /auth/login` — copy the `access_token` from the response.
2. Click the **Authorize** button (top right of the Swagger page).
3. In the **bearerAuth** field, paste the token and click **Authorize**.
4. All subsequent requests in Swagger will include `Authorization: Bearer <token>` automatically.

> Tokens expire after 7 days. Repeat from step 1 if you get a `401`.
