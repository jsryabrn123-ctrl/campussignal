import { Pool } from "pg";
import { env } from "../config/env.js";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  pool ??= new Pool({
    connectionString: env.databaseUrl,
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  });

  return pool;
}

export async function checkDatabaseConnection(): Promise<void> {
  await getPool().query("SELECT 1");
}

export async function closePool(): Promise<void> {
  if (!pool) return;
  const activePool = pool;
  pool = undefined;
  await activePool.end();
}
