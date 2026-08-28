import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Award } from 'lucide-react';

export default function CorporatePage() {
  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#283353] via-[#1c253d] to-[#161d30] border border-slate-800 rounded-3xl p-8 sm:p-16 shadow-2xl relative overflow-hidden text-center sm:text-left">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              <span>VESTUÁRIO & BRINDES CORPORATIVOS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-tight">
              Sua empresa também pode vestir a sua marca.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Uniformes profissionais, polos corporativas, moletons de inverno, brindes e camisetas para feiras e ações promocionais. Qualidade superior que transmite credibilidade.
            </p>

            <div className="pt-2">
              <Link
                href="/orcamento"
                className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-8 py-4 rounded-xl shadow-xl shadow-blue-500/20 text-base transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                <span>SOLICITAR ORÇAMENTO CORPORATIVO</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-xl font-bold text-white">Uniformes e Polos</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modelagem anatômica em algodão, piquet ou dry fit com bordados computadorizados de alta precisão.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-xl font-bold text-white">Eventos & Convenções</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kits promocionais com camisetas, canecas, cordões e brindes para convenções de vendas e feiras.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-xl font-bold text-white">Atendimento B2B</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Faturamento para empresas, emissão de nota fiscal e prazos alinhados com suas demandas corporativas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
