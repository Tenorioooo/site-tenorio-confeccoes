import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, ShieldCheck, Heart, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#283353] via-[#1c253d] to-[#161d30] border border-slate-800 rounded-3xl p-8 sm:p-16 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
              INSTITUCIONAL
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-tight">
              Feito para transformar ideias em produtos.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Na Tenório Confecções, unimos paixão por estamparia, rigor técnico e foco no atendimento humano para entregar produtos que destacam sua marca e celebram seus momentos.
            </p>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Nossa Missão</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Oferecer soluções completas de confecção e personalização com pontualidade, alto padrão de acabamento e preço justo.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Compromisso com a Qualidade</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Utilizamos malhas penteadas 100% algodão, tecidos dry fit respiráveis e tintas de alta fixação que não desbotam.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Atendimento Próximo</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Acompanhamos seu pedido desde a conferência do arquivo até a postagem ou entrega presencial.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-2xl mx-auto shadow-inner">
          <h3 className="text-2xl font-serif font-bold text-white">Pronto para começar seu projeto?</h3>
          <p className="text-xs text-slate-300">
            Monte seu orçamento online em poucos cliques e fale com nossos especialistas no WhatsApp.
          </p>
          <Link
            href="/orcamento"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>MONTAR MEU ORÇAMENTO</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
