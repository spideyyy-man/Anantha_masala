'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'motion/react';
import type { HydratedCart } from '@/domain/cart/service';

interface ConsentState {
  decided: boolean;
  analyticsAccepted: boolean;
  marketingAccepted: boolean;
  anonymousId: string;
}

interface AnalyticsPayload {
  eventName:
    | 'page_view'
    | 'campaign_landing'
    | 'category_view'
    | 'search'
    | 'filter_apply'
    | 'product_view'
    | 'variant_select'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'begin_checkout'
    | 'shipping_selected'
    | 'payment_attempt'
    | 'purchase'
    | 'whatsapp_click'
    | 'bulk_enquiry_submit'
    | 'recipe_view'
    | 'social_video_click';
  path?: string;
  productSlug?: string;
  categorySlug?: string;
  searchQuery?: string;
  valuePaise?: number;
}

interface StoreContextValue {
  cart: HydratedCart | null;
  cartLoading: boolean;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshCart: (shippingState?: string) => Promise<HydratedCart | null>;
  addToCart: (variantId: number, quantity?: number, productSlug?: string) => Promise<boolean>;
  updateQuantity: (variantId: number, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  consent: ConsentState;
  saveConsent: (analyticsAccepted: boolean, marketingAccepted?: boolean) => Promise<void>;
  reopenConsent: () => void;
  trackEvent: (payload: AnalyticsPayload) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CONSENT_STORAGE_KEY = 'am_dpdp_consent_v1';
const UTM_STORAGE_KEY = 'am_campaign_utm_v1';

function createAnonymousId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `anon_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  }
  return `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getDeviceClass(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function StoreProviders({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<HydratedCart | null>(null);
  const [cartLoading, setCartLoading] = useState<boolean>(true);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [consent, setConsent] = useState<ConsentState>({
    decided: true, // Hydrated after mount to avoid SSR mismatch flash
    analyticsAccepted: false,
    marketingAccepted: false,
    anonymousId: '',
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const refreshCart = useCallback(async (shippingState?: string) => {
    try {
      const qs = shippingState ? `?state=${encodeURIComponent(shippingState)}` : '';
      const res = await fetch(`/api/cart${qs}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = (await res.json()) as HydratedCart;
      setCart(data);
      return data;
    } catch {
      return null;
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Load persisted cart, consent preferences, and UTM attribution on mount
  useEffect(() => {
    void refreshCart();

    try {
      const sp = new URLSearchParams(window.location.search);
      const utmSource = sp.get('utm_source');
      const utmMedium = sp.get('utm_medium');
      const utmCampaign = sp.get('utm_campaign');
      if (utmSource || utmMedium || utmCampaign) {
        sessionStorage.setItem(
          UTM_STORAGE_KEY,
          JSON.stringify({ utmSource, utmMedium, utmCampaign })
        );
      }

      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ConsentState>;
        setConsent({
          decided: true,
          analyticsAccepted: Boolean(parsed.analyticsAccepted),
          marketingAccepted: Boolean(parsed.marketingAccepted),
          anonymousId: parsed.anonymousId || createAnonymousId(),
        });
      } else {
        setConsent({
          decided: false,
          analyticsAccepted: false,
          marketingAccepted: false,
          anonymousId: createAnonymousId(),
        });
      }
    } catch {
      setConsent({
        decided: false,
        analyticsAccepted: false,
        marketingAccepted: false,
        anonymousId: createAnonymousId(),
      });
    }
  }, [refreshCart]);

  const trackEvent = useCallback(
    (payload: AnalyticsPayload) => {
      // Strictly never fire optional analytics unless explicit user consent was granted
      if (!consent.analyticsAccepted || !consent.anonymousId) return;

      let utm: { utmSource?: string; utmMedium?: string; utmCampaign?: string } = {};
      try {
        const rawUtm = sessionStorage.getItem(UTM_STORAGE_KEY);
        if (rawUtm) utm = JSON.parse(rawUtm);
      } catch {
        // ignore storage errors
      }

      const body = {
        anonymousId: consent.anonymousId,
        eventName: payload.eventName,
        path: payload.path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        deviceClass: getDeviceClass(),
        ...(utm.utmSource ? { utmSource: utm.utmSource } : {}),
        ...(utm.utmMedium ? { utmMedium: utm.utmMedium } : {}),
        ...(utm.utmCampaign ? { utmCampaign: utm.utmCampaign } : {}),
        ...(payload.productSlug ? { productSlug: payload.productSlug } : {}),
        ...(payload.categorySlug ? { categorySlug: payload.categorySlug } : {}),
        ...(payload.searchQuery ? { searchQuery: payload.searchQuery } : {}),
        ...(payload.valuePaise !== undefined ? { valuePaise: payload.valuePaise } : {}),
      };

      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {
        // Non-blocking analytics failure never interrupts shopping
      });
    },
    [consent.analyticsAccepted, consent.anonymousId]
  );

  const saveConsent = useCallback(
    async (analyticsAccepted: boolean, marketingAccepted = false) => {
      const anonymousId = consent.anonymousId || createAnonymousId();
      const next: ConsentState = {
        decided: true,
        analyticsAccepted,
        marketingAccepted,
        anonymousId,
      };
      setConsent(next);
      try {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymousId,
          analyticsAccepted,
          marketingAccepted,
        }),
      }).catch(() => {});
    },
    [consent.anonymousId]
  );

  const reopenConsent = useCallback(() => {
    setConsent((prev) => ({ ...prev, decided: false }));
  }, []);

  const addToCart = useCallback(
    async (variantId: number, quantity = 1, productSlug?: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId, quantity }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Could not add item to cart.');
          return false;
        }
        setCart(data as HydratedCart);
        setCartDrawerOpen(true);
        showToast('Added to your spice bag');
        trackEvent({
          eventName: 'add_to_cart',
          productSlug,
          valuePaise: (data as HydratedCart).subtotalPaise,
        });
        return true;
      } catch {
        showToast('Network issue — please retry adding to cart.');
        return false;
      }
    },
    [showToast, trackEvent]
  );

  const updateQuantity = useCallback(
    async (variantId: number, quantity: number): Promise<boolean> => {
      try {
        const res = await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId, quantity }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Could not update item quantity.');
          return false;
        }
        setCart(data as HydratedCart);
        if (quantity === 0) {
          trackEvent({ eventName: 'remove_from_cart' });
        }
        return true;
      } catch {
        showToast('Network error — please try again.');
        return false;
      }
    },
    [showToast, trackEvent]
  );

  const clearCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' });
      if (res.ok) {
        const data = (await res.json()) as HydratedCart;
        setCart(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      cartLoading,
      cartDrawerOpen,
      setCartDrawerOpen,
      toastMessage,
      showToast,
      refreshCart,
      addToCart,
      updateQuantity,
      clearCart,
      consent,
      saveConsent,
      reopenConsent,
      trackEvent,
    }),
    [
      cart,
      cartLoading,
      cartDrawerOpen,
      toastMessage,
      showToast,
      refreshCart,
      addToCart,
      updateQuantity,
      clearCart,
      consent,
      saveConsent,
      reopenConsent,
      trackEvent,
    ]
  );

  return (
    <MotionConfig reducedMotion="user">
      <StoreContext.Provider value={value}>
        {children}
        {/* Screen-reader live announcement + subtle toast feedback */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 md:bottom-6"
        >
          {toastMessage && (
            <div className="rounded-full bg-[var(--bg-deep)] px-5 py-2.5 text-sm font-medium text-[var(--text-on-deep)] shadow-lg ring-1 ring-white/15">
              {toastMessage}
            </div>
          )}
        </div>
      </StoreContext.Provider>
    </MotionConfig>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProviders');
  return ctx;
}
