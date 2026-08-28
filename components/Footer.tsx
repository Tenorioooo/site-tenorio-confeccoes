'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Clock } from 'lucide-react';

interface SiteSettings {
  whatsapp_number?: string;
  email?: string;
  address?: string;
  instagram?: string;
  company_name?: string;
  business_hours?: string;
  logo_url?: string;
}

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp_number: '+55 18 99179-5656',
    email: 'tenorioconfeccoes.of@gmail.com',
    address: 'Andradina - SP | Atendemos todo o Brasil',
    instagram: '@tenorio_confeccoes',
    company_name: 'Tenório Confecções',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  // Normalize the WhatsApp number: strip non-digits, ensure it starts with 55
  const rawWa = (settings.whatsapp_number || '5518991795656').replace(/\D/g, '');
  const waNumber = rawWa.startsWith('55') ? rawWa : `55${rawWa}`;

  // Normalize Instagram handle for URL
  const igHandle = (settings.instagram || '@tenorio_confeccoes').replace('@', '');

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <div className="relative flex items-center justify-start">
                <Image
                  src={settings.logo_url || '/logo/LOGO2 - TENÓRIO CONFECÇÕES.png'}
                  alt="Tenório Confecções"
                  width={160}
                  height={48}
                  unoptimized
                  className="object-contain h-12 w-auto max-w-[180px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo/Icon.png';
                  }}
                />
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed pr-4">
              Especialistas em produtos personalizados para empresas, eventos, equipes, festas e marcas próprias. Qualidade superior, pontualidade e orçamento sob medida.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {/* Instagram */}
              <a
                href={`https://instagram.com/${igHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400/40 transition-all"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-400/40 transition-all"
                aria-label="WhatsApp"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide uppercase text-xs text-blue-400">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-blue-400 transition-colors">
                  Catálogo de Produtos
                </Link>
              </li>
              <li>
                <Link href="/estampas" className="hover:text-blue-400 transition-colors">
                  Catálogo de Estampas
                </Link>
              </li>
              <li>
                <Link href="/orcamento" className="hover:text-blue-400 transition-colors font-medium text-blue-400">
                  Montar Orçamento
                </Link>
              </li>
              <li>
                <Link href="/acompanhar-orcamento" className="hover:text-blue-400 transition-colors">
                  Acompanhar Orçamento
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-blue-400 transition-colors">
                  Sobre a Empresa
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-blue-400 transition-colors">
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide uppercase text-xs text-blue-400">
              Categorias
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/produtos?category=Camisetas" className="hover:text-blue-400 transition-colors">
                  Camisetas Personalizadas
                </Link>
              </li>
              <li>
                <Link href="/produtos?category=Moletons" className="hover:text-blue-400 transition-colors">
                  Moletons & Agasalhos
                </Link>
              </li>
              <li>
                <Link href="/produtos?category=Canecas" className="hover:text-blue-400 transition-colors">
                  Canecas Personalizadas
                </Link>
              </li>
              <li>
                <Link href="/produtos?category=Abad%C3%A1s" className="hover:text-blue-400 transition-colors">
                  Abadás de Eventos
                </Link>
              </li>
              <li>
                <Link href="/produtos?category=Bandeiras" className="hover:text-blue-400 transition-colors">
                  Bandeiras & Wind Banners
                </Link>
              </li>
              <li>
                <Link href="/produtos?category=Uniformes" className="hover:text-blue-400 transition-colors">
                  Uniformes Corporativos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details — now dynamic */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide uppercase text-xs text-blue-400">
              Atendimento
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: {settings.whatsapp_number || '+55 18 99179-5656'}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <a
                  href={`mailto:${settings.email || 'tenorioconfeccoes.of@gmail.com'}`}
                  className="hover:text-blue-400 transition-colors break-all"
                >
                  {settings.email || 'tenorioconfeccoes.of@gmail.com'}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span>{settings.address || 'Andradina - SP | Atendemos todo o Brasil'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <span>{settings.business_hours || 'Seg a Sex: 09h às 17h'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {settings.company_name || 'Tenório Confecções'} — Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin/login" className="hover:text-slate-300 transition-colors">
              Área Administrativa
            </Link>
            <span className="text-slate-800">•</span>
            <span>CNPJ registrado</span>
            <span className="text-slate-800">•</span>
            <span>Produção sob demanda</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
