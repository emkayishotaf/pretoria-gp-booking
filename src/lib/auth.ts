import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { getClinicSettings } from '@/lib/db';

export const DEFAULT_ADMIN_PASSWORD = 'Doctor2026!';
export const ADMIN_COOKIE_NAME = 'gp_admin_session';

/**
 * Retrieves the expected password for admin login.
 * Priority:
 * 1. process.env.ADMIN_PASSWORD
 * 2. ClinicSettings.adminPassword (saved in DB)
 * 3. DEFAULT_ADMIN_PASSWORD
 */
export async function getExpectedAdminPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim()) {
    return process.env.ADMIN_PASSWORD.trim();
  }
  try {
    const settings = await getClinicSettings();
    if (settings?.adminPassword && settings.adminPassword.trim()) {
      return settings.adminPassword.trim();
    }
  } catch (error) {
    console.error('Failed to get clinic settings for admin password:', error);
  }
  return DEFAULT_ADMIN_PASSWORD;
}

/**
 * Validates the candidate password against the current admin password.
 */
export async function validateAdminPassword(candidate: string): Promise<boolean> {
  if (!candidate || typeof candidate !== 'string') return false;
  const expected = await getExpectedAdminPassword();
  return candidate.trim() === expected.trim();
}

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || 'pretoria-gp-secure-auth-salt-2025';
}

/**
 * Creates a cryptographically signed session token valid for durationMs (default 7 days).
 */
export function createAdminToken(durationMs: number = 7 * 24 * 60 * 60 * 1000): string {
  const expiresAt = Date.now() + durationMs;
  const secret = getSecretKey();
  const signature = crypto.createHmac('sha256', secret).update(String(expiresAt)).digest('hex');
  return `${expiresAt}.${signature}`;
}

/**
 * Verifies that a token is valid, unexpired, and authentic.
 */
export function verifyAdminToken(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || isNaN(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const secret = getSecretKey();
  const expectedSignature = crypto.createHmac('sha256', secret).update(String(expiresAt)).digest('hex');

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Verifies an incoming NextRequest for an active admin session.
 */
export function verifyAdminSession(request: NextRequest): boolean {
  // 1. Check HTTP-only cookie
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (verifyAdminToken(token)) return true;

  // 2. Check Bearer Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    if (verifyAdminToken(bearerToken)) return true;
  }

  return false;
}
