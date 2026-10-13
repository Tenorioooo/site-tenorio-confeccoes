import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Award,
  Building2,
  Receipt,
  FileCheck2,
  Truck,
  RotateCcw,
  Zap,
  Shirt,
  PhoneCall,
  Clock,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uniformes Corporativos & B2B | Tenório Confecções',
  description:
    'Uniformes profissionais, camisas polo corporativas, moletons e brindes para empresas. Faturamento no boleto para CNPJ, emissão de NF-e e entrega para todo o Brasil. Solicite uma proposta!',
  keywords: [
    'uniformes corporativos',
    'uniformes para empresas',
    'camisa polo corporativa',
    'camisetas personalizadas cnpj',
    'uniformes profissionais',
    'uniformes andradina',
    'uniformes tres lagoas',
  ],
};

export default function CorporatePage() {
  const corporateProducts = [
    {
      title: 'Camisas Polo Corporativas',
      badge: 'Líder Corporativo',
      desc: 'Tecido Piquet clássico ou Dry Confort com personalização em DTF HD ou Silk Screen de alta definição no peito e manga. Modelagem refinada para gerência e equipe de vendas.',
      tags: ['Piquet 50/50', 'Algodão Nobre', 'Gola Estruturada'],
    },
    {
      title: 'Camisetas Operacionais & Fábrica',
      badge: 'Alta Resistência',
      desc: 'Malha 100% algodão penteado ou dry-fit respirável. Costuras reforçadas ombro a ombro para máxima durabilidade no dia a dia da operação.',
      tags: ['Anti-Pilling', 'Não Desbota', 'Costura Dupla'],
    },
    {
      title: 'Moletons & Corta-Vento',
      badge: 'Inverno Corporativo',
      desc: 'Moletons canguru e careca flanelados com estampa DTF HD de alta durabilidade e definição. Mantenha sua equipe aquecida e padronizada nos meses frios.',
      tags: ['Flanelado Pesado', 'DTF HD', 'Acabamento Ribana'],
    },
    {
      title: 'Kits para Feiras & Convenções',
      badge: 'Marketing & Eventos',
      desc: 'Camisetas promocionais, canecas térmicas, cordões de crachá e wind banners para destacar sua marca em congressos e eventos do setor.',
      tags: ['Entrega Rápida', 'Design Incluso', 'Kits Completos'],
    },
  ];

  const b2bAdvantages = [
    {
      icon: <Receipt className="w-6 h-6 text-emerald-400" />,
      title: 'Faturamento para CNPJ',
      desc: 'Pagamento facilitado no boleto bancário para empresas após breve análise cadastral.',
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-blue-400" />,
      title: 'Emissão de Nota Fiscal (NF-e)',
      desc: 'Total conformidade contábil e fiscal com emissão de nota eletrônica em todas as operações.',
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-purple-400" />,
      title: 'Reposição Sem Pedido Mínimo',
      desc: 'Contratou um funcionário novo? Nós mantemos seus arquivos e artes guardados para produzir novas reposições no mesmo padrão exato.',
    },
    {
      icon: <Truck className="w-6 h-6 text-amber-400" />,
      title: 'Envio para Múltiplas Filiais',
      desc: 'Sua empresa tem unidades em outras cidades? Despachamos os lotes etiquetados para cada endereço.',
    },
  ];

  const techniques = [
    {
      name: 'DTF Digital HD',
      indicated: 'Polos, Moletons e Camisetas',
      benefit: 'Cores vivas sem limite de tons, alta elasticidade, altíssima durabilidade e toque suave.',
    },
    {
      name: 'Silk Screen (Serigrafia)',
      indicated: 'Grandes Lotes de Camisetas',
      benefit: 'O melhor custo por unidade para pedidos acima de 30 peças com tintas nobres.',
    },
    {
      name: 'Sublimação Total',
      indicated: 'Uniformes Esportivos e Abadás',
      benefit: 'Impressão direta na fibra do tecido sem relevo, 100% respirável e cores permanentes.',
    },
    {
      name: 'Transfer Térmico & Vinil',
      indicated: 'Numerações e Detalhes Especiais',
      benefit: 'Aplicação precisa para identificação nominal, números e elementos gráficos exclusivos.',
    },
  ];

  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-[#283353] via-[#1c253d] to-[#161d30] border border-slate-800 rounded-3xl p-8 sm:p-16 shadow-2xl relative overflow-hidden text-center sm:text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>UNIFORMES PROFISSIONAIS &amp; VESTUÁRIO B2B</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-[1.15]">
              Sua equipe vestindo a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-400">
                credibilidade da sua marca.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Uniformes corporativos, camisas polo personalizadas, moletons de inverno e brindes promocionais com alto rigor têxtil, pontualidade e condições comerciais diferenciadas para empresas de todos os portes.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <a
                href="https://wa.me/5518991795656?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20corporativo%20de%20uniformes%20para%20a%20minha%20empresa!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black px-8 py-4 rounded-xl shadow-xl shadow-blue-500/20 text-base transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                <span>SOLICITAR PROPOSTA B2B NO WHATSAPP</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <Link
                href="/orcamento"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-800 text-white font-bold px-6 py-4 rounded-xl border border-slate-700 text-sm transition-all hover:scale-105 active:scale-95"
              >
                <span>MONTAR ORÇAMENTO ONLINE</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Corporate Solutions Cards */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
              SOLUÇÕES CORPORATIVAS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
              Linha Completa de Vestuário Profissional
            </h2>
            <p className="text-slate-400 text-sm">
              Desde a recepção até a linha de produção, padronize seu time com conforto e elegância.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {corporateProducts.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-xl space-y-4 group"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase">
                    {p.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {p.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* B2B Advantages Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3.5 py-1 rounded-full">
              FACILIDADES PARA SUA EMPRESA
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
              Vantagens Exclusivas para Compras Corporativas
            </h2>
            <p className="text-slate-400 text-sm">
              Processo desburocratizado para compras recorrentes e grandes volumes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {b2bAdvantages.map((adv, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl"
              >
                <div className="p-3 bg-slate-950 rounded-2xl w-fit border border-slate-800">
                  {adv.icon}
                </div>
                <h3 className="text-base font-bold text-white">{adv.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Techniques Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-2xl font-serif font-bold text-white">
              Técnicas de Personalização com Tecnologia de Ponta
            </h3>
            <p className="text-xs text-slate-400">
              Escolha a melhor técnica para a identidade visual da sua marca:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {techniques.map((tec, idx) => (
              <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-sm font-bold text-blue-400 block">{tec.name}</span>
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Indicado para: {tec.indicated}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">{tec.benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Contact CTA */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
              Precisa de um consultor para visitar sua empresa ou enviar amostras?
            </h3>
            <p className="text-sm text-blue-100 max-w-xl">
              Nossa equipe atende empresas de Andradina, Três Lagoas, Araçatuba e todo o Brasil com amostras de tecido e consultoria de modelagem.
            </p>
          </div>

          <a
            href="https://wa.me/5518991795656?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20consultor%20B2B%20da%20Ten%C3%B3rio%20Confec%C3%A7%C3%B5es!"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-slate-950 hover:bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 text-sm inline-flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>FALAS COM CONSULTOR B2B</span>
          </a>
        </div>
      </div>
    </div>
  );
}
