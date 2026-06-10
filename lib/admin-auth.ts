import { cookies } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'oshimise_admin';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function isAdmin(req?: NextRequest): Promise<boolean> {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return false;
  if (req) {
    const header = req.headers.get('x-admin-passcode');
    if (header && safeEqual(header, expected)) return true;
  }
  const c = await cookies();
  const cookie = c.get(COOKIE_NAME)?.value;
  if (cookie && safeEqual(cookie, expected)) return true;
  return false;
}

export async function setAdminCookie(passcode: string): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, passcode, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
