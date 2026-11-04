# EMOM Tracker

A personal workout journal built with Next.js, Prisma, and PostgreSQL.

## Authentication

The app supports email and password registration at `/register`, sign-in at `/login`, and sign-out from the app header. Passwords are hashed with Argon2id. New passwords must be at least 12 characters. Sessions use Auth.js encrypted JWTs in HTTP-only, same-site cookies; cookies are secure in production and sessions expire after 30 days. Email verification and password reset are not configured.

Login and registration attempts are rate limited in PostgreSQL over 15-minute windows. Email and IP identifiers are HMAC-hashed before they are stored.

All workout pages and workout mutations require a signed-in account. Workout reads and writes are scoped to that account. The 21 workouts that predated accounts were assigned to the first account.

## Environment setup

Configure these variables in `.env` for local development or in the deployment environment:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="a-long-random-secret"
```

`DATABASE_URL` is used by the app at runtime. `DIRECT_URL` is used by Prisma migrations. Generate a unique secret with Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Keep `AUTH_SECRET` private and use a different value for each environment. Do not commit `.env`.

Apply pending migrations and regenerate Prisma Client after checkout or schema changes:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production build

```bash
npm run build
npm run start
```
