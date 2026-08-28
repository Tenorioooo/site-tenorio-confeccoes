import React from 'react';
import { Shirt, Image as ImageIcon, ShoppingCart, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Escolha seu produto',
      description: 'Navegue pelo catálogo e escolha entre camisetas, moletons, canecas, abadás, bandeiras e uniformes.',
      icon: Shirt,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      number: '02',
      title: 'Estampa ou Arte Própria',
      description: 'Selecione um dos nossos modelos exclusivos (código EST) ou faça o envio da sua própria arte/logomarca.',
      icon: ImageIcon,
      color: 'from-blue-500 to-blue-600',
    },
    {
      number: '03',
      title: 'Monte seu orçamento',
      description: 'Informe as quantidades, divisão de tamanhos (P, M, G...), locais de impressão e prazos desejados.',
      icon: ShoppingCart,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      number: '04',
      title: 'Atendimento no WhatsApp',
      description: 'Sua solicitação é gerada com um código único (ex: ORC-2026-000184) e encaminhada direto para nossa equipe.',
      icon: MessageSquare,
      color: 'from-purple-500 to-violet-600',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-[#1c253d] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
            PASSO A PASSO SIMPLES
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Como Funciona Nosso Atendimento
          </h2>
          <p className="text-slate-300 text-base">
            Desenvolvemos um processo rápido e prático para transformar sua ideia em produto final de alta qualidade.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const IconComp = step.icon;

            return (
              <div
                key={step.number}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative group hover:border-blue-400/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                {/* Step Number Tag */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="font-serif font-black text-3xl text-slate-700 group-hover:text-blue-400 transition-colors">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-medium text-blue-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Etapa {idx + 1} de 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout Banner */}
        <div className="mt-16 text-center bg-slate-900/60 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto shadow-inner">
          <p className="text-lg sm:text-xl font-serif font-bold text-blue-300">
            &ldquo;Você escolhe. A gente personaliza. Nossa equipe cuida do resto.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
