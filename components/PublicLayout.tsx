'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QuoteDrawer } from '@/components/QuoteDrawer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <QuoteDrawer />
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}
