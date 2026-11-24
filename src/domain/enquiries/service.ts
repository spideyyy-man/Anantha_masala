import crypto from 'node:crypto';
import { desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { ensureDbReady } from '@/db/bootstrap';
import { enquiries } from '@/db/schema';
import { normalizeIndianPhone } from '@/lib/validation/schemas';

export interface CreateEnquiryInput {
  type: 'bulk_wholesale' | 'contact_support' | 'privacy_request';
  name: string;
  businessName?: string;
  phone: string;
  email?: string;
  cityState?: string;
  interestedProducts?: string;
  estimatedMonthlyKg?: string;
  message: string;
}

export async function createEnquiry(input: CreateEnquiryInput) {
  await ensureDbReady();
  const db = getDb();

  const prefix =
    input.type === 'bulk_wholesale' ? 'BLK' : input.type === 'privacy_request' ? 'PRV' : 'SUP';
  const referenceCode = `AM-${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const inserted = await db
    .insert(enquiries)
    .values({
      referenceCode,
      type: input.type,
      name: input.name,
      businessName: input.businessName || null,
      phone: normalizeIndianPhone(input.phone),
      email: input.email || null,
      cityState: input.cityState || null,
      interestedProducts: input.interestedProducts || null,
      estimatedMonthlyKg: input.estimatedMonthlyKg || null,
      message: input.message,
      status: 'new',
    })
    .returning();

  return inserted[0]!;
}

export async function listRecentEnquiries(limit = 50) {
  await ensureDbReady();
  const db = getDb();
  return db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(limit);
}
