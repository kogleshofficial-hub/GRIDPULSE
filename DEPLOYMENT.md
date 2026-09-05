# GRIDPULSE Deployment

## Required environment variables

`DATABASE_URL` — PostgreSQL connection string for the restricted application role.

`REPORTER_HASH_SALT` — long random secret used to pseudonymize reporter network fingerprints. Never commit it.

## Local

1. Install Node.js 20+.
2. Run `npm install`.
3. Apply `db/schema.sql` to a PostgreSQL 16+ database.
4. Create `.env.local` with the two variables above.
5. Run `npm run dev`.
6. Check `/api/health`.

## Vercel

Import the GitHub repository, set the production environment variables, and deploy. Do not place secrets in source control.

## Azure PostgreSQL

Use Azure Database for PostgreSQL Flexible Server. Prefer private networking where the deployment topology supports it. Use a least-privilege application role and TLS. For high availability, backups and connection pooling, choose the configuration appropriate to the available production budget.

## First production verification

- `/api/health` returns database reachable.
- A telemetry POST returns 201.
- The inserted report exists in PostgreSQL.
- Validation metrics are created by the database function.
- Dashboard counts change from database state.
- Rate limiting rejects excessive requests.
- No secret appears in Git history.
