import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, type Role, type KpiCategory } from "@/db/schema";
import { eq } from "drizzle-orm";

export { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "kpi_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 kun

function appSecret(): string {
  const s = process.env.APP_SECRET;
  if (s && s.length >= 16) return s;
  // Development fallback (productionda APP_SECRET majburiy)
  return "kpi-7v-dev-secret-change-me-0123456789";
}

/* ---------- Sessiya token (HMAC-SHA256 imzo) ---------- */

type SessionPayload = {
  uid: number;
  role: Role;
  exp: number;
};

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(data: string): string {
  return b64url(createHmac("sha256", appSecret()).update(data).digest());
}

function encodeSession(payload: SessionPayload): string {
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): SessionPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(),
    ) as SessionPayload;
    if (!payload.uid || !payload.role || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: number;
  username: string;
  role: Role;
  category: KpiCategory | null;
  studentId: number | null;
};

export async function createSession(userId: number, role: Role): Promise<void> {
  const token = encodeSession({ uid: userId, role, exp: Date.now() + SESSION_TTL_MS });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Joriy sessiya foydalanuvchisini bazadan o'qiydi (har so'rovda tekshiriladi). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = decodeSession(token);
  if (!payload) return null;
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      category: users.category,
      studentId: users.studentId,
    })
    .from(users)
    .where(eq(users.id, payload.uid))
    .limit(1);
  const u = rows[0];
  if (!u) return null;
  return u;
}

/** Rollarni server tomonda majburlash uchun yordamchilar. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
