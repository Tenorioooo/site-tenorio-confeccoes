'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PartyPopper, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const DEFAULT_EVENTS_IMAGE = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80';

export function CorporateEventsSection() {
  const [eventsImage, setEventsImage] = useState(DEFAULT_EVENTS_IMAGE);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.img_home_eventos) setEventsImage(data.img_home_eventos);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Events / Parties / Teams */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <PartyPopper className="w-4 h-4" />
              <span>FESTAS, BLOCOS & FESTIVAIS</span>
            </div>

            <h2
              className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.7)',
              }}
            >
              Seu evento merece uma identidade marcante.
            </h2>

            <p
              className="text-slate-200 text-base leading-relaxed font-medium"
              style={{
                textShadow: '0 1px 6px rgba(0,0,0,0.9)',
              }}
            >
              Proporcione uma experiência inesquecível aos participantes do seu evento. Produzimos abadás, kits de formandos, bandeiras, tirantes e sinalização de alta visibilidade.
            </p>

            <ul className="grid grid-cols-2 gap-3 text-sm text-slate-200 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Abadás com Sublimação Total</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bandeiras & Wind Banners</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kits para Formaturas & Terceirão</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Uniformes para Equipes & Staff</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link
                href="/eventos"
                className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>MONTAR ORÇAMENTO PARA MEU EVENTO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
            <Image
              src={eventsImage}
              alt="Produtos para Eventos Tenório Confecções"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
