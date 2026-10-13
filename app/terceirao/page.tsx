import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Zap,
  Coffee,
  Flag,
  Flame,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kits para Terceirão & Formaturas | Tenório Confecções',
  description:
    'Moletons bordados, camisetas personalizadas, canecas de alumínio com tirante e bandeiras para Terceirão e formaturas. Nomes e números individuais para cada aluno. Faça a cotação da sua sala!',
  keywords: [
    'terceirao',
    'moletom terceirao',
    'camiseta terceirao',
    'caneca terceirao',
    'uniforme formandos',
    'kit formatura terceirao',
    'andradina',
    'tres lagoas',
    'castilho',
  ],
};

export default function TerceiraoPage() {
  const combos = [
    {
      title: 'Combo Terceirão Gold 🏆',
      tag: 'Mais Pedido pelas Turmas',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'O pacote definitivo para marcar o último ano da sua turma com estilo e qualidade máxima.',
      items: [
        'Moletom Canguru Flanelado com capuz e bordado/DTF de alta definição',
        'Camiseta 100% Algodão Penteado ou Dry-Fit com estampa da sala',
        'Caneca de Alumínio 500ml personalizada com tirante exclusivo',
        'Bandeirão gigante da turma para fotos e jogos escolares',
        'Nome e número individual de cada aluno personalizado sem custo extra',
      ],
      popular: true,
    },
    {
      title: 'Combo Essencial ⚡',
      tag: 'Custo-Benefício',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      description: 'Perfeito para eventos, trote, passeios e o dia a dia da sala de aula.',
      items: [
        'Camiseta Personalizada 100% Algodão ou Dry-Fit respirável',
        'Caneca de Alumínio 500ml com tirante estampado',
        'Arte exclusiva criada ou ajustada pela nossa equipe',
        'Nome individual de cada aluno na manga ou costas',
      ],
      popular: false,
    },
    {
      title: 'Combo Inverno & Moletom ❄️',
      tag: 'Alta Gramatura',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Moletom pesado com felpa interna super macia para curtir o ano inteiro quentinho.',
      items: [
        'Moletom Canguru Flanelado premium com bolso frontal',
        'Bordado computadorizado com pontos fechados e sem fiapos',
        'Capuz forrado com ilhós e cordão ajustável grosso',
        'Opção de nome individual bordado ou estampado no punho/costas',
      ],
      popular: false,
    },
  ];

  const differentials = [
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      title: 'Cada aluno com seu nome',
      description:
        'Não precisa se preocupar com confusão: organizamos e etiquetamos cada peça com o nome e tamanho correto de cada formando.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      title: 'Amostra Virtual 3D Grátis',
      description:
        'Montamos a prévia digital do moletom e da camiseta para você apresentar no grupo da turma e aprovar antes de rodar a produção.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Pagamento Facilitado p/ a Turma',
      description:
        'Condições especiais para comissões de formatura, com prazos programados e opções de parcelamento.',
    },
    {
      icon: <Award className="w-6 h-6 text-purple-400" />,
      title: 'Qualidade que Dura Anos',
      description:
        'Tecidos que não encolhem na lavagem e estampas de alta fixação para você guardar essa lembrança para o resto da vida.',
    },
  ];

  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-[#283353] via-[#1c253d] to-[#161d30] border border-slate-800 rounded-3xl p-8 sm:p-16 shadow-2xl relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-3xl space-y-6 relative z-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>TERCEIRÃO, FORMANDOS &amp; TURMAS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-[1.15]">
              O último ano merece uma{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                identidade inesquecível.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Moletons bordados, camisetas personalizadas, canecas de alumínio com tirante e bandeirões para marcar a história da sua turma. Confeccionamos sob medida com nomes e números individuais!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <a
                href="https://wa.me/5518991795656?text=Ol%C3%A1!%20Sou%20da%20comiss%C3%A3o%20do%20Terceir%C3%A3o%20e%20gostaria%20de%20um%20or%C3%A7amento%20para%20a%20minha%20turma!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-8 py-4 rounded-xl shadow-xl shadow-amber-500/20 text-base transition-all hover:scale-105 active:scale-95"
              >
                <Flame className="w-5 h-5 fill-slate-950/20" />
                <span>COTAR KIT DO TERCEIRÃO NO WHATSAPP</span>
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

        {/* Combos Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full">
              PACOTES PRONTOS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
              Os Combos Favoritos das Comissões
            </h2>
            <p className="text-slate-400 text-sm">
              Monte o kit dos sonhos da sua turma com descontos progressivos por quantidade de alunos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {combos.map((combo, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  combo.popular
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-2xl shadow-amber-500/10 hover:border-amber-400'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {combo.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full shadow uppercase tracking-wide">
                    Mais Escolhido
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${combo.tagColor}`}>
                      {combo.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-white">{combo.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{combo.description}</p>

                  <div className="pt-4 border-t border-slate-800 space-y-2.5">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                      O que está incluso:
                    </span>
                    {combo.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80">
                  <a
                    href={`https://wa.me/5518991795656?text=${encodeURIComponent(
                      `Olá! Gostaria de uma cotação para o *${combo.title}* para a minha turma de Terceirão!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-xs transition-all ${
                      combo.popular
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-400/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>COTAR ESTE COMBO</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Differentials Grid */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-serif font-bold text-white">
              Por que fechar o Terceirão com a Tenório Confecções?
            </h3>
            <p className="text-xs text-slate-400">
              Cuidamos de tudo para a comissão não ter dor de cabeça com os colegas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentials.map((diff, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <div className="p-3 bg-slate-900 rounded-xl w-fit border border-slate-800">
                  {diff.icon}
                </div>
                <h4 className="font-bold text-sm text-white">{diff.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{diff.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 sm:p-12 text-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
              Ainda não tem a arte da turma? Nós criamos para você!
            </h3>
            <p className="text-sm font-medium text-slate-900 max-w-xl">
              Nossa equipe de designers desenvolve o tema, mascote e as estampas do zero para a sua sala aprovar.
            </p>
          </div>

          <a
            href="https://wa.me/5518991795656?text=Ol%C3%A1!%20Queremos%20criar%20a%20arte%20do%20nosso%20Terceir%C3%A3o%20com%20voc%C3%AAs!"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-slate-950 hover:bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 text-sm"
          >
            FALAR COM DESIGNER AGORA
          </a>
        </div>
      </div>
    </div>
  );
}
