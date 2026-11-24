import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  getAdminFromSessionToken,
  getAdminOverviewData,
} from '@/domain/admin/service';
import { getAllCatalogProducts } from '@/domain/catalog/service';
import { listRecentEnquiries } from '@/domain/enquiries/service';
import { getAnalyticsSummary } from '@/domain/analytics/service';
import { jsonError, logServerError } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const admin = await getAdminFromSessionToken(token, true);
    if (!admin) {
      return jsonError('Unauthorized: admin authentication and MFA required.', 401);
    }

    const [overview, products, enquiries, analytics] = await Promise.all([
      getAdminOverviewData(),
      getAllCatalogProducts(),
      listRecentEnquiries(50),
      getAnalyticsSummary(),
    ]);

    return NextResponse.json({
      admin,
      products,
      orders: overview.recentOrders,
      auditEvents: overview.recentAudit,
      enquiries,
      analytics,
    });
  } catch (err) {
    logServerError('GET /api/admin/dashboard', err);
    return jsonError('Could not load admin dashboard.', 500);
  }
}
