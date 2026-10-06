import "dotenv/config";

function parsePort(value: string | undefined): number {
  if (value === undefined || value === "") return 4000;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("API_PORT must be an integer between 1 and 65535.");
  }
  return port;
}

function parseCorsOrigins(value: string | undefined): string[] {
  const origins = (value ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.includes("*")) {
    throw new Error("CORS_ORIGINS must list explicit origins; wildcard access is not allowed.");
  }

  return origins;
}

function parseSupabaseUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("SUPABASE_URL must be a valid URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("SUPABASE_URL must be an http(s) project origin without credentials, path, query or fragment.");
  }
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error("SUPABASE_URL must use HTTPS outside local development.");
  }
  return url.origin;
}

export const env = {
  apiPort: parsePort(process.env.API_PORT),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: parseSupabaseUrl(process.env.SUPABASE_URL),
};
