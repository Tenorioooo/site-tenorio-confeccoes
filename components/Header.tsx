'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuoteCart } from '@/lib/cart';
import { ShoppingBag, Menu, X, PhoneCall, ChevronRight, Sparkles } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalQuantity, setIsDrawerOpen } = useQuoteCart();
  const [logoUrl, setLogoUrl] = useState('/logo/LOGO2 - TENÓRIO CONFECÇÕES.png');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Produtos', href: '/produtos' },
    { name: 'Estampas', href: '/estampas' },
    { name: 'Eventos', href: '/eventos' },
    { name: 'Como Funciona', href: '/#como-funciona' },
    { name: 'Sobre Nós', href: '/sobre' },
    { name: 'Contato', href: '/contato' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-slate-700/50 text-white shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group py-1">
          <div className="relative flex items-center justify-center">
            <Image
              src={logoUrl}
              alt="Tenório Confecções"
              width={180}
              height={56}
              unoptimized
              className="object-contain h-9 sm:h-14 w-auto max-w-[150px] sm:max-w-[200px] drop-shadow group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo/Icon.png';
              }}
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-200 hover:text-blue-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-400 hover:after:w-full after:transition-all"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quote Cart Button Badge */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 bg-slate-800/80 hover:bg-slate-800 text-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm font-medium transition-all active:scale-95 shadow-md"
            title="Ver meu orçamento"
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Meu Orçamento</span>
            {totalQuantity > 0 && (
              <span className="bg-blue-500 text-slate-950 font-black text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Primary CTA */}
          <Link
            href="/orcamento"
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>MONTAR ORÇAMENTO</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-200 hover:text-white rounded-xl bg-slate-800 border border-slate-700 active:scale-95 transition-transform"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 top-16 bg-black/70 backdrop-blur-sm z-30 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden relative z-40 bg-slate-900/98 backdrop-blur-2xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200 shadow-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-slate-200 hover:text-white font-medium py-3 px-3.5 rounded-xl hover:bg-slate-800 transition-colors text-sm"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            ))}
            <div className="pt-3 space-y-2">
              <Link
                href="/orcamento"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg w-full text-center text-xs tracking-wide uppercase active:scale-98 transition-transform"
              >
                <Sparkles className="w-4 h-4" />
                <span>MONTAR ORÇAMENTO ONLINE</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
