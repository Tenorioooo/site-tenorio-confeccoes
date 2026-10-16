'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Zap,
  Flame,
  ShieldCheck,
  ChevronDown,
  Layers,
  Star,
  Check,
  Eye,
  X,
  Palette,
  MessageCircle,
  Truck,
  HeartHandshake,
  Shirt,
  HelpCircle,
} from 'lucide-react';

interface ComboItemDetail {
  name: string;
  badge?: string;
  description: string;
  specs: string[];
}

interface ComboData {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  accentGradient: string;
  borderColor: string;
  glowColor: string;
  popular?: boolean;
  image: string;
  shortDesc: string;
  headline: string;
  priceEstimate: string;
  itemsList: string[];
  detailedItems: ComboItemDetail[];
  materials: { label: string; value: string }[];
  bonuses: string[];
  whatsappText: string;
}

export default function TerceiraoClient() {
  const [activeComboTab, setActiveComboTab] = useState<string>('combo-gold');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const combos: ComboData[] = [
    {
      id: 'combo-gold',
      title: 'Combo Terceirão Gold',
      tag: 'Mais Pedido pelas Comissões 🏆',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      accentGradient: 'from-amber-400 via-amber-500 to-yellow-600',
      borderColor: 'border-amber-500/50 hover:border-amber-400',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      popular: true,
      image: '/images/terceirao/combo-gold.jpg',
      headline: 'O Kit Completo & Definitivo dos Formandos',
      shortDesc:
        'O pacote dos sonhos com todas as peças que a sala precisa para marcar o ano: moletom flanelado premium, camiseta comemorativa, caneca de alumínio térmica com tirante acetinado e o bandeirão gigante oficial.',
      priceEstimate: 'Desconto escalonado por turma • A partir de 15 alunos',
      itemsList: [
        'Moletom Canguru Flanelado 320g com capuz forrado',
        'Camiseta 100% Algodão 30.1 Penteado ou Dry-Fit Formandos',
        'Caneca de Alumínio 500ml com tirante acetinado 40mm',
        'Bandeirão Gigante da Turma (Oxford/Cetim com ilhós)',
        'Nome e número individual de cada aluno sem custo extra',
        'Amostra Virtual 3D grátis para aprovação no grupo da sala',
      ],
      detailedItems: [
        {
          name: 'Moletom Canguru Flanelado 320g',
          badge: 'Peça Principal',
          description:
            'Moletom de altíssima gramatura com toque aveludado e felpa interna térmica super aconchegante. Não deforma e não encolhe após a lavagem.',
          specs: [
            'Capuz anatômico duplo com ilhós de metal e cordão grosso',
            'Bolso canguru frontal com reforço nas costuras',
            'Punhos e barra canelados com elastano para ajuste perfeito',
            'Estampa DTF Ultra HD na frente e nas costas',
          ],
        },
        {
          name: 'Camiseta Oficial do Terceirão',
          badge: 'Uso Diário & Aulas',
          description:
            'Camiseta leve, respirável e com modelagem moderna unissex ou baby look. Perfeita para usar na escola, eventos e interclasses.',
          specs: [
            'Opção em Algodão 30.1 Penteado premium ou Dry-Fit esportivo',
            'Gola pespontada com costura dupla ombro a ombro',
            'Estampa com o mascote, nome do colégio e ano de formatura',
            'Toque macio que não desbota nem craquela',
          ],
        },
        {
          name: 'Caneca de Alumínio 500ml + Tirante 40mm',
          badge: 'Eventos & Fotos',
          description:
            'Caneca em alumínio térmico com pintura especial eletrostática e tirante largo acetinado com estampa digital frente e verso.',
          specs: [
            'Capacidade de 500ml (mantém a bebida gelada por mais tempo)',
            'Tirante acetinado 40mm super macio no pescoço',
            'Mosquetão giratório reforçado em metal cromado',
            'Gravação indelével de alta durabilidade',
          ],
        },
        {
          name: 'Bandeirão Oficial da Sala (Gigante)',
          badge: 'Exclusivo do Combo Gold',
          description:
            'Bandeira personalizada em tamanho grande para fotos oficiais da turma, passeios, jogos escolares, trote e eventos de formatura.',
          specs: [
            'Tecido Oxford ou Cetim de alto brilho e definição',
            'Bordas com costura dupla reforçada',
            'Ilhós metálicos em todas as pontas para fixação e fotos',
            'Arte panorâmica desenvolvida pelos nossos designers',
          ],
        },
      ],
      materials: [
        { label: 'Tecido do Moletom', value: 'Algodão & Poliéster 320g (3 Cabos Felpado)' },
        { label: 'Tecido da Camiseta', value: 'Algodão Penteado 30.1 ou Dry-Fit Tech UV' },
        { label: 'Técnica de Estampa', value: 'DTF Têxtil Ultra HD + Sublimação Digital Total' },
        { label: 'Grade de Tamanhos', value: 'PP, P, M, G, GG, XGG e Modelos Especiais' },
      ],
      bonuses: [
        'Amostra Virtual 3D interativa antes da confecção',
        'Cada peça dobrada e etiquetada com o nome do respectivo aluno',
        'Ajustes ilimitados na arte até aprovação unânime da comissão',
        'Kit de adesivos holográficos da turma como brinde',
      ],
      whatsappText:
        'Olá Tenório Confecções! Sou da comissão de formatura e gostaria de um orçamento especial para o *Combo Terceirão Gold 🏆* para a nossa turma!',
    },
    {
      id: 'combo-essencial',
      title: 'Combo Essencial',
      tag: 'Melhor Custo-Benefício ⚡',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      accentGradient: 'from-blue-400 via-indigo-500 to-cyan-500',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      glowColor: 'rgba(59, 130, 246, 0.25)',
      popular: false,
      image: '/images/terceirao/combo-essencial.jpg',
      headline: 'A Escolha Inteligente para o Dia a Dia e Festas',
      shortDesc:
        'O kit mais dinâmico e acessível, reunindo a camiseta oficial do terceirão com o kit caneca + tirante personalizado. Perfeito para garantir que 100% da sala participe com preço justo.',
      priceEstimate: 'Excelente adesão da turma • Alta flexibilidade',
      itemsList: [
        'Camiseta Personalizada 100% Algodão 30.1 ou Dry-Fit',
        'Caneca de Alumínio 500ml com pintura personalizada',
        'Tirante Exclusivo com mosquetão em metal',
        'Nome de cada formando individual na manga ou costas',
        'Arte e tema criados do zero pelos nossos designers',
      ],
      detailedItems: [
        {
          name: 'Camiseta Oficial do Terceirão',
          badge: 'Uso Diário',
          description:
            'A camiseta que a turma veste o ano inteiro. Confeccionada com costuras reforçadas e modelagem confortável para aguentar a rotina intensa do último ano.',
          specs: [
            'Disponível em algodão nobre 30.1 penteado ou Dry-Fit ventilado',
            'Costura reforçada de ombro a ombro',
            'Acabamento premium que mantém a cor viva após inúmeras lavagens',
            'Opções tradicional unissex, baby look ou oversized',
          ],
        },
        {
          name: 'Caneca de Alumínio 500ml + Tirante',
          badge: 'Kit Formandos',
          description:
            'A clássica caneca que acompanha a sala nos churrascos, interclasses, passeios e no trote do terceirão.',
          specs: [
            'Alumínio de alta resistência que não enferruja',
            'Pintura automotiva/eletrostática resistente a arranhões',
            'Tirante acetinado 35mm personalizado com nome da sala e tema',
            'Mosquetão metálico fácil de engatar e desengatar',
          ],
        },
        {
          name: 'Personalização Nominal Inclusa',
          badge: 'Sem Taxa Extra',
          description:
            'Cada formando tem seu próprio nome ou apelido gravado na camiseta, facilitando a identificação e criando uma memória afetiva para guardar.',
          specs: [
            'Sem limite de caracteres razoável',
            'Tipografia padronizada em alta definição',
            'Etiquetagem externa para entrega fácil sem desorganização',
          ],
        },
      ],
      materials: [
        { label: 'Camiseta', value: '100% Algodão Penteado 30.1 (Toque Macio) ou Dry-Fit' },
        { label: 'Caneca', value: 'Alumínio de alta pureza com pintura eletrostática' },
        { label: 'Tirante', value: 'Fita de Poliéster Acetinada 35mm / 40mm com mosquetão' },
        { label: 'Personalização', value: 'DTF Têxtil HD + Silk Screen / Sublimação Total' },
      ],
      bonuses: [
        'Arte exclusiva desenhada sem custos extras',
        'Separação individual de pedidos por formando',
        'Opção de adicionar boné ou ecobag com preço promocional',
      ],
      whatsappText:
        'Olá Tenório Confecções! Gostaria de uma cotação para o *Combo Essencial ⚡ (Camiseta + Caneca + Tirante)* para a turma de Terceirão!',
    },
    {
      id: 'combo-moletom',
      title: 'Combo Inverno & Moletom',
      tag: 'Alta Gramatura & Conforto ❄️',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      accentGradient: 'from-purple-400 via-violet-500 to-indigo-600',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      glowColor: 'rgba(168, 85, 247, 0.25)',
      popular: false,
      image: '/images/terceirao/combo-moletom.jpg',
      headline: 'O Moletom dos Sonhos Que Dura Uma Vida',
      shortDesc:
        'Para turmas que priorizam o casaco pesado, quentinho e estiloso. Gramatura alta de 320g com felpa ultra macia e estampa com todos os nomes dos colegas de sala nas costas.',
      priceEstimate: 'O item mais cobiçado de todo Terceirão',
      itemsList: [
        'Moletom Canguru 3 Cabos Super Pesado 320g/m²',
        'Interior todo flanelado (aquecimento térmico superior)',
        'Capuz anatômico com ilhós metálicos e cordão trançado grosso',
        'Estampa com a lista completa dos alunos nas costas',
        'Nome individual de cada aluno no punho ou manga',
      ],
      detailedItems: [
        {
          name: 'Moletom Canguru 3 Cabos Felpado',
          badge: 'Super Pesado 320g',
          description:
            'Tecido encorpado que aquece de verdade no outono e inverno, com toque super gostoso na pele e caimento moderno estruturado.',
          specs: [
            'Composição ideal de 50% Algodão e 50% Poliéster (não encolhe)',
            'Tratamento antipilling para evitar bolinhas no uso contínuo',
            'Bolso canguru amplo e reforçado nas extremidades',
            'Ribana com elastano nos punhos e na barra para ajuste firme',
          ],
        },
        {
          name: 'Estampa DTF Têxtil Ultra HD',
          badge: 'Resistência Máxima',
          description:
            'Impressão com definição fotográfica de cores e contornos, permitindo gradientes, ilustrações complexas e letras nítidas até nos nomes menores.',
          specs: [
            'Frente: Brasão ou arte exclusiva do Terceirão',
            'Costas: Numeral comemorativo (ex: 26) preenchido com nomes da turma',
            'Manga: Nome ou apelido individual de cada formando',
            'Resistente a dezenas de lavagens em máquina sem descascar',
          ],
        },
        {
          name: 'Capuz Forrado com Acabamento Premium',
          badge: 'Conforto',
          description:
            'Capuz forrado que mantém a estrutura sem ficar caído, com ilhós de ferro anti-ferrugem e cordão de algodão encorpado.',
          specs: [
            'Forro interno no mesmo tom ou em cor contrastante',
            'Cordão com ponteira plástica ou metálica',
            'Costuras duplas no pescoço e ombros para maior durabilidade',
          ],
        },
      ],
      materials: [
        { label: 'Gramatura', value: '320g/m² (Moletom 3 Cabos Pesado)' },
        { label: 'Composição', value: '50% Algodão Premium / 50% Poliéster Felpado' },
        { label: 'Impressão', value: 'DTF Têxtil Ultra HD + Aplicação Térmica Industrial' },
        { label: 'Cores Disponíveis', value: 'Preto, Chumbo, Marinho, Bordô, Off-White, Verde, etc.' },
      ],
      bonuses: [
        'Arte das costas com a lista de nomes diagramada profissionalmente',
        'Amostra virtual 3D para você ver como fica antes de produzir',
        'Tabela de tamanhos precisa para os alunos experimentarem',
      ],
      whatsappText:
        'Olá Tenório Confecções! Gostaria de um orçamento para o *Combo Inverno & Moletom Flanelado ❄️* para o nosso Terceirão!',
    },
    {
      id: 'combo-college',
      title: 'Combo Jaqueta College Varsity',
      tag: 'Estilo Colegial Americano 🎓',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      accentGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      popular: false,
      image: '/images/terceirao/combo-college.jpg',
      headline: 'O Visual Mais Estiloso e Exclusivo do Terceirão',
      shortDesc:
        'Inspirada nas clássicas jaquetas universitárias americanas: corpo em moletom pesado, mangas contrastantes, botões de pressão metálicos e brasão bordado em relevo no peito.',
      priceEstimate: 'Edição Premium Exclusiva para Turmas',
      itemsList: [
        'Jaqueta College Varsity com botões de pressão e forro',
        'Mangas contrastantes com acabamento canelado listrado',
        'Brasão da escola e ano bordados em alta definição',
        'Nome de cada formando bordado individualmente no peito',
        'Boné Snapback ou Trucker bordado combinando com a jaqueta',
        'Caneca de alumínio personalizada com a identidade da jaqueta',
      ],
      detailedItems: [
        {
          name: 'Jaqueta College Americana',
          badge: 'Edição Especial',
          description:
            'A peça mais icônica que sua turma pode escolher. Dá uma presença espetacular nas fotos de formatura e na entrada do colégio.',
          specs: [
            'Corpo em moletom pesado e mangas em tom contrastante',
            'Fechamento frontal por botões de pressão reforçados',
            'Gola, punhos e barra em malha canelada com listras universitárias',
            'Bolsos laterais embutidos com debrum contrastante',
          ],
        },
        {
          name: 'Bordado Computadorizado em Relevo',
          badge: 'Acabamento Nobre',
          description:
            'Bordados de altíssima precisão com fios especiais e acabamento em relevo, garantindo elegância sem igual.',
          specs: [
            'Brasão do colégio e monograma da turma bordados no peito',
            'Nome do formando bordado individualmente em tipografia clássica',
            'Ano de formatura em aplique ou bordado nas mangas ou costas',
          ],
        },
        {
          name: 'Boné Bordado + Caneca e Tirante',
          badge: 'Kit Acessórios',
          description:
            'Complemento perfeito para dias de sol, jogos escolares e passeios da turma.',
          specs: [
            'Boné Snapback ajustável com bordado 3D na frente',
            'Caneca de alumínio 500ml com a mesma paleta de cores da jaqueta',
            'Tirante combinando para fechar o visual com perfeição',
          ],
        },
      ],
      materials: [
        { label: 'Corpo da Jaqueta', value: 'Moletom 3 Cabos 340g com toque aveludado' },
        { label: 'Mangas', value: 'Moletom encorpado ou couro ecológico sintético' },
        { label: 'Bordado', value: 'Bordado computadorizado com linhas de alta tenacidade' },
        { label: 'Botões', value: 'Botões de pressão metálicos anti-ferrugem' },
      ],
      bonuses: [
        'Mockup digital realista da jaqueta montado antes da produção',
        'Numeração personalizada bordada no braço',
        'Organização de entrega por lista nominal',
      ],
      whatsappText:
        'Olá Tenório Confecções! Queremos cotar o *Combo Jaqueta College Varsity 🎓* para a nossa turma de formandos!',
    },
  ];

  const differentials = [
    {
      icon: <Users className="w-6 h-6 text-amber-400" />,
      title: 'Zero Confusão: Cada Peça com Seu Dono',
      description:
        'Entregamos tudo dobrado, ensacado e etiquetado com o nome e tamanho exato de cada aluno. A comissão não perde tempo separando pilhas de roupas!',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-blue-400" />,
      title: 'Amostra Virtual 3D Realista Grátis',
      description:
        'Antes de cortar qualquer tecido, montamos a prévia digital do moletom, camiseta e caneca para você mandar no grupo do WhatsApp e aprovar com a sala.',
    },
    {
      icon: <Palette className="w-6 h-6 text-emerald-400" />,
      title: 'Designers Para Criar a Arte do Zero',
      description:
        'A sala ainda não tem tema nem mascote? Não se preocupe! Nossos designers desenvolvem propostas exclusivas sem cobrar taxa de criação.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
      title: 'Pagamento Facilitado Para a Turma',
      description:
        'Condições especiais para comissões de formatura, com cronograma programado e opções de parcelamento facilitado para os alunos e pais.',
    },
    {
      icon: <Award className="w-6 h-6 text-yellow-400" />,
      title: 'Estampa DTF HD Que Não Descasca',
      description:
        'Usamos tecnologia têxtil de ponta com tintas originais curadas termicamente. As estampas aguentam o ano letivo inteiro e ficam para sempre como recordação.',
    },
    {
      icon: <Truck className="w-6 h-6 text-cyan-400" />,
      title: 'Entrega Pontual Programada',
      description:
        'Alinhamos o prazo com a data do trote ou da foto oficial da turma. Compromisso rigoroso de entrega para sua comissão ficar 100% tranquila.',
    },
  ];

  const faqs = [
    {
      q: 'Qual é a quantidade mínima de peças para fazer o pedido de Terceirão?',
      a: 'A partir de 15 alunos já conseguimos condições de atacado para a turma inteira! Quanto maior a quantidade de alunos aderindo, maior é o desconto progressivo que conseguimos aplicar.',
    },
    {
      q: 'Cada aluno pode ter seu próprio nome e número nas costas ou na manga?',
      a: 'Sim, com certeza! Nos nossos combos para terceirão, a personalização nominal e numérica individual de cada formando já está prevista, sem cobranças escondidas.',
    },
    {
      q: 'Como funciona se a nossa turma ainda não tiver a arte ou mascote definido?',
      a: 'Nossa equipe de designers auxilia a sua comissão! Você pode mandar referências, rascunhos, ideias ou fotos que vocês viram na internet, e nós desenvolvemos a estampa oficial vetorizada para aprovação no grupo.',
    },
    {
      q: 'Como fazemos para coletar os tamanhos de todo mundo da sala?',
      a: 'Nós enviamos uma tabela pronta e uma fita métrica digital com guia de medidas (do PP ao XGG e tamanhos especiais). Assim, cada formando consegue medir uma peça sua e escolher o tamanho certo sem risco de errar.',
    },
    {
      q: 'Como são as formas de pagamento para turmas de formandos?',
      a: 'Trabalhamos com condições pensadas para comissões de formatura: entrada para iniciar a compra e o saldo programado até a entrega, além de opções de cartão de crédito e PIX para atender a realidade dos alunos.',
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-950 text-white min-h-screen space-y-16 sm:space-y-24 selection:bg-amber-500 selection:text-slate-950">
      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 bg-slate-950/80 hover:bg-slate-900 text-white p-2.5 rounded-full border border-slate-700 transition-colors"
                title="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="relative w-full h-[60vh] sm:h-[75vh]">
                <Image
                  src={selectedPhoto}
                  alt="Foto expandida do Terceirão"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* ================= HERO SECTION ================= */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-[#1b233a] via-[#131a2c] to-[#0c101d] shadow-2xl">
          {/* Ambient decorative lights */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

          <div className="relative z-10 p-6 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Text & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/10"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>KITS OFICIAIS DE TERCEIRÃO &amp; FORMANDOS</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-[1.12]"
              >
                O último ano da sua turma merece uma{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 underline decoration-amber-400/30 decoration-wavy decoration-2">
                  marca inesquecível.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Moletons canguru super pesados, camisetas premium de algodão penteado, canecas térmicas com tirante e bandeirões.
                Confeccionamos sob medida com <strong className="text-white font-semibold">nomes e números individuais</strong> para cada aluno, sem dor de cabeça para a comissão!
              </motion.p>

              {/* Highlights badge pills */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-wrap justify-center lg:justify-start gap-2.5 pt-1"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Amostra Virtual 3D Grátis
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Peças Etiquetadas por Aluno
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-blue-400" /> Pagamento Facilitado
                </span>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3"
              >
                <a
                  href="https://wa.me/5518991795656?text=Ol%C3%A1!%20Sou%20da%20comiss%C3%A3o%20do%20Terceir%C3%A3o%20e%20gostaria%20de%20um%20or%C3%A7amento%20para%20a%20minha%20turma!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black px-8 py-4 rounded-xl shadow-xl shadow-amber-500/25 text-base transition-all hover:scale-105 active:scale-95 group"
                >
                  <Flame className="w-5 h-5 fill-slate-950/20 text-slate-950" />
                  <span>COTAR PELO WHATSAPP</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                <button
                  onClick={() => scrollToSection('combos-showcase')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-white font-bold px-6 py-4 rounded-xl border border-slate-700 hover:border-slate-600 text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>CONHECER OS 4 COMBOS</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </motion.div>

              {/* Social Proof Stats */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-serif">+150</div>
                  <div className="text-xs text-slate-400">Turmas Vestidas</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-serif">100%</div>
                  <div className="text-xs text-slate-400">Personalizado</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-serif">5.0 ★</div>
                  <div className="text-xs text-slate-400">Avaliação Média</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div
                className="relative rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl shadow-amber-500/10 group cursor-pointer"
                onClick={() => setSelectedPhoto('/images/terceirao/hero-students.jpg')}
              >
                <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full">
                  <Image
                    src="/images/terceirao/hero-students.jpg"
                    alt="Turma de Terceirão com moletons personalizados da Tenório Confecções"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>

                {/* Floating badge top-left */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Fotos Reais de Formandos</span>
                </div>

                {/* Floating overlay info bottom */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3.5 rounded-xl text-left space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Shirt className="w-4 h-4 text-amber-400" /> Moletom + Caneca + Tirante
                    </span>
                    <span className="text-[11px] text-amber-400 font-extrabold">CLIQUE P/ AMPLIAR</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Cada aluno com seu nome, número comemorativo e detalhes exclusivos!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ================= QUICK JUMP STICKY SELECTOR BAR ================= */}
        <div id="combos-showcase" className="sticky top-20 z-30 pt-2 pb-2">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="hidden md:flex items-center gap-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Navegar pelos Combos:</span>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {combos.map((combo) => (
                <button
                  key={combo.id}
                  onClick={() => {
                    setActiveComboTab(combo.id);
                    scrollToSection(combo.id);
                  }}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                    activeComboTab === combo.id
                      ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-[1.02]'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <span>{combo.title}</span>
                </button>
              ))}
            </div>

            <a
              href="https://wa.me/5518991795656?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20os%20combos%20do%20Terceir%C3%A3o!"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Dúvidas no WhatsApp</span>
            </a>
          </div>
        </div>

        {/* ================= DEDICATED SECTIONS FOR EACH COMBO ================= */}
        <div className="space-y-24">
          {combos.map((combo, comboIdx) => {
            const isEven = comboIdx % 2 === 0;

            return (
              <section
                key={combo.id}
                id={combo.id}
                className={`scroll-mt-36 rounded-3xl p-6 sm:p-10 lg:p-12 border transition-all duration-300 relative overflow-hidden ${
                  combo.popular
                    ? 'bg-gradient-to-b from-slate-900 via-[#151c2e] to-slate-950 border-amber-400/60 shadow-2xl shadow-amber-500/10'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Glow Backdrop */}
                <div
                  className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-40"
                  style={{ background: combo.glowColor }}
                />

                {/* Popular Ribbon if applicable */}
                {combo.popular && (
                  <div className="absolute top-0 right-8 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-b-xl shadow-lg uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-slate-950" />
                    <span>O MAIS ESCOLHIDO DAS SALAS</span>
                  </div>
                )}

                <div className="space-y-10 relative z-10">
                  {/* Top Header of the Combo Section */}
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-3 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${combo.tagColor}`}>
                          {combo.tag}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {combo.priceEstimate}
                        </span>
                      </div>

                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white tracking-tight">
                        {combo.title}
                      </h2>
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        {combo.shortDesc}
                      </p>
                    </div>

                    {/* Quick WhatsApp CTA Button */}
                    <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                      <a
                        href={`https://wa.me/5518991795656?text=${encodeURIComponent(combo.whatsappText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl ${
                          combo.popular
                            ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/20'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/20'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>COTAR ESTE COMBO NO WHATSAPP</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Main Combo Body: Visual Spotlight & Technical Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Visual Card (Alternates left/right or stays 5 cols) */}
                    <div className={`lg:col-span-5 space-y-4 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                      <div
                        className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group cursor-pointer shadow-2xl"
                        onClick={() => setSelectedPhoto(combo.image)}
                      >
                        <div className="relative aspect-[4/3] w-full">
                          <Image
                            src={combo.image}
                            alt={combo.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 1024px) 100vw, 500px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        </div>

                        {/* Zoom button hint */}
                        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg group-hover:border-amber-400 transition-colors">
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ver em Alta Resolução</span>
                        </div>
                      </div>

                      {/* Technical Specs Mini-Table */}
                      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Shirt className="w-4 h-4 text-amber-400" />
                          <span>Ficha Técnica dos Materiais</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 text-xs">
                          {combo.materials.map((mat, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-1.5 gap-1">
                              <span className="text-slate-400">{mat.label}:</span>
                              <span className="text-slate-200 font-semibold">{mat.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Included Commission Bonuses */}
                      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-5 space-y-2.5">
                        <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Bônus Inclusos Para a Turma</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {combo.bonuses.map((bonus, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{bonus}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Detailed Items Breakdown (7 cols) */}
                    <div className={`lg:col-span-7 space-y-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-1">
                          DETALHAMENTO ITEM POR ITEM
                        </span>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                          Tudo o que vem no {combo.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Cada peça é confeccionada com matérias-primas selecionadas e acabamento profissional de alfaiataria esportiva.
                        </p>
                      </div>

                      {/* Cards for each item in the combo */}
                      <div className="grid grid-cols-1 gap-4">
                        {combo.detailedItems.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition-colors"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-bold text-base text-white flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 inline-flex items-center justify-center text-xs font-black">
                                  {itemIdx + 1}
                                </span>
                                {item.name}
                              </h4>
                              {item.badge && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                                  {item.badge}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {item.description}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                              {item.specs.map((spec, sIdx) => (
                                <div key={sIdx} className="flex items-start gap-2 text-[11px] text-slate-400">
                                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{spec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Action inside the combo section */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                        <div className="text-xs text-slate-300 text-center sm:text-left">
                          <span className="font-bold text-white block">Quer adicionar ou remover algum item deste combo?</span>
                          <span>Você pode customizar o pacote exatamente como a sua sala preferir!</span>
                        </div>
                        <a
                          href={`https://wa.me/5518991795656?text=${encodeURIComponent(
                            `Olá! Gostaria de personalizar o *${combo.title}* para a minha turma de Terceirão. Podemos montar uma versão sob medida?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
                        >
                          <span>Personalizar Pacote</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* ================= QUALITY & CRAFTSMANSHIP DEEP-DIVE ================= */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#141b2c] to-slate-950 p-8 sm:p-14 space-y-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Image showcasing macro print and embroidery */}
            <div className="lg:col-span-5 space-y-4">
              <div
                className="relative rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl group cursor-pointer"
                onClick={() => setSelectedPhoto('/images/terceirao/detalhes-estampa.jpg')}
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/terceirao/detalhes-estampa.jpg"
                    alt="Detalhes da estampa DTF HD e bordado com nomes individuais para terceirão"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                </div>

                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300">Macro Foto Real: Estampa &amp; Bordado</span>
                    <span className="text-[10px] text-slate-400">AMPLIAR</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Nomes de todos os formandos com definição cirúrgica e fios dourados no brasão.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Explanatory features */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                  ALTO PADRÃO DE ACABAMENTO
                </span>
                <h3 className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
                  Por que a Tenório Confecções é a favorita das turmas?
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Sabemos que o uniforme do Terceirão não é só uma roupa de ir para a escola — é o símbolo do encerramento de um ciclo marcante que você vai guardar no armário para a vida toda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Estampa DTF HD Ultra Durável</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Não descasca e não racha. As cores mantêm a vivacidade mesmo após dezenas de lavagens no dia a dia.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Nomes Individuais Sem Erro</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Conferência dupla por lista digital. Cada peça vai etiquetada com o nome e tamanho correto do formando.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Moletom 3 Cabos Encorpado</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gramatura pesada 320g com interior felpudo quentinho e capuz duplo estruturado com cordão grosso.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>Amostra 3D Antes de Produzir</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Montamos o visual da peça em 3D para você apresentar no grupo da turma e aprovar antes de cortar o tecido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= STEP-BY-STEP FOR THE COMMISSION ================= */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              PASSO A PASSO SIMPLES
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Como funciona o pedido para a sua turma?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Desenhamos um fluxo 100% descomplicado para a comissão de formatura não ter estresse com os colegas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <span className="text-3xl font-serif font-black text-amber-400/40">01</span>
              <h4 className="font-bold text-sm text-white">Escolha do Combo</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Apresente os combos para a sala e nos chame no WhatsApp informando a quantidade estimada de alunos.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <span className="text-3xl font-serif font-black text-blue-400/40">02</span>
              <h4 className="font-bold text-sm text-white">Criação da Arte &amp; 3D</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nossos designers criam a estampa oficial com o mascote, temas e cores da sala até a turma aprovar 100%.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <span className="text-3xl font-serif font-black text-emerald-400/40">03</span>
              <h4 className="font-bold text-sm text-white">Lista de Nomes &amp; Medidas</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enviamos nossa tabela prática e guia de medidas para a comissão preencher o nome e tamanho de cada formando.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <span className="text-3xl font-serif font-black text-purple-400/40">04</span>
              <h4 className="font-bold text-sm text-white">Entrega Etiquetada</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Produzimos com rigoroso controle de qualidade e entregamos tudo embalado com o nome do aluno na etiqueta.
              </p>
            </div>
          </div>
        </div>

        {/* ================= FAQ ACCORDION ================= */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              TIRE SUAS DÚVIDAS
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Perguntas Frequentes das Comissões
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= BIG FINAL CTA BANNER ================= */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-3xl p-8 sm:p-14 text-slate-950 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-950/15 text-slate-950 font-black text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4" /> VAGAS DE PRODUÇÃO LIMITADAS POR MÊS
              </span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-tight">
                Garanta o kit da sua turma com condições exclusivas!
              </h3>
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                Converse agora com nossa equipe de atendimento para formandos, solicite sua Amostra 3D e receba o orçamento detalhado em poucos minutos.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
              <a
                href="https://wa.me/5518991795656?text=Ol%C3%A1!%20Sou%20da%20comiss%C3%A3o%20de%20Terceir%C3%A3o%20e%20gostaria%20de%20um%20or%C3%A7amento%20e%20amostra%203D%20para%20a%20minha%20turma!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                <MessageCircle className="w-5 h-5 text-amber-400" />
                <span>CHAMAR NO WHATSAPP AGORA</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <Link
                href="/orcamento"
                className="inline-flex items-center justify-center gap-2 bg-white/30 hover:bg-white/40 text-slate-950 font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 border border-slate-950/20"
              >
                <span>SIMULAR ORÇAMENTO ONLINE</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
