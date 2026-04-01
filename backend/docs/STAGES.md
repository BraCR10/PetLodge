# PetLodge Backend — Development Stages

Each stage must be fully working and testable via Swagger before the next begins.
Stages 3, 4, and 5 can be developed in parallel once Stage 2 is complete.

---

## Stage 1 — Foundation

**Goal:** NestJS server running, connected to Neon via Prisma, with Swagger accessible.

- [ ] Run `nest new .` inside `backend/` with TypeScript and npm.
- [ ] Install dependencies:
  `@nestjs/config`, `prisma`, `@prisma/client`, `@nestjs/swagger`, `swagger-ui-express`,
  `class-validator`, `class-transformer`, `bcrypt`, `@types/bcrypt`,
  `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `passport-local`,
  `@types/passport-jwt`, `@types/passport-local`,
  `nodemailer`, `@types/nodemailer`, `@supabase/supabase-js`.
- [ ] Create `.env` and `.env.example` at the root of `backend/` with all required variables (see README).
- [ ] Register `ConfigModule.forRoot({ isGlobal: true })` in `AppModule` so env vars are available across all modules without re-importing.
- [ ] Write the full Prisma schema with all models and enums. Set `provider = "postgresql"` and `url = env("DATABASE_URL")`.
- [ ] Run `npx prisma migrate dev --name init` to apply the schema to the Neon database.
- [ ] Create `PrismaService`: extends `PrismaClient`, calls `$connect()` on `OnModuleInit` and `$disconnect()` on `OnModuleDestroy`.
- [ ] Create `PrismaModule`: declares and exports `PrismaService`, marked `@Global()` so no other module needs to import it.
- [ ] Configure `main.ts`: global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`, `enableCors()`, and Swagger setup at `/api` with Bearer auth support.

**Done when:** Server starts without errors and Swagger UI loads at `/api`.

---

## Stage 2 — Auth

**Goal:** Users can register and log in. All subsequent protected routes require a valid JWT.

- [ ] `POST /auth/register`:
  - Accept: `nombre`, `numeroIdentificacion`, `email`, `password` (min 6 chars), `numeroTelefono?`, `direccion?`.
  - Throw `409 Conflict` if `email` or `numeroIdentificacion` already exists.
  - Hash password with `bcrypt.hash(password, 10)` before saving.
  - Return the created `Usuario` (without `password`) and an `access_token`.
- [ ] `POST /auth/login`:
  - Accept: `email`, `password`.
  - Throw `401 Unauthorized` if user is not found or password does not match.
  - Return `{ access_token: string }`.
- [ ] Create `JwtStrategy`: validates the Bearer token, loads the user from DB by the token's `sub` field, throws `401` if user is not found or `isActive` is false.
- [ ] Create `JwtAuthGuard`: extends `AuthGuard('jwt')`, applied to all protected routes.
- [ ] Create `@CurrentUser()` param decorator: extracts `req.user` from the execution context for use in controller method parameters.

**Done when:** Login returns a JWT that can be pasted into Swagger's Authorize dialog to access protected routes.

---

## Stage 3 — Users

**Goal:** Authenticated users can read, update, and deactivate their own profile.

- [ ] `GET /users/me`: Return the authenticated user's profile. Response must match the `Usuario` type — exclude `password`, include `fechaRegistro` as ISO string.
- [ ] `PATCH /users/me`: Accept optional `nombre`, `numeroTelefono`, `direccion`. `email` and `numeroIdentificacion` must not be updatable. Return the updated `Usuario`.
- [ ] `DELETE /users/me`: Soft-delete the account by setting `isActive = false`. Return `204 No Content`.

**Done when:** Full profile lifecycle works end-to-end via Swagger. Password is never returned in any response.

---

## Stage 4 — Pets

**Goal:** Users can manage their pets and upload a photo per pet to Supabase Storage.

- [ ] Create `StorageService`: wraps the Supabase client.
  - `upload(buffer, mimetype, filename)`: uploads to the configured bucket and returns the public URL.
  - `delete(url)`: extracts the file path from the URL and removes it from the bucket.
- [ ] `POST /pets`: Accept all `Mascota` fields except `id` and `foto`. `condicionesMedicas`, `numeroVeterinario`, and `cuidadosEspeciales` default to empty string if not provided. Return the created `Mascota`.
- [ ] `GET /pets`: Return all pets belonging to the authenticated user. Response is an array of `Mascota`.
- [ ] `GET /pets/:id`: Return a single pet. Throw `404` if not found. Throw `403` if the pet does not belong to the current user.
- [ ] `PATCH /pets/:id`: All fields optional. Verify ownership before updating. Return the updated `Mascota`.
- [ ] `DELETE /pets/:id`: Verify ownership. If `foto` exists, call `StorageService.delete` first. Delete the record.
- [ ] `POST /pets/:id/photo`: Accept `multipart/form-data` with a single file field. Verify ownership. If pet already has a photo, delete the old one from Supabase before uploading the new one. Update `foto` with the returned URL. Return the updated `Mascota`.

**Done when:** Pet CRUD works and the uploaded photo URL is persisted and publicly accessible.

---

## Stage 5 — Rooms

**Goal:** Room records exist in the DB and clients can query availability for a date range.

- [ ] Create a Prisma seed script that inserts a fixed set of rooms (e.g. 10 standard + 5 special). Register the seed command in `package.json` under `prisma.seed`.
- [ ] `GET /rooms`: Return all rooms.
- [ ] `GET /rooms/available?from=YYYY-MM-DD&to=YYYY-MM-DD`: Validate that both query params are valid dates. Return rooms where no reservation with `estado` in `(en progreso, confirmada)` has an overlapping date range. Overlap condition: `fechaEntrada < to AND fechaSalida > from`.

**Done when:** Querying with a date range that has existing reservations excludes the occupied rooms correctly.

---

## Stage 6 — Reservations

**Goal:** Users can create, view, modify, and cancel reservations with full business rule enforcement.

- [ ] `POST /reservations`:
  - Accept: `mascotaId`, `habitacionId`, `fechaEntrada`, `fechaSalida`, `tipoHospedaje` (`estandar|especial`), `serviciosAdicionales?` (array of `baño|paseo|alimentacion especial`).
  - Throw `403` if `mascotaId` does not belong to the current user.
  - Throw `400` if `serviciosAdicionales` is non-empty and `tipoHospedaje` is `estandar`.
  - Throw `409` if the room has an overlapping active reservation (same overlap query as Stage 5).
  - Create reservation with `estado = 'confirmada'`.
  - Return a `Reserva` object: resolve `nombreMascota` from the pet relation and `habitacion` from the room's `numero` field.
- [ ] `GET /reservations?estado=`: Return the authenticated user's reservations, optionally filtered by `estado`. Each item must match the `Reserva` type with resolved `nombreMascota` and `habitacion`.
- [ ] `GET /reservations/:id`: Return full reservation detail. Throw `404` if not found, `403` if not the owner.
- [ ] `PATCH /reservations/:id`: Allow updating `fechaEntrada`, `fechaSalida`, and `serviciosAdicionales`. Throw `400` if current `estado` is not `confirmada`. Re-validate room availability and service rules. Return updated `Reserva`.
- [ ] `DELETE /reservations/:id`: Verify ownership. Set `estado = 'cancelada'`. Return `204 No Content`.

**Done when:** Overlap conflict returns `409`, service rule violation returns `400`, and all responses match the `Reserva` type.

---

## Stage 7 — Notifications

**Goal:** Emails are sent automatically on key actions using templates stored in the database.

- [ ] Add `NotificationTemplate` seeding to the Prisma seed script. Insert one record per notification type. Template body uses `{{key}}` placeholders. The `name`, `subject`, and `body` fields must match the `NotificationTemplate` mobile type.
- [ ] Create `NotificationsService`:
  - `send(templateId, userId, variables?, reservaId?)`:
    1. Load the template from DB.
    2. Load the user's email and `nombre` from DB.
    3. Replace all `{{key}}` placeholders in `subject` and `body` using the `variables` map.
    4. Send the email via Nodemailer using SMTP credentials from env.
    5. Write a `NotificationLog` with `sent = true` on success, or `sent = false` and the error message on failure. Never throw — errors must be logged and execution must continue.
  - `findAll()`: return all templates as `NotificationTemplate[]`.
  - `findOne(id)`: return one template by id, throw `404` if not found.
  - `update(id, dto)`: update `subject` and/or `body`.
  - `findLogs(userId)`: return send history for the user, ordered by `sentAt` descending.
- [ ] Wire `NotificationsService` into `AuthService` (call on register) and `ReservationsService` (call on create and update).
- [ ] `GET /notifications/templates`: return all templates.
- [ ] `GET /notifications/templates/:id`: return one template.
- [ ] `PATCH /notifications/templates/:id`: update `subject` and/or `body`.
- [ ] `POST /notifications/send/:id`: manually trigger a send for a given template (for testing).
- [ ] `GET /notifications/logs`: return the authenticated user's send log.

**Done when:** Registering a user and creating/modifying a reservation trigger real emails. The send log reflects success or failure per notification.

---

## Stage Dependencies

```
Stage 1 — Foundation
  └── Stage 2 — Auth
        ├── Stage 3 — Users          (parallel)
        ├── Stage 4 — Pets           (parallel)
        │     └── Stage 6 — Reservations
        └── Stage 5 — Rooms          (parallel)
              └── Stage 6 — Reservations
                    └── Stage 7 — Notifications
                          (wires back into Stage 2 and Stage 6)
```
