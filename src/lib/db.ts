import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  var __prismaClient: PrismaClient | undefined;
}

function parseDbUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.replace(/^\//, ""),
    allowPublicKeyRetrieval: true,
  };
}

function getClient(): PrismaClient {
  if (!globalThis.__prismaClient) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    const adapter = new PrismaMariaDb(parseDbUrl(url));
    globalThis.__prismaClient = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return globalThis.__prismaClient;
}

// Proxy so imports never trigger a connection — the pool is created on first actual query.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    return Reflect.get(getClient(), prop);
  },
});
