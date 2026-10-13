import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { FavoritesProvider } from '@/lib/favorites';
import { PublicLayout } from '@/components/PublicLayout';
import { Toaster } from 'sonner';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.svg';
  let logoUrl = 'https://www.tenorioconfeccoes.shop/logo/LOGO2%20-%20TEN%C3%93RIO%20CONFEC%C3%87%C3%95ES.png';

  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'favicon_url' } });
    if (setting?.value) {
      faviconUrl = setting.value;
    }

    const logoSetting = await prisma.siteSetting.findUnique({ where: { key: 'logo_url' } });
    if (logoSetting?.value) {
      logoUrl = logoSetting.value.startsWith('http')
        ? logoSetting.value
        : `https://www.tenorioconfeccoes.shop${logoSetting.value}`;
      if (!setting?.value) {
        faviconUrl = logoSetting.value;
      }
    }
  } catch {}

  const siteTitle = 'Tenório Confecções | Camisetas, Moletons e Uniformes Personalizados';
  const siteDesc =
    'Especialistas em confecção sob medida de camisetas, moletons, uniformes profissionais, abadás, canecas e wind banners em Andradina - SP. Atendemos empresas, escolas, eventos e turmas em todo o Brasil. Solicite seu orçamento online!';

  return {
    metadataBase: new URL('https://www.tenorioconfeccoes.shop'),
    title: {
      default: siteTitle,
      template: '%s | Tenório Confecções',
    },
    description: siteDesc,
    keywords: [
      'camisetas personalizadas',
      'uniformes profissionais',
      'moletons personalizados',
      'canecas personalizadas',
      'abadás personalizados',
      'bandeiras personalizadas',
      'wind banner',
      'terceirão formandos',
      'tenório confecções',
      'andradina sp',
      'três lagoas ms',
      'castilho sp',
      'araçatuba sp',
      'estamparia personalizada',
      'silk screen dtf serigrafia',
      'uniformes corporativos',
    ],
    authors: [{ name: 'Tenório Confecções' }],
    creator: 'Tenório Confecções',
    publisher: 'Tenório Confecções',
    icons: {
      icon: [{ url: faviconUrl }],
      shortcut: [{ url: faviconUrl }],
      apple: [{ url: faviconUrl }],
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      url: 'https://www.tenorioconfeccoes.shop',
      siteName: 'Tenório Confecções',
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: 'Tenório Confecções',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDesc,
      images: [logoUrl],
    },
    alternates: {
      canonical: 'https://www.tenorioconfeccoes.shop',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let faviconUrl = '/favicon.svg';
  let gaId = '';
  let pixelId = '';

  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['favicon_url', 'logo_url', 'ga_id', 'pixel_id'],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    if (settingsMap.favicon_url) {
      faviconUrl = settingsMap.favicon_url;
    } else if (settingsMap.logo_url) {
      faviconUrl = settingsMap.logo_url;
    }

    if (settingsMap.ga_id) gaId = settingsMap.ga_id.trim();
    if (settingsMap.pixel_id) pixelId = settingsMap.pixel_id.trim();
  } catch {}

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Tenório Confecções',
    image: 'https://www.tenorioconfeccoes.shop/logo/LOGO2%20-%20TEN%C3%93RIO%20CONFEC%C3%87%C3%95ES.png',
    url: 'https://www.tenorioconfeccoes.shop',
    telephone: '+5518991795656',
    email: 'tenorioconfeccoes.of@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Andradina',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'São Paulo' },
      { '@type': 'AdministrativeArea', name: 'Mato Grosso do Sul' },
      { '@type': 'Country', name: 'Brasil' },
    ],
    priceRange: '$$',
    description:
      'Confecção sob medida de camisetas personalizadas, uniformes empresariais, moletons, canecas e brindes promocionais com entrega em todo o Brasil.',
  };

  return (
    <html lang="pt-BR" className="h-full bg-slate-950 text-slate-100 antialiased">
      <head>
        <link rel="icon" href={faviconUrl} />
        <link rel="shortcut icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tenório Admin" />

        {/* Structured Data (Schema.org JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Analytics 4 (quando configurado no painel) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Meta Pixel (quando configurado no painel) */}
        {pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </head>
      <body className="min-h-full flex flex-col justify-between selection:bg-blue-500 selection:text-slate-950">
        <CartProvider>
          <FavoritesProvider>
            <Toaster position="top-right" richColors theme="dark" />
            <PublicLayout>{children}</PublicLayout>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
