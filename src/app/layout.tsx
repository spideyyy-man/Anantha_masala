import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans, Noto_Sans_Tamil, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { BRAND } from '@/data/brand';
import { StoreProviders } from '@/components/providers/StoreProviders';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ConsentBanner } from '@/components/ui/ConsentBanner';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-tamil',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.fullName} — Traditional South Indian Masalas, Podi & Heritage Mixes`,
    template: `%s | ${BRAND.fullName}`,
  },
  description:
    'Madurai Anantha Masala: authentic South Indian masalas, traditional idli podis, heritage rice flours, millet dosa mixes, and kanji mixes from Madurai, Tamil Nadu.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: BRAND.fullName,
    title: `${BRAND.fullName} — ${BRAND.positioning}`,
    description:
      'Shop genuine Madurai masalas, idli podis, heritage rice flours, and kanji mixes directly from Madurai, Tamil Nadu.',
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  themeColor: '#faf5ec',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.fullName,
    alternateName: [BRAND.name, BRAND.socialProfileName, BRAND.tamilName],
    url: siteUrl,
    telephone: `+91-${BRAND.phoneRaw}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Meenakshi Nagar, Aruppukottai Main Road, Villapuram',
      addressLocality: 'Madurai',
      addressRegion: 'Tamil Nadu',
      postalCode: '625012',
      addressCountry: 'IN',
    },
    sameAs: [BRAND.social.instagramUrl, BRAND.social.youtubeUrl],
  };

  return (
    <html
      lang="en-IN"
      className={`${fraunces.variable} ${jakarta.variable} ${notoTamil.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <StoreProviders>
          <SiteHeader />
          <CartDrawer />
          <main id="main-content" className="min-h-[70vh]">
            {children}
          </main>
          <SiteFooter />
          <ConsentBanner />
        </StoreProviders>
      </body>
    </html>
  );
}
