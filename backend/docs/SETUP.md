# Backend Setup

## Prerequisites

- Node.js >= 18
- npm
- Access to a PostgreSQL database (Neon recommended)
- AWS S3 or compatible storage bucket

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `AWS_ENDPOINT` | S3-compatible endpoint URL |
| `AWS_REGION` | AWS region (e.g. `us-east-1`) |
| `S3_ID` | S3 access key ID |
| `S3_SECRET_KEY` | S3 secret access key |
| `S3_BUCKET` | S3 bucket name |
| `PRESIGN_EXPIRES_IN` | Pre-signed URL TTL in seconds (max 604800) |
| `AVATAR_API` | DiceBear base URL for default pet avatars |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port (default 587) |
| `MAIL_USER` | SMTP username |
| `MAIL_PASS` | SMTP password |
| `MAIL_FROM` | Sender email address |
| `PORT` | Port the server listens on (default 3000) |
| `NODE_ENV` | `development` or `production` |

## 3. Generate Prisma client

```bash
npx prisma generate
```

## 4. Run database migrations

```bash
npx prisma migrate deploy
```

## 5. Seed the database (optional)

```bash
npm run db:seed
```

## 6. Start the server

**Development (watch mode):**

```bash
npm run start:dev
```

**Production:**

```bash
npm run build
npm run start:prod
```

## API Docs

Swagger UI is available at `http://localhost:3000/api` once the server is running.
