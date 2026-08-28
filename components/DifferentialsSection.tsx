import React from 'react';
import { Palette, Award, Headset, Calendar, UploadCloud, Calculator } from 'lucide-react';

export function DifferentialsSection() {
  const differentials = [
    {
      title: 'Personalização Total',
      description: 'Produtos confeccionados estritamente de acordo com sua cor, estampa, tamanhos e modelo desejado.',
      icon: Palette,
    },
    {
      title: 'Qualidade Premium',
      description: 'Tecidos de alto padrão, costura reforçada e técnicas de impressão (Silk, Sublimação, DTF, Bordado) duráveis.',
      icon: Award,
    },
    {
      title: 'Atendimento Personalizado',
      description: 'Nossa equipe acompanha você desde a escolha do tecido e ajuste da arte até a entrega final.',
      icon: Headset,
    },
    {
      title: 'Estrutura para Grandes Eventos',
      description: 'Capacidade de produção escalável para demandas de festas, turmas, blocos e grandes corporações.',
      icon: Calendar,
    },
    {
      title: 'Envio de Arte Própria',
      description: 'Você pode enviar seu próprio arquivo de vetor ou imagem e nós avaliamos e preparamos a estampa.',
      icon: UploadCloud,
    },
    {
      title: 'Orçamento Transparente',
      description: 'Cálculo de valores por faixas de quantidade, minimizando custos e entregando o melhor custo-benefício.',
      icon: Calculator,
    },
  ];

  return (
    <section className="py-20 bg-[#161d30] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
            DIFERENCIAIS EXCLUSIVOS
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Por que escolher a Tenório Confecções?
          </h2>
          <p className="text-slate-300 text-base">
            Combinamos anos de know-how técnico em confecção com suporte atencioso para entregar produtos impecáveis.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {differentials.map((item, idx) => {
            const IconComp = item.icon;

            return (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 hover:border-blue-400/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl group space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IconComp className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
