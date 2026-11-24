import { NextResponse } from 'next/server';
import { getDbMode } from '@/db';
import { getAllCatalogProducts } from '@/domain/catalog/service';
import { getPaymentProviderAdapter } from '@/domain/payments/adapter';
import { logServerError } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getAllCatalogProducts();
    const paymentAdapter = getPaymentProviderAdapter();
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      databaseMode: getDbMode(),
      catalogProductCount: products.length,
      paymentMode: paymentAdapter.isSandbox ? 'sandbox' : 'live',
      paymentProvider: paymentAdapter.providerName,
    });
  } catch (err) {
    logServerError('GET /api/health', err);
    return NextResponse.json({ status: 'degraded' }, { status: 503 });
  }
}
