# Campus Signal backend foundation

This is a separate TypeScript API foundation for the existing React/Vite demo. The frontend is not connected to it in this step; local demo state and seed data remain unchanged.

## Requirements

- Node.js 20 or newer
- PostgreSQL 13 or newer

## Install and configure

From the repository root:

```sh
npm install
Copy-Item .env.example .env
```

Set `DATABASE_URL` in `.env` to a PostgreSQL connection string for a local development database. The API can start without it so that its liveness endpoint remains available, but readiness checks and migrations require a working database. `.env.example` contains placeholders only; do not commit credentials.

`CORS_ORIGINS` is a comma-separated list of exact browser origins. Its default permits the local Vite development server only. Wildcard origins are rejected. `API_PORT` defaults to `4000`. `SUPABASE_URL` is the Supabase project origin; it is required for authentication but not for API liveness. The backend validates Supabase access tokens against the project's asymmetric signing-key endpoint; it does not need a service-role key or JWT secret.

## Run

From the repository root:

```sh
npm run dev:backend
```

The API listens on `http://localhost:4000` by default:

- `GET /api/health` is a liveness check and does not require PostgreSQL.
- `GET /api/health/ready` checks database connectivity and returns `503` if PostgreSQL is unavailable.
- `GET /api/auth/me` validates a Supabase bearer access token and returns only its verified subject identifier.

## Migrations

Create a PostgreSQL database, set `DATABASE_URL`, then run:

```sh
npm run db:migrate
```

The migration runner applies sorted SQL migration files once, records them in `public.schema_migrations`, and wraps each migration in a transaction.

## Build and tests

```sh
npm run build:backend
npm run test:backend
```

The compiled server can be started with `npm run start:backend`. The migration command runs from the TypeScript source so the SQL migration files remain available alongside the source.

## Initial relational schema

`backend/src/db/migrations/0001_initial_schema.sql` creates:

- `users`: user identity/profile fields and a role value; authentication is not implemented here.
- `clubs`: campus organizations, with an optional owner user.
- `events`: club/creator ownership, schedule, capacity and publication status.
- `event_registrations`: one row per user/event, with registration or waitlist status.
- `opportunities`: organization, listing details, deadline and publication status.
- `teams`: event-linked teams and member capacity.
- `team_members`: team/user membership requests and status.
- `notifications`: user-owned notifications with optional event linkage and read timestamp.

Foreign keys, uniqueness and check constraints protect core relationships and valid states. Indexes support status/date listings and user/event lookup patterns. User email uniqueness is case-insensitive. Timestamps are stored as `timestamptz`.

## Operational notes

Request logs include only method, response status and duration; they omit request bodies, headers, query strings and user identifiers. Unexpected API errors return a generic message, not stack traces or database details. Configure exact production CORS origins before deployment. Supabase access-token validation is implemented, but frontend login, user provisioning, application role authorization, business APIs, backups and production monitoring are not.
