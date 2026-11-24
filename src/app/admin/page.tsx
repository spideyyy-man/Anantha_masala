'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ShieldCheck,
  LogOut,
  Package,
  ClipboardList,
  BarChart3,
  History,
  MessageSquare,
  Lock,
  Save,
} from 'lucide-react';
import { formatPaiseToInr } from '@/data/brand';
import type { CatalogProduct } from '@/domain/catalog/service';

interface AdminDashboardPayload {
  admin: { email: string; displayName: string; role: string };
  products: CatalogProduct[];
  orders: {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentProvider: string;
    customerName: string;
    customerPhone: string;
    shippingCity: string;
    shippingState: string;
    totalPaise: number;
    createdAt: string;
  }[];
  enquiries: {
    id: number;
    referenceCode: string;
    type: string;
    name: string;
    businessName: string | null;
    phone: string;
    cityState: string | null;
    message: string;
    status: string;
    createdAt: string;
  }[];
  auditEvents: {
    id: number;
    actorEmail: string;
    actorRole: string;
    action: string;
    targetEntity: string;
    targetId: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  }[];
  analytics: {
    totalConsentedEvents: number;
    countsByEvent: Record<string, number>;
    countsBySource: Record<string, number>;
    topViewedProducts: [string, number][];
    orderStats: {
      totalOrders: number;
      paidOrders: number;
      pendingOrders: number;
      failedOrders: number;
      totalRevenuePaise: number;
    };
    enquiryStats: {
      total: number;
      bulkWholesale: number;
      contactSupport: number;
      privacyRequests: number;
    };
  };
}

export default function AdminConsolePage() {
  const [stage, setStage] = useState<'loading' | 'login' | 'mfa' | 'ready'>('loading');
  const [data, setData] = useState<AdminDashboardPayload | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'enquiries' | 'analytics' | 'audit'>('orders');

  const [email, setEmail] = useState('admin@aanandhamasala.in');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [devMfaHint, setDevMfaHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Local variant edits map: variantId -> { priceInr, stockQty, orderable }
  const [variantEdits, setVariantEdits] = useState<
    Record<number, { priceInr: string; stockQty: string; isOrderableOnline: boolean }>
  >({});

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      if (res.status === 401) {
        setStage('login');
        return;
      }
      if (!res.ok) {
        setStage('login');
        return;
      }
      const payload = (await res.json()) as AdminDashboardPayload;
      setData(payload);

      const initialEdits: Record<number, { priceInr: string; stockQty: string; isOrderableOnline: boolean }> = {};
      for (const p of payload.products) {
        for (const v of p.variants) {
          initialEdits[v.id] = {
            priceInr: v.pricePaise !== null ? String(v.pricePaise / 100) : '',
            stockQty: String(v.stockQty),
            isOrderableOnline: v.isOrderableOnline,
          };
        }
      }
      setVariantEdits(initialEdits);
      setStage('ready');
    } catch {
      setStage('login');
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || 'Sign-in failed.');
        setBusy(false);
        return;
      }
      setDevMfaHint(resData.devSandboxMfaCode || null);
      setStage('mfa');
    } catch {
      setError('Network error during sign-in.');
    } finally {
      setBusy(false);
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mfaCode }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || 'Invalid MFA code.');
        setBusy(false);
        return;
      }
      setDevMfaHint(null);
      setMfaCode('');
      await loadDashboard();
    } catch {
      setError('Network error during MFA verification.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setData(null);
    setPassword('');
    setStage('login');
  };

  const handleOrderStatusChange = async (orderId: number, status: string) => {
    setNotice(null);
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    if (res.ok) {
      setNotice('Order status updated and logged to audit trail.');
      await loadDashboard();
    } else {
      const d = await res.json();
      setError(d.error || 'Could not update order.');
    }
  };

  const handleSaveVariant = async (variantId: number) => {
    const edit = variantEdits[variantId];
    if (!edit) return;
    setNotice(null);
    setError(null);
    const pricePaise =
      edit.priceInr.trim() === '' ? null : Math.round(Number(edit.priceInr) * 100);
    const stockQty = Math.max(0, Math.round(Number(edit.stockQty)));

    const res = await fetch('/api/admin/variants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variantId,
        pricePaise,
        stockQty,
        isOrderableOnline: edit.isOrderableOnline && pricePaise !== null,
      }),
    });
    if (res.ok) {
      setNotice('Variant updated and recorded in immutable audit trail.');
      await loadDashboard();
    } else {
      const d = await res.json();
      setError(d.error || 'Could not update variant.');
    }
  };

  if (stage === 'loading') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-[var(--text-muted)]">
        Verifying operator session...
      </div>
    );
  }

  if (stage === 'login' || stage === 'mfa') {
    return (
      <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <div className="rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-md sm:p-8">
          <div className="flex items-center gap-2 text-[var(--brand-crimson)]">
            <Lock className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider">RBAC + MFA Protected</span>
          </div>
          <h1 className="font-display mt-2 text-2xl font-bold text-[var(--text-primary)]">
            Store Operator Console
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Authorised staff only. All catalog, inventory, and order updates are audit-logged.
          </p>

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-900">
              {error}
            </div>
          )}

          {stage === 'login' ? (
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label htmlFor="adm-email" className="block text-xs font-semibold">
                  Operator Email
                </label>
                <input
                  id="adm-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor="adm-pass" className="block text-xs font-semibold">
                  Password
                </label>
                <input
                  id="adm-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[var(--brand-crimson)] text-sm font-semibold text-white hover:bg-[var(--brand-crimson-hover)] disabled:opacity-60"
              >
                {busy ? 'Checking credentials...' : 'Continue to MFA Step'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfa} className="mt-5 space-y-4">
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-950">
                Enter the 6-digit MFA verification code to elevate and rotate your session.
                {devMfaHint && (
                  <p className="font-mono-num mt-1.5 font-bold">
                    Local Dev Sandbox MFA Code: {devMfaHint}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="adm-mfa" className="block text-xs font-semibold">
                  6-Digit Verification Code
                </label>
                <input
                  id="adm-mfa"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="font-mono-num mt-1 h-12 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 text-center text-lg tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[var(--brand-leaf)] text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? 'Verifying...' : 'Verify MFA & Open Console'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--brand-leaf)]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            MFA Verified • Role: {data.admin.role}
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-[var(--text-primary)]">
            Madurai Aanandha Operations Console
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--brand-crimson)]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign Out
        </button>
      </header>

      {notice && (
        <div role="status" className="mt-4 rounded-xl bg-[var(--brand-leaf-soft)] p-3 text-xs font-semibold text-[var(--brand-leaf)]">
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-900">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { id: 'orders', label: `Orders (${data.orders.length})`, icon: ClipboardList },
          { id: 'catalog', label: `Catalogue & Stock (${data.products.length})`, icon: Package },
          { id: 'enquiries', label: `Enquiries (${data.enquiries.length})`, icon: MessageSquare },
          { id: 'analytics', label: 'Analytics Funnel', icon: BarChart3 },
          { id: 'audit', label: `Audit Log (${data.auditEvents.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-xl px-4 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--brand-crimson)] text-white'
                  : 'border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'orders' && (
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <table className="min-w-full divide-y divide-[var(--border-subtle)] text-left text-xs">
              <thead className="bg-[var(--bg-canvas)] font-semibold uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Fulfilment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {data.orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  data.orders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="font-mono-num px-4 py-3 font-bold">{ord.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{ord.customerName}</p>
                        <p className="text-[var(--text-muted)]">{ord.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        {ord.shippingCity}, {ord.shippingState}
                      </td>
                      <td className="font-mono-num px-4 py-3 font-bold">
                        {formatPaiseToInr(ord.totalPaise)}
                      </td>
                      <td className="px-4 py-3 uppercase">
                        <span className="rounded-full bg-[var(--bg-surface-muted)] px-2.5 py-0.5 font-semibold">
                          {ord.paymentStatus} ({ord.paymentProvider})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Update status for ${ord.orderNumber}`}
                          value={ord.status}
                          onChange={(e) => void handleOrderStatusChange(ord.id, e.target.value)}
                          className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-2.5 py-1.5 text-xs font-semibold"
                        >
                          {['pending_payment', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map(
                            (st) => (
                              <option key={st} value={st}>{st}</option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <table className="min-w-full divide-y divide-[var(--border-subtle)] text-left text-xs">
              <thead className="bg-[var(--bg-canvas)] font-semibold uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3">Product / SKU</th>
                  <th className="px-4 py-3">Pack</th>
                  <th className="px-4 py-3">Price (₹)</th>
                  <th className="px-4 py-3">Stock Qty</th>
                  <th className="px-4 py-3">Online</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {data.products.flatMap((prod) =>
                  prod.variants.map((v) => {
                    const edit = variantEdits[v.id] || {
                      priceInr: v.pricePaise !== null ? String(v.pricePaise / 100) : '',
                      stockQty: String(v.stockQty),
                      isOrderableOnline: v.isOrderableOnline,
                    };
                    return (
                      <tr key={v.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[var(--text-primary)]">{prod.name}</p>
                          <p className="font-mono-num text-[11px] text-[var(--text-muted)]">{v.sku}</p>
                        </td>
                        <td className="px-4 py-3">{v.label}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Pending"
                            value={edit.priceInr}
                            onChange={(e) =>
                              setVariantEdits((prev) => ({
                                ...prev,
                                [v.id]: { ...edit, priceInr: e.target.value },
                              }))
                            }
                            className="font-mono-num w-24 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={edit.stockQty}
                            onChange={(e) =>
                              setVariantEdits((prev) => ({
                                ...prev,
                                [v.id]: { ...edit, stockQty: e.target.value },
                              }))
                            }
                            className="font-mono-num w-20 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={edit.isOrderableOnline}
                            onChange={(e) =>
                              setVariantEdits((prev) => ({
                                ...prev,
                                [v.id]: { ...edit, isOrderableOnline: e.target.checked },
                              }))
                            }
                            className="h-4 w-4 accent-[var(--brand-crimson)]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => void handleSaveVariant(v.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg-deep)] px-3 py-1.5 font-semibold text-white hover:bg-[var(--brand-crimson)]"
                          >
                            <Save className="h-3.5 w-3.5" aria-hidden="true" />
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'enquiries' && (
          <div className="space-y-3">
            {data.enquiries.length === 0 ? (
              <p className="rounded-2xl bg-[var(--bg-surface)] p-6 text-center text-sm text-[var(--text-muted)]">
                No enquiries submitted yet.
              </p>
            ) : (
              data.enquiries.map((enq) => (
                <div key={enq.id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono-num font-bold text-[var(--brand-crimson)]">
                      {enq.referenceCode} • {enq.type}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {new Date(enq.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {enq.name} {enq.businessName ? `(${enq.businessName})` : ''} — {enq.phone}
                  </p>
                  <p className="mt-1 text-[var(--text-secondary)]">{enq.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <h2 className="font-display text-base font-bold">Server Order Truth</h2>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between"><dt>Total Orders</dt><dd className="font-mono-num font-bold">{data.analytics.orderStats.totalOrders}</dd></div>
                <div className="flex justify-between"><dt>Verified Paid</dt><dd className="font-mono-num font-bold text-[var(--brand-leaf)]">{data.analytics.orderStats.paidOrders}</dd></div>
                <div className="flex justify-between"><dt>Pending</dt><dd className="font-mono-num font-bold">{data.analytics.orderStats.pendingOrders}</dd></div>
                <div className="flex justify-between"><dt>Failed</dt><dd className="font-mono-num font-bold text-red-700">{data.analytics.orderStats.failedOrders}</dd></div>
                <div className="flex justify-between border-t pt-2"><dt>Verified Revenue</dt><dd className="font-mono-num font-bold">{formatPaiseToInr(data.analytics.orderStats.totalRevenuePaise)}</dd></div>
              </dl>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <h2 className="font-display text-base font-bold">Consented Funnel Events ({data.analytics.totalConsentedEvents})</h2>
              <dl className="mt-3 space-y-1.5 text-xs">
                {Object.entries(data.analytics.countsByEvent).length === 0 ? (
                  <p className="text-[var(--text-muted)]">No consented events yet (DPDP opt-in gated).</p>
                ) : (
                  Object.entries(data.analytics.countsByEvent).map(([ev, cnt]) => (
                    <div key={ev} className="flex justify-between">
                      <dt>{ev}</dt>
                      <dd className="font-mono-num font-bold">{cnt}</dd>
                    </div>
                  ))
                )}
              </dl>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <h2 className="font-display text-base font-bold">Leads & Attribution</h2>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><dt>Bulk/Wholesale Leads</dt><dd className="font-mono-num font-bold">{data.analytics.enquiryStats.bulkWholesale}</dd></div>
                <div className="flex justify-between"><dt>Support Messages</dt><dd className="font-mono-num font-bold">{data.analytics.enquiryStats.contactSupport}</dd></div>
                <div className="flex justify-between"><dt>DPDP Privacy Requests</dt><dd className="font-mono-num font-bold">{data.analytics.enquiryStats.privacyRequests}</dd></div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <table className="min-w-full divide-y divide-[var(--border-subtle)] text-left text-xs">
              <thead className="bg-[var(--bg-canvas)] font-semibold uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3">Timestamp (IST)</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {data.auditEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td className="font-mono-num px-4 py-2.5">
                      {new Date(ev.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-2.5">
                      {ev.actorEmail} ({ev.actorRole})
                    </td>
                    <td className="font-mono-num px-4 py-2.5 font-semibold">{ev.action}</td>
                    <td className="font-mono-num px-4 py-2.5">
                      {ev.targetEntity}:{ev.targetId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
