import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { FavoritesProvider } from '@/lib/favorites';
import { PublicLayout } from '@/components/PublicLayout';
import { Toaster } from 'sonner';

import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Tenório Confecções | Personalizados, Camisetas, Moletons e Muito Mais',
  description:
    'Tenório Confecções: produtos personalizados para empresas, eventos, festas, equipes e ocasiões especiais. Solicite seu orçamento online.',
  keywords: [
    'camisetas personalizadas',
    'moletons personalizados',
    'canecas personalizadas',
    'abadás personalizados',
    'bandeiras personalizadas',
    'wind banner',
    'uniformes corporativos',
    'tenório confecções',
    'caruaru',
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let faviconUrl = '/favicon.svg';
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'favicon_url' } });
    if (setting?.value) {
      faviconUrl = setting.value;
    } else {
      const logoSetting = await prisma.siteSetting.findUnique({ where: { key: 'logo_url' } });
      if (logoSetting?.value) {
        faviconUrl = logoSetting.value;
      }
    }
  } catch {}

  return (
    <html lang="pt-BR" className="h-full bg-slate-950 text-slate-100 antialiased">
      <head>
        <link rel="icon" href={faviconUrl} />
        <link rel="shortcut icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
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
