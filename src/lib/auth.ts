import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// COOKIE_SECURE=false lets production deployments on plain HTTP work.
// Defaults to true in production (correct for HTTPS). Set COOKIE_SECURE=false
// in .env when the server is behind HTTP only (e.g. reverse proxy without TLS).
const COOKIE_BASE = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
  sameSite: "lax" as const,
  path: "/",
};

// ── Seller session ─────────────────────────────────────────────────

export async function createSellerSession(sellerId: number) {
  const token = await new SignJWT({ type: "seller" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(sellerId))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret());
  const jar = await cookies();
  jar.set("seller_session", token, { ...COOKIE_BASE, maxAge: 60 * 60 * 24 * 7 });
}

export async function clearSellerSession() {
  const jar = await cookies();
  jar.set("seller_session", "", { ...COOKIE_BASE, maxAge: 0 });
}

export async function getSellerSession(): Promise<{ sellerId: number } | null> {
  const jar = await cookies();
  const token = jar.get("seller_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (payload.type !== "seller") return null;
    return { sellerId: Number(payload.sub) };
  } catch {
    return null;
  }
}

// ── Admin session ──────────────────────────────────────────────────

export async function createAdminSession(adminId: number) {
  const token = await new SignJWT({ type: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(jwtSecret());
  const jar = await cookies();
  jar.set("admin_session", token, { ...COOKIE_BASE, maxAge: 60 * 60 * 8 });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.set("admin_session", "", { ...COOKIE_BASE, maxAge: 0 });
}

export async function getAdminSession(): Promise<{ adminId: number } | null> {
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (payload.type !== "admin") return null;
    return { adminId: Number(payload.sub) };
  } catch {
    return null;
  }
}
