import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { ensureDbReady } from '@/db/bootstrap';
import { analyticsEvents, consentRecords, enquiries, orders } from '@/db/schema';

export async function upsertConsentPreference(input: {
  anonymousId: string;
  analyticsAccepted: boolean;
  marketingAccepted: boolean;
}) {
  await ensureDbReady();
  const db = getDb();

  const existing = await db
    .select()
    .from(consentRecords)
    .where(eq(consentRecords.anonymousId, input.anonymousId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(consentRecords)
      .set({
        analyticsAccepted: input.analyticsAccepted,
        marketingAccepted: input.marketingAccepted,
        updatedAt: new Date(),
      })
      .where(eq(consentRecords.id, existing[0].id));
  } else {
    await db.insert(consentRecords).values({
      anonymousId: input.anonymousId,
      necessaryAccepted: true,
      analyticsAccepted: input.analyticsAccepted,
      marketingAccepted: input.marketingAccepted,
    });
  }
}

export async function recordConsentedAnalyticsEvent(input: {
  anonymousId: string;
  eventName: string;
  path: string;
  deviceClass: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  productSlug?: string;
  categorySlug?: string;
  searchQuery?: string;
  valuePaise?: number;
}): Promise<{ recorded: boolean; reason?: string }> {
  await ensureDbReady();
  const db = getDb();

  // Enforce server-side DPDP consent check before storing optional analytics
  const consent = await db
    .select()
    .from(consentRecords)
    .where(eq(consentRecords.anonymousId, input.anonymousId))
    .limit(1);

  if (!consent[0]?.analyticsAccepted) {
    return { recorded: false, reason: 'analytics_consent_not_granted' };
  }

  await db.insert(analyticsEvents).values({
    anonymousId: input.anonymousId,
    eventName: input.eventName,
    path: input.path,
    deviceClass: input.deviceClass,
    utmSource: input.utmSource || null,
    utmMedium: input.utmMedium || null,
    utmCampaign: input.utmCampaign || null,
    productSlug: input.productSlug || null,
    categorySlug: input.categorySlug || null,
    searchQuery: input.searchQuery || null,
    valuePaise: input.valuePaise ?? null,
  });

  return { recorded: true };
}

export async function getAnalyticsSummary() {
  await ensureDbReady();
  const db = getDb();

  const [events, allOrders, allEnquiries] = await Promise.all([
    db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(500),
    db.select().from(orders),
    db.select().from(enquiries),
  ]);

  const countsByEvent: Record<string, number> = {};
  const countsBySource: Record<string, number> = {};
  const topProducts: Record<string, number> = {};

  for (const ev of events) {
    countsByEvent[ev.eventName] = (countsByEvent[ev.eventName] ?? 0) + 1;
    const src = ev.utmSource || 'direct';
    countsBySource[src] = (countsBySource[src] ?? 0) + 1;
    if (ev.productSlug && ev.eventName === 'product_view') {
      topProducts[ev.productSlug] = (topProducts[ev.productSlug] ?? 0) + 1;
    }
  }

  const paidOrders = allOrders.filter((o) => o.paymentStatus === 'captured');
  const totalRevenuePaise = paidOrders.reduce((sum, o) => sum + o.totalPaise, 0);

  return {
    totalConsentedEvents: events.length,
    countsByEvent,
    countsBySource,
    topViewedProducts: Object.entries(topProducts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6),
    orderStats: {
      totalOrders: allOrders.length,
      paidOrders: paidOrders.length,
      pendingOrders: allOrders.filter((o) => o.paymentStatus === 'pending').length,
      failedOrders: allOrders.filter((o) => o.paymentStatus === 'failed').length,
      totalRevenuePaise,
    },
    enquiryStats: {
      total: allEnquiries.length,
      bulkWholesale: allEnquiries.filter((e) => e.type === 'bulk_wholesale').length,
      contactSupport: allEnquiries.filter((e) => e.type === 'contact_support').length,
      privacyRequests: allEnquiries.filter((e) => e.type === 'privacy_request').length,
    },
  };
}
