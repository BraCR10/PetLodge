# PetLodge Backend — Development Stages

Each stage must be fully working and testable via Swagger before the next begins.
Stages 3, 4, and 5 can be developed in parallel once Stage 2 is complete.

---

## Stage 1 — Foundation

**Goal:** NestJS server running, connected to Neon via Prisma, with Swagger accessible.

- [x] Run `nest new .` inside `backend/` with TypeScript and npm.
- [x] Install dependencies:
  `@nestjs/config`, `@nestjs/jwt`, `prisma`, `@prisma/client`, `@prisma/adapter-neon`, `@neondatabase/serverless`,
  `@nestjs/swagger`, `swagger-ui-express`, `class-validator`, `class-transformer`,
  `bcryptjs`, `@types/bcryptjs`, `nodemailer`, `@types/nodemailer`,
  `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`.
- [x] Create `.env` and `.env.example` with all required variables (see README).
- [x] Register `ConfigModule.forRoot({ isGlobal: true })` in `AppModule`.
- [x] Write the full Prisma schema with all models and enums. Datasource URL configured via `prisma.config.ts`.
- [x] Run `npx prisma migrate dev --name init` to apply the schema to Neon.
- [x] Create `PrismaService`: extends `PrismaClient` with `PrismaNeonHttp` adapter, calls `$connect()` on `OnModuleInit` and `$disconnect()` on `OnModuleDestroy`.
- [x] Create `PrismaModule`: declares and exports `PrismaService`, marked `@Global()`.
- [x] Configure `main.ts`: global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`, `enableCors()`, and Swagger at `/api` with Bearer auth.
- [x] Create `LoggerModule` (global): Winston-backed logger with colored output in development and structured JSON in production. Replaces NestJS default logger via `WINSTON_MODULE_NEST_PROVIDER`.
- [x] Create `LoggingInterceptor` (global): logs every HTTP request with method, path, status code, duration, and user ID.
- [x] Create `HttpExceptionFilter` (global): normalizes all error responses to `{ statusCode, message }`. 4xx errors surface the intended message in Spanish; 5xx errors return a generic message and log full details internally.

**Done when:** Server starts without errors and Swagger UI loads at `/api`.

---

## Stage 2 — Auth

**Goal:** Users can register and log in. All protected routes require a valid JWT bearer token.

**Auth layer:** Passwords are hashed with `bcryptjs` (cost factor 12) and stored in `public.User.password`. On login or register, a signed JWT is issued containing `{ sub, email, isAdmin }` with a 7-day expiry. The JWT secret is read from `JWT_SECRET` env variable.

- [x] `POST /auth/register`:
  - Accept: `nombre`, `numeroIdentificacion`, `email`, `password` (min 8 chars), `numeroTelefono?`, `direccion?`.
  - Throw `409` if `email` or `numeroIdentificacion` already exists.
  - Hash password with bcrypt, create `public.User`, return `{ user: Usuario, access_token: string }`.
- [x] `POST /auth/login`:
  - Accept: `email`, `password`.
  - Throw `401` if user not found, `isActive` is false, or password does not match.
  - Return `{ user: Usuario, access_token: string }`.
- [x] Register `JwtModule` globally in `AppModule` with `JWT_SECRET` and `expiresIn: '7d'`.
- [x] Create `SessionGuard` (global): extracts `Authorization: Bearer <token>`, verifies JWT, loads `public.User`, attaches `{ ...user, role: 'admin' | 'user' }` to `req.currentUser`. Use `@Public()` to bypass.
- [x] Create `RolesGuard` (global, runs after `SessionGuard`): reads `@Roles(...roles)` metadata, checks `req.currentUser.role`. Throws `403` if role is not allowed.
- [x] Create `@CurrentUser()` param decorator: extracts `req.currentUser` (type `AuthenticatedUser = User & { role: string }`).
- [x] Create `@Roles()` decorator: `@Roles('admin')` restricts a route to admin users.
- [x] Create `@Public()` decorator: bypasses `SessionGuard` for auth routes and health checks.

**Role values (`User.isAdmin`):**
- `false` → role `'user'` — default for all registered users
- `true` → role `'admin'` — set directly in the database

**Done when:** Login returns a bearer token that works in Swagger's Authorize dialog. Protected routes return `401` without a token and `403` with a non-admin token on admin-only routes.

---

## Stage 3 — Users

**Goal:** Authenticated users can read, update, and deactivate their own profile.

All routes require a valid JWT bearer token (enforced globally by `SessionGuard`).

- [x] `GET /users/me`: Return the authenticated user's profile. Excludes `password`. `fechaRegistro` is returned as an ISO string. Response matches the `Usuario` frontend type.
- [x] `PATCH /users/me`: Accept optional `nombre`, `numeroTelefono`, `direccion`. `email` and `numeroIdentificacion` are intentionally not updatable. Returns the updated profile.
- [x] `DELETE /users/me`: Soft-delete by setting `isActive = false`. Returns `204 No Content`.

**Implementation notes:**
- `UsersService` — `getProfile`, `update`, `deactivate` methods. Uses global `PrismaModule`.
- `UsersController` — `@ApiBearerAuth()` applied at class level; uses `@CurrentUser()` param decorator to read `req.currentUser`.
- `UsersModule` — no extra imports needed (`PrismaModule` is global).
- Password is stripped in `toResponse` via destructuring before returning any user object.

**Frontend contract note:** `Usuario.id` is typed as `number` in the frontend but the DB uses UUID strings. The frontend will need to accept `string` for `id` when API integration is wired up.

**Done when:** Full profile lifecycle works end-to-end via Swagger. Password is never returned in any response.

---

## Stage 4 — Pets ✓

**Goal:** Users can manage their pets and upload a photo per pet to AWS S3.

- [x] `StorageService` (`src/storage/`): wraps `S3Client` singleton.
  - `upload(buffer, mimetype, filename)`: generates a UUID key, uploads via `PutObjectCommand`, returns public URL.
  - `delete(key)`: removes object via `DeleteObjectCommand`.
  - `keyFromUrl(url)`: extracts the S3 key from a stored URL (handles both standard S3 and custom `AWS_ENDPOINT`).
  - `StorageModule` is `@Global()` — imported in `AppModule` alongside infrastructure modules.
- [x] `POST /pets`: accepts `multipart/form-data`. Required fields: `nombre`, `tipo`, `raza`, `anos`, `sexo`, `tamano`, `estadoVacunacion`. Optional: `meses`, `condicionesMedicas`, `numeroVeterinario`, `cuidadosEspeciales`, `foto` (binary). If no photo, `foto` defaults to the DiceBear avatar URL (`AVATAR_API` + encoded `nombre`).
- [x] `GET /pets`: returns all active pets for the authenticated user.
- [x] `GET /pets/:id`: returns a single pet. Throws `404` / `403` on missing or unauthorized.
- [x] `PATCH /pets/:id`: all fields optional. Accepts optional `foto` file — replaces the old S3 object before uploading the new one. No separate photo endpoint.
- [x] `DELETE /pets/:id`: soft-delete (`isActive = false`). Photo remains in S3. Returns `204 No Content`.
- [x] `NormalizeEncodingInterceptor` applied to `PetsController`: repairs UTF-8-as-Latin-1 mojibake from Swagger/clients and maps accented field names (`tamaño → tamano`, `años → anos`) to their ASCII-safe DTO equivalents.

**Implementation notes:**
- DB columns `tamano` and `anos` are ASCII-safe. `toResponse()` maps them back to `tamaño` and `años` for the response.
- `tipo` accepts any string (not restricted to an enum) — custom pet types are valid.
- Age split: `anos Int @default(0)` + `meses Int @default(0)`. Cross-field rule enforced in DTO: `anos=0` and `meses=0` is rejected.
- All string enum fields (`tipo`, `sexo`, `tamano`) are lowercased via `@Transform` before validation.
- `estadoVacunacion` is a free-text `String` field (not boolean).

**Frontend contract gaps (resolve before integration):**
- `Mascota.id`: frontend types `number`, backend returns UUID `string` → frontend needs `id: string`.
- `Mascota.edad`: frontend has single `edad: number`, backend now returns `años: number` + `meses: number` → frontend needs to split the age field.

**Done when:** Pet CRUD works end-to-end via Swagger. Photo URL is persisted and publicly accessible via S3.

---

## Stage 5 — Rooms

**Goal:** Room records exist in the DB and clients can query availability for a date range.

- [x] Create a Prisma seed script that inserts a fixed set of rooms (e.g. 10 standard + 5 special). Register the seed command in `package.json` under `prisma.seed`.
- [x] `GET /rooms`: Return all rooms. Response must match the frontend `Habitacion` type: `{ id: number, name: string }`.
- [x] `GET /rooms/available?from=YYYY-MM-DD&to=YYYY-MM-DD`: Validate that both query params are valid dates. Return rooms where no reservation with `estado` in `(en progreso, confirmada)` has an overlapping date range. Overlap condition: `fechaEntrada < to AND fechaSalida > from`.

**Frontend contract note:** `Habitacion.id` is typed as `number` in the frontend but the DB will use UUID strings. Align at integration time.

**Done when:** Querying with a date range that has existing reservations excludes the occupied rooms correctly.

---

## Stage 6 — Reservations

**Goal:** Users can create, view, modify, and cancel reservations with full business rule enforcement.

- [ ] `POST /reservations`:
  - Accept: `mascotaId`, `habitacionId`, `fechaEntrada`, `fechaSalida`, `esEspecial` (boolean), `serviciosAdicionales?` (string).
  - Throw `403` if `mascotaId` does not belong to the current user.
  - Throw `400` if `esEspecial` is false and `serviciosAdicionales` is provided.
  - Throw `409` if the room has an overlapping active reservation (same overlap query as Stage 5).
  - Create reservation with `estado = 'confirmada'`.
  - Return a `Reserva` object matching the frontend type: `{ id, nombreMascota, fechaEntrada, fechaSalida, habitacionId, estado, esEspecial, serviciosAdicionales? }`.
- [ ] `GET /reservations?estado=`: Return the authenticated user's reservations, optionally filtered by `estado`.
- [ ] `GET /reservations/:id`: Return full reservation detail. Throw `404` if not found, `403` if not the owner.
- [ ] `PATCH /reservations/:id`: Allow updating `fechaEntrada`, `fechaSalida`, `esEspecial`, and `serviciosAdicionales`. Throw `400` if current `estado` is not `confirmada`. Re-validate room availability and service rules. Return updated `Reserva`.
- [ ] `DELETE /reservations/:id`: Verify ownership. Set `estado = 'cancelada'`. Return `204 No Content`.

**Frontend `Reserva` type (from `frontend/src/types/index.ts`):**
```typescript
{ id: number; nombreMascota: string; fechaEntrada: string; fechaSalida: string;
  habitacionId: number; estado: EstadoReserva; esEspecial: boolean; serviciosAdicionales?: string }
```

**Frontend contract note:** `Reserva.id` and `habitacionId` are typed as `number`, DB uses UUIDs. Align at integration time.

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
    5. Write a `NotificationLog` with `enviado = true` on success, or `enviado = false` and the error message on failure. Never throw — errors must be logged and execution must continue.
  - `findAll()`: return all templates as `NotificationTemplate[]`.
  - `findOne(id)`: return one template by id, throw `404` if not found.
  - `update(id, dto)`: update `subject` and/or `body`.
  - `findLogs(userId)`: return send history for the user, ordered by `fechaEnvio` descending.
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
        ├── Stage 4 — Pets           (parallel) ✓
        │     └── Stage 6 — Reservations
        └── Stage 5 — Rooms          (parallel)
              └── Stage 6 — Reservations
                    └── Stage 7 — Notifications
                          (wires back into Stage 2 and Stage 6)
```
