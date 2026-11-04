# EMOM Tracker

A personal workout journal built with Next.js, Prisma, and PostgreSQL.

## Authentication setup

Authentication uses Auth.js with email and password credentials. Accounts are stored in PostgreSQL, passwords are hashed with Argon2id, and sessions use Auth.js's signed, HTTP-only cookies.

Set these values in `.env` before starting the app:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="a-long-random-secret"
```

Use a cryptographically random value for `AUTH_SECRET` and keep it private. Apply the checked-in database migrations and regenerate Prisma Client:

```bash
npx prisma migrate deploy
npx prisma generate
```

The login page is at `/login`, and registration is at `/register`.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
