export interface ComboItemDetail {
  name: string;
  badge?: string;
  description: string;
  specs: string[];
}

export interface ComboMaterial {
  label: string;
  value: string;
}

export interface ComboData {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  accentGradient: string;
  borderColor: string;
  glowColor: string;
  popular?: boolean;
  active?: boolean;
  image: string;
  headline: string;
  shortDesc: string;
  priceEstimate: string;
  itemsList: string[];
  detailedItems: ComboItemDetail[];
  materials: ComboMaterial[];
  bonuses: string[];
  whatsappText: string;
}

export const DEFAULT_COMBOS: ComboData[] = [
  {
    id: 'combo-gold',
    title: 'Combo Terceirão Gold',
    tag: 'Mais Pedido pelas Comissões 🏆',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentGradient: 'from-amber-400 via-amber-500 to-yellow-600',
    borderColor: 'border-amber-500/50 hover:border-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    popular: true,
    active: true,
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
    active: true,
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
    active: true,
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
    active: true,
    image: '/images/terceirao/combo-college.jpg',
    headline: 'O Visual Mais Estiloso e Exclusivo do Terceirão',
    shortDesc:
      'Inspirada nas clássicas jaquetas universitárias americanas: corpo em moletom pesado, mangas contrastantes, botões de pressão metálicos e estampa DTF Ultra HD com efeitos especiais.',
    priceEstimate: 'Edição Premium Exclusiva para Turmas',
    itemsList: [
      'Jaqueta College Varsity com botões de pressão e forro',
      'Mangas contrastantes com acabamento canelado listrado',
      'Brasão da escola e ano em DTF HD com alta definição',
      'Nome de cada formando impresso individualmente no peito',
      'Boné Snapback ou Trucker personalizado combinando com a jaqueta',
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
        name: 'Estampa DTF Ultra HD em Relevo Texturizado',
        badge: 'Acabamento Nobre',
        description:
          'Estampa de altíssima precisão com cores vivas e textura nobre, garantindo elegância sem igual.',
        specs: [
          'Brasão do colégio e monograma da turma no peito',
          'Nome do formando impresso individualmente em tipografia clássica',
          'Ano de formatura em grande destaque nas costas ou mangas',
        ],
      },
      {
        name: 'Boné Personalizado + Caneca e Tirante',
        badge: 'Kit Acessórios',
        description:
          'Complemento perfeito para dias de sol, jogos escolares e passeios da turma.',
        specs: [
          'Boné Snapback ajustável com estampa frontal em alta definição',
          'Caneca de alumínio 500ml com a mesma paleta de cores da jaqueta',
          'Tirante combinando para fechar o visual com perfeição',
        ],
      },
    ],
    materials: [
      { label: 'Corpo da Jaqueta', value: 'Moletom 3 Cabos 340g com toque aveludado' },
      { label: 'Mangas', value: 'Moletom encorpado ou tecido sintético especial' },
      { label: 'Técnica de Estampa', value: 'DTF Têxtil Ultra HD + Aplicação Térmica' },
      { label: 'Botões', value: 'Botões de pressão metálicos anti-ferrugem' },
    ],
    bonuses: [
      'Mockup digital realista da jaqueta montado antes da produção',
      'Numeração personalizada no braço',
      'Organização de entrega por lista nominal',
    ],
    whatsappText:
      'Olá Tenório Confecções! Queremos cotar o *Combo Jaqueta College Varsity 🎓* para a nossa turma de formandos!',
  },
];
