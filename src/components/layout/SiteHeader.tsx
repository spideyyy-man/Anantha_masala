'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Home,
  LayoutGrid,
  Store,
  PackageSearch,
  MessageCircle,
} from 'lucide-react';
import { BRAND, buildWhatsAppUrl } from '@/data/brand';
import { useStore } from '@/components/providers/StoreProviders';

const PRIMARY_NAV = [
  { href: '/products', label: 'Pantry' },
  { href: '/categories', label: 'Collections' },
  { href: '/story', label: 'Madurai Story' },
  { href: '/recipes', label: 'Kitchen Ideas' },
  { href: '/wholesale', label: 'Bulk' },
  { href: '/orders/track', label: 'Track' },
];

export function BrandWordmark({ darkSurface = false }: { darkSurface?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 sm:gap-2.5">
      <span
        aria-hidden="true"
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-crimson)] text-[var(--brand-turmeric-bright)] shadow-md ring-1 ring-[var(--brand-turmeric-bright)]/45 sm:h-9 sm:w-9"
      >
        <span className="font-display text-base font-bold leading-none sm:text-lg">A</span>
        <span className="absolute -bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-[var(--brand-turmeric-bright)]" />
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={`font-display text-[15px] font-bold tracking-tight sm:text-lg ${
            darkSurface ? 'text-[#FAF2E6]' : 'text-[var(--text-primary)]'
          }`}
        >
          {BRAND.name}
        </span>
        <span
          className={`font-tamil text-[10px] font-medium sm:text-[11px] ${
            darkSurface ? 'text-[var(--brand-turmeric-bright)]' : 'text-[var(--text-muted)]'
          }`}
        >
          மதுரை ஆனந்தா மசாலா
        </span>
      </span>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, setCartDrawerOpen, trackEvent } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');

  const isHeroOverlay = pathname === '/' && !scrolled && !mobileMenuOpen && !searchOpen;
  const itemCount = cart?.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push('/products');
    } else {
      trackEvent({ eventName: 'search', searchQuery: trimmed });
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`${
          pathname === '/' ? 'fixed inset-x-0 top-0' : 'sticky top-0'
        } z-40 transition-colors duration-150 ${
          isHeroOverlay
            ? 'border-b border-white/10 bg-[#23130D]/80 backdrop-blur-md'
            : 'border-b border-[var(--border-subtle)] bg-[#FBF6EE] shadow-xs backdrop-blur-md sm:bg-[#FBF6EE]/95'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-1.5 px-3 sm:gap-3 sm:px-6 lg:h-[74px]">
          <Link href="/" className="min-w-0 shrink-0 rounded-lg py-1" aria-label={`${BRAND.fullName} Home`}>
            <BrandWordmark darkSurface={isHeroOverlay} />
          </Link>

          {/* Desktop Architectural Navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {PRIMARY_NAV.map((item) => {
              const active =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isHeroOverlay
                      ? active
                        ? 'bg-white/15 text-white'
                        : 'text-[#EADBC6] hover:bg-white/10 hover:text-white'
                      : active
                        ? 'bg-[var(--brand-crimson-soft)] text-[var(--brand-crimson)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Search toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Toggle product search"
              aria-expanded={searchOpen}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-11 ${
                isHeroOverlay
                  ? 'text-[#FAF2E6] hover:bg-white/10'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]'
              }`}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* WhatsApp quick pill on desktop */}
            <a
              href={buildWhatsAppUrl(`Hello ${BRAND.fullName}, I would like to enquire about your products.`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ eventName: 'whatsapp_click', path: pathname })}
              className={`hidden h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors xl:inline-flex ${
                isHeroOverlay
                  ? 'border border-white/20 bg-white/10 text-[#FAF2E6] hover:bg-white/20'
                  : 'border border-[var(--brand-leaf)]/30 bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)] hover:bg-[var(--brand-leaf)] hover:text-white'
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              WhatsApp
            </a>

            {/* Spice Bag button */}
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label={`Open shopping bag, ${itemCount} items`}
              className={`relative flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold transition-all sm:h-11 sm:gap-2 sm:px-3.5 ${
                isHeroOverlay
                  ? 'border border-[var(--brand-turmeric-bright)]/45 bg-[var(--brand-crimson)] text-white shadow-md hover:bg-[var(--brand-crimson-hover)]'
                  : 'border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs hover:border-[var(--brand-crimson)] hover:bg-[var(--brand-crimson-soft)]'
              }`}
            >
              <ShoppingBag
                className={`h-4 w-4 ${isHeroOverlay ? 'text-[var(--brand-turmeric-bright)]' : 'text-[var(--brand-crimson)]'}`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Bag</span>
              <span
                className={`font-mono-num flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                  isHeroOverlay
                    ? 'bg-[var(--brand-turmeric-bright)] text-[#1B0F0A]'
                    : 'bg-[var(--brand-crimson)] text-white'
                }`}
              >
                {itemCount}
              </span>
            </button>

            {/* Mobile Menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className={`flex h-10 w-10 items-center justify-center rounded-full sm:h-11 sm:w-11 lg:hidden ${
                isHeroOverlay
                  ? 'text-[#FAF2E6] hover:bg-white/10'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]'
              }`}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Bilingual Search Drawer */}
        {searchOpen && (
          <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3.5 shadow-lg">
            <form onSubmit={handleSearchSubmit} role="search" className="mx-auto flex max-w-2xl gap-2">
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Tamil or English (e.g. Manjal, Fish Masala, கொள்ளு, Ulundhu Kali)..."
                aria-label="Search products in English or Tamil"
                className="h-11 flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-[var(--brand-crimson)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-crimson-hover)]"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile / Tablet Slide-Down Menu */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile menu"
            className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-4 shadow-xl lg:hidden"
          >
            <div className="grid grid-cols-1 gap-1">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center justify-between rounded-xl px-3.5 text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-xl px-3.5 text-base font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-muted)]"
              >
                Contact & Support
              </Link>
              <a
                href={buildWhatsAppUrl(`Hello ${BRAND.fullName}, I have a question about your products.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--brand-leaf)] px-4 text-sm font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Enquire on WhatsApp ({BRAND.phoneDisplay})
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* Dedicated Mobile Touch-First Bottom Navigation (Hidden on >= 768px) */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-5 items-center px-1 py-1">
          {[
            { href: '/', label: 'Home', icon: Home },
            { href: '/products', label: 'Pantry', icon: Store },
            { href: '/categories', label: 'Collections', icon: LayoutGrid },
            { href: '/search', label: 'Search', icon: PackageSearch },
          ].map((tab) => {
            const Icon = tab.icon;
            const active =
              pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium ${
                  active ? 'text-[var(--brand-crimson)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium text-[var(--text-secondary)]"
          >
            <span className="relative">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {itemCount > 0 && (
                <span className="font-mono-num absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-crimson)] px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </span>
            <span>Bag</span>
          </button>
        </div>
      </nav>
    </>
  );
}
