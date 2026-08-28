import React from 'react';
import Link from 'next/link';
import { PartyPopper, Sparkles, ArrowRight, CheckCircle2, Flag, Shirt, Coffee } from 'lucide-react';

export default function EventsPage() {
  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#283353] via-[#1c253d] to-[#161d30] border border-slate-800 rounded-3xl p-8 sm:p-16 shadow-2xl relative overflow-hidden text-center sm:text-left">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <PartyPopper className="w-4 h-4" />
              <span>FESTAS, BLOCOS, FORMADORES & EQUIPES</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-tight">
              Seu evento merece uma identidade marcante.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Abadás com sublimação total, bandeiras promocionais, wind banners de entrada, canecas personalizadas e vestuário completo para tornar sua festa inesquecível.
            </p>

            <div className="pt-2">
              <Link
                href="/orcamento"
                className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-8 py-4 rounded-xl shadow-xl shadow-blue-500/20 text-base transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                <span>MONTAR ORÇAMENTO PARA MEU EVENTO</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit">
              <Shirt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Abadás & Camisetas</h3>
            <p className="text-xs text-slate-300">
              Cores vivas e tecido respirável para blocos, carnaval e festas universitárias.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit">
              <Flag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Wind Banner & Bandeiras</h3>
            <p className="text-xs text-slate-300">
              Sinalização de alta visibilidade para fachadas de shows e entradas de eventos.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Canecas & Lembranças</h3>
            <p className="text-xs text-slate-300">
              Canecas de porcelana personalizadas para lembrança de convidados e patrocinadores.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Kits Terceirão & Turmas</h3>
            <p className="text-xs text-slate-300">
              Moletons e camisetas de formandos com nomes individuais e estampas da turma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
