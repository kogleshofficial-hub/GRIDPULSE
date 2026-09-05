import { Pool, type QueryResultRow } from "pg";

const globalForPg = globalThis as unknown as { gridpulsePool?: Pool };

function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  if (globalForPg.gridpulsePool) {
    return globalForPg.gridpulsePool;
  }

  const pool = new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  globalForPg.gridpulsePool = pool;
  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getPool().query<T>(text, values);
}
