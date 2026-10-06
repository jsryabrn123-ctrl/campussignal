import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getPool, closePool } from "./pool.js";

const migrationsDirectory = fileURLToPath(new URL("./migrations/", import.meta.url));

async function runMigrations(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const name of files) {
    const { rowCount } = await pool.query(
      "SELECT 1 FROM public.schema_migrations WHERE name = $1",
      [name],
    );
    if (rowCount) continue;

    const sql = await readFile(new URL(`./migrations/${name}`, import.meta.url), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO public.schema_migrations (name) VALUES ($1)", [name]);
      await client.query("COMMIT");
      console.info(`Applied migration ${name}.`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

try {
  await runMigrations();
} catch {
  console.error("Database migrations failed. Check DATABASE_URL and database availability.");
  process.exitCode = 1;
} finally {
  await closePool();
}
