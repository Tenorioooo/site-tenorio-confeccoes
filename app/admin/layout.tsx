'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Palette, Tag, FileSpreadsheet, Settings, LogOut, ExternalLink, ImageIcon, Briefcase, MessageSquare, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { AdminInactivityWatcher } from '@/components/AdminInactivityWatcher';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoUrl, setLogoUrl] = React.useState('/logo/LOGO2 - TENÓRIO CONFECÇÕES.png');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(() => {});
  }, [pathname]);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // If on login page, don't show admin sidebar layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Produtos', href: '/admin/produtos', icon: Package },
    { name: 'Estampas', href: '/admin/estampas', icon: Palette },
    { name: 'Categorias', href: '/admin/estampas/categorias', icon: Tag },
    { name: 'Portfólio', href: '/admin/portfolio', icon: Briefcase },
    { name: 'Depoimentos', href: '/admin/depoimentos', icon: MessageSquare },
    { name: 'Imagens & Capas', href: '/admin/imagens', icon: ImageIcon },
    { name: 'Orçamentos', href: '/admin/orcamentos', icon: FileSpreadsheet },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ];

  const currentItem = navItems.find((item) => item.href === pathname) || { name: 'Painel Admin' };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Desconectado com sucesso!');
      router.push('/admin/login');
    } catch (e) {
      router.push('/admin/login');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* Logo Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <div className="relative flex items-center justify-start">
              <Image
                src={logoUrl}
                alt="Tenório Confecções"
                width={140}
                height={40}
                unoptimized
                className="object-contain h-9 w-auto max-w-[150px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo/Icon.png';
                }}
              />
            </div>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
              Painel Admin
            </span>
          </div>

          {/* Close button inside mobile drawer */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 text-xs font-bold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 active:scale-98'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between text-slate-400 hover:text-white p-2.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <span>Ver Site Público</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 p-2.5 rounded-xl hover:bg-red-500/10 transition-colors font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* ── MOBILE TOPBAR (Visible only on < md) ── */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Image
            src={logoUrl}
            alt="Tenório Confecções"
            width={120}
            height={32}
            unoptimized
            className="object-contain h-7 w-auto max-w-[130px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo/Icon.png';
            }}
          />
          <span className="text-slate-500 text-xs font-semibold">|</span>
          <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">
            {currentItem.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white active:scale-95 transition-transform"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── MOBILE SLIDE-OVER DRAWER (Visible only on < md when open) ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between h-full z-10 shadow-2xl animate-in slide-in-from-left duration-250 overflow-y-auto">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR (Visible only on >= md) ── */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 border-r border-slate-800 shrink-0 p-6 flex-col justify-between space-y-6 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-full">{children}</main>

      {/* Inactivity Watcher */}
      <AdminInactivityWatcher onLogout={handleLogout} />
    </div>
  );
}
