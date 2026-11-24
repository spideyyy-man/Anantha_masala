import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { ensureDbReady } from '@/db/bootstrap';
import {
  adminSessions,
  adminUsers,
  auditEvents,
  orders,
  productVariants,
} from '@/db/schema';
import {
  generateSecureToken,
  generateSixDigitCode,
  sha256Hex,
  verifyPassword,
} from '@/lib/security/crypto';

export const ADMIN_SESSION_COOKIE = 'am_admin_session';

export interface AuthenticatedAdmin {
  userId: number;
  email: string;
  displayName: string;
  role: string;
  mfaVerified: boolean;
}

export async function recordAuditEvent(params: {
  actorEmail: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await ensureDbReady();
  const db = getDb();
  await db.insert(auditEvents).values({
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    action: params.action,
    targetEntity: params.targetEntity,
    targetId: params.targetId,
    metadata: params.metadata ?? {},
  });
}

export async function initiateAdminLogin(email: string, password: string) {
  await ensureDbReady();
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();

  const users = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, cleanEmail))
    .limit(1);

  const user = users[0];
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    await recordAuditEvent({
      actorEmail: cleanEmail,
      actorRole: 'unauthenticated',
      action: 'admin.login_failed',
      targetEntity: 'admin_user',
      targetId: cleanEmail,
    });
    return null;
  }

  // Rotate fresh session token & issue 6-digit MFA challenge
  const rawToken = generateSecureToken(32);
  const mfaCode = generateSixDigitCode();
  const now = Date.now();

  await db.insert(adminSessions).values({
    tokenHash: sha256Hex(rawToken),
    adminUserId: user.id,
    mfaVerified: false,
    pendingMfaCodeHash: sha256Hex(mfaCode),
    mfaExpiresAt: new Date(now + 10 * 60 * 1000), // 10 min MFA window
    expiresAt: new Date(now + 8 * 60 * 60 * 1000), // 8 hour session
  });

  await recordAuditEvent({
    actorEmail: user.email,
    actorRole: user.role,
    action: 'admin.login_mfa_challenged',
    targetEntity: 'admin_user',
    targetId: String(user.id),
  });

  // Log MFA code server-side in non-production environments for sandbox operator testing
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    console.info(`[ADMIN MFA SANDBOX] Verification code for ${user.email}: ${mfaCode}`);
  }

  return {
    rawToken,
    email: user.email,
    role: user.role,
    // Expose dev preview code ONLY outside production so sandbox QA can complete MFA without SMS/TOTP gateway
    devSandboxMfaCode: isProd ? undefined : mfaCode,
  };
}

export async function verifyAdminMfa(rawSessionToken: string, code: string) {
  await ensureDbReady();
  const db = getDb();

  const rows = await db
    .select({
      sessionId: adminSessions.id,
      pendingMfaCodeHash: adminSessions.pendingMfaCodeHash,
      mfaExpiresAt: adminSessions.mfaExpiresAt,
      expiresAt: adminSessions.expiresAt,
      userId: adminUsers.id,
      email: adminUsers.email,
      displayName: adminUsers.displayName,
      role: adminUsers.role,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(eq(adminSessions.tokenHash, sha256Hex(rawSessionToken)))
    .limit(1);

  const row = rows[0];
  if (!row || row.expiresAt.getTime() < Date.now()) {
    return null;
  }
  if (!row.pendingMfaCodeHash || !row.mfaExpiresAt || row.mfaExpiresAt.getTime() < Date.now()) {
    return null;
  }
  if (sha256Hex(code.trim()) !== row.pendingMfaCodeHash) {
    await recordAuditEvent({
      actorEmail: row.email,
      actorRole: row.role,
      action: 'admin.mfa_failed',
      targetEntity: 'admin_session',
      targetId: String(row.sessionId),
    });
    return null;
  }

  // Rotate session identifier on privilege elevation (OWASP ASVS session fixation protection)
  const rotatedToken = generateSecureToken(32);
  await db
    .update(adminSessions)
    .set({
      tokenHash: sha256Hex(rotatedToken),
      mfaVerified: true,
      pendingMfaCodeHash: null,
      mfaExpiresAt: null,
    })
    .where(eq(adminSessions.id, row.sessionId));

  await recordAuditEvent({
    actorEmail: row.email,
    actorRole: row.role,
    action: 'admin.mfa_verified',
    targetEntity: 'admin_session',
    targetId: String(row.sessionId),
  });

  return {
    rotatedToken,
    admin: {
      userId: row.userId,
      email: row.email,
      displayName: row.displayName,
      role: row.role,
      mfaVerified: true,
    } satisfies AuthenticatedAdmin,
  };
}

export async function getAdminFromSessionToken(
  rawSessionToken: string | undefined | null,
  requireMfa = true
): Promise<AuthenticatedAdmin | null> {
  if (!rawSessionToken) return null;
  await ensureDbReady();
  const db = getDb();

  const rows = await db
    .select({
      mfaVerified: adminSessions.mfaVerified,
      expiresAt: adminSessions.expiresAt,
      userId: adminUsers.id,
      email: adminUsers.email,
      displayName: adminUsers.displayName,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(eq(adminSessions.tokenHash, sha256Hex(rawSessionToken)))
    .limit(1);

  const row = rows[0];
  if (!row || !row.isActive || row.expiresAt.getTime() < Date.now()) {
    return null;
  }
  if (requireMfa && !row.mfaVerified) {
    return null;
  }
  return {
    userId: row.userId,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
    mfaVerified: row.mfaVerified,
  };
}

export async function revokeAdminSession(rawSessionToken: string | undefined | null) {
  if (!rawSessionToken) return;
  await ensureDbReady();
  const db = getDb();
  await db.delete(adminSessions).where(eq(adminSessions.tokenHash, sha256Hex(rawSessionToken)));
}

export async function adminUpdateVariant(
  actor: AuthenticatedAdmin,
  input: { variantId: number; pricePaise: number | null; stockQty: number; isOrderableOnline: boolean }
) {
  if (!['super_admin', 'catalog_manager'].includes(actor.role)) {
    throw new Error('Forbidden: role lacks catalog permissions.');
  }
  await ensureDbReady();
  const db = getDb();

  const beforeRows = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, input.variantId))
    .limit(1);
  const before = beforeRows[0];
  if (!before) throw new Error('Variant not found.');

  const updated = await db
    .update(productVariants)
    .set({
      pricePaise: input.pricePaise,
      stockQty: input.stockQty,
      isOrderableOnline: input.isOrderableOnline,
      updatedAt: new Date(),
    })
    .where(eq(productVariants.id, input.variantId))
    .returning();

  await recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'catalog.variant_updated',
    targetEntity: 'product_variant',
    targetId: before.sku,
    metadata: {
      before: { pricePaise: before.pricePaise, stockQty: before.stockQty, isOrderableOnline: before.isOrderableOnline },
      after: { pricePaise: input.pricePaise, stockQty: input.stockQty, isOrderableOnline: input.isOrderableOnline },
    },
  });

  return updated[0]!;
}

export async function adminUpdateOrderStatus(
  actor: AuthenticatedAdmin,
  orderId: number,
  status: string
) {
  if (!['super_admin', 'order_operator'].includes(actor.role)) {
    throw new Error('Forbidden: role lacks order management permissions.');
  }
  await ensureDbReady();
  const db = getDb();

  const beforeRows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const before = beforeRows[0];
  if (!before) throw new Error('Order not found.');

  const updated = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  await recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'order.status_updated',
    targetEntity: 'order',
    targetId: before.orderNumber,
    metadata: { previousStatus: before.status, newStatus: status },
  });

  return updated[0]!;
}

export async function getAdminOverviewData() {
  await ensureDbReady();
  const db = getDb();

  const [recentOrders, recentAudit] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50),
    db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)).limit(50),
  ]);

  return { recentOrders, recentAudit };
}
