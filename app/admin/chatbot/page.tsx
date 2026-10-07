'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  QrCode,
  RefreshCw,
  Power,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  DollarSign,
  Package,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ExternalLink,
  Search,
  Filter,
  Users,
  Bell,
  Smartphone,
  Send,
  Check,
  ShieldAlert,
  HelpCircle,
  Megaphone,
  Sparkles,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingTierItem {
  minQty: number;
  maxQty?: number | null;
  unitPrice: number;
}

export type TipoAcaoFluxo = 'QUESTIONARIO_ORCAMENTO' | 'TRANSFERIR_HUMANO' | 'RESPOSTA_DIRETA';

export interface FluxoItem {
  id: string;
  nome: string;
  ativo: boolean;
  tipoAcao: TipoAcaoFluxo;
  gatilhos: string[];
  origemLead?: string;
  mensagem: string;
  descricao?: string;
  criadoEm?: string;
}

interface ProdutoTabela {
  nome: string;
  categoria?: string;
  termos?: string[];
  termosIdentificacao?: string[];
  precoBase?: number;
  precoBaseUnitario?: number;
  prazoConfeccao?: string;
  quantidadeMinima?: number | null;
  pricingTiers?: PricingTierItem[];
  gradeTamanhos?: string[];
  coresDisponiveis?: string[];
  permiteDescontoProgressivo?: boolean;
  variacoes?: Array<{ nome?: string; termo?: string; termos?: string[]; preco: number; pricingTiers?: PricingTierItem[] }>;
  observacoes?: string;
}

interface TabelaPrecos {
  produtos: ProdutoTabela[];
  regrasDesconto?: { quantidadeMinima: number; percentualDesconto: number }[];
  termosGlobaisIsencaoDesconto?: string[];
}

interface ClienteAguardando {
  id: string;
  nome: string;
  telefone: string;
  motivo: string;
  data: string;
  status: 'AGUARDANDO' | 'ATENDIDO';
  concluidoEm?: string;
}

interface StatusResponse {
  status: 'INITIALIZING' | 'QR_READY' | 'CONNECTED' | 'DISCONNECTED';
  qrCode: string | null;
  info: { phone: string | null; name: string };
  stats: {
    totalMensagens: number;
    totalOrcamentos: number;
    totalProdutos: number;
    totalAguardandoHumano: number;
    iniciadoEm: string;
  };
  ultimosOrcamentos: Array<{
    codigo: string;
    cliente: string;
    total: number;
    pecas: number;
    data: string;
  }>;
  clientesAguardando: ClienteAguardando[];
  notificacoes?: {
    adminPhone: string;
    notificarAtendimentoHumano: boolean;
    notificarNovoOrcamento: boolean;
    notificarPushWeb: boolean;
    siteApiUrl: string;
    fluxos?: FluxoItem[];
  };
}

export default function ChatbotAdminTab() {
  const [activeTab, setActiveTab] = useState<'status' | 'anuncio' | 'produtos' | 'humano' | 'notificacoes'>('status');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [data, setData] = useState<StatusResponse | null>(null);
  const [tabela, setTabela] = useState<TabelaPrecos | null>(null);
  const [botUrl, setBotUrl] = useState('http://localhost:3001');

  // Filtros de atendimento humano
  const [buscaHumano, setBuscaHumano] = useState('');
  const [filtroStatusHumano, setFiltroStatusHumano] = useState<'TODOS' | 'AGUARDANDO' | 'ATENDIDO'>('AGUARDANDO');

  // Configurações de Notificação
  const [adminPhone, setAdminPhone] = useState('');
  const [notifHumano, setNotifHumano] = useState(true);
  const [notifOrcamento, setNotifOrcamento] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ==========================================
  // ESTADOS DO GERENCIADOR DE MÚLTIPLOS FLUXOS
  // ==========================================
  const [fluxos, setFluxos] = useState<FluxoItem[]>([
    {
      id: 'fluxo-esportivo-ads',
      nome: 'Campanha Meta Ads - Camisetas Esportivas / Interclasse',
      ativo: true,
      tipoAcao: 'QUESTIONARIO_ORCAMENTO',
      gatilhos: [
        'vi o anuncio',
        'vi o anúncio',
        'vim pelo anuncio',
        'vim pelo anúncio',
        'anuncio do facebook',
        'anúncio do facebook',
        'anuncio do instagram',
        'anúncio do instagram',
        'anúncio',
        'anuncio',
        'interclasse',
        'dry-fit',
        'dry fit',
        'dryfit',
        'esportivo',
        'camisa de time'
      ],
      origemLead: 'Meta Ads (Esportivo / Interclasse)',
      mensagem: `👋 *{saudacao}! Que massa ter você por aqui!* 🏆⚽👕\n\nBora montar o uniforme/camisetas personalizadas do seu time ou evento!\n\n📋 *Para eu calcular o valor certinho para você agora mesmo, me conta rapidinho:* \n\n1️⃣ *Qual modelo você procura?* (Ex: Camiseta Dry-Fit manga curta ou Conjunto Camisa + Calção)\n2️⃣ *Quantas peças você precisa aproximadamente?* (Ex: 10, 20, 50 peças)\n3️⃣ *Para qual time ou evento?* (Ex: Interclasse, Time de Futebol/Vôlei, Corrida, Empresa, Academia)\n4️⃣ *Já tem a arte ou logotipo?* (Sim / Não / Pode mandar a foto aqui)\n5️⃣ *Vai querer Nome e Número individual em cada peça?* (Sim / Não)\n\n✍️ *Pode responder tudo junto em uma mensagem* que já calculamos sua cotação na hora! 🚀\n\n_Se preferir ver outras opções, digite *menu* a qualquer momento._`
    },
    {
      id: 'fluxo-empresas',
      nome: 'Campanha Corporativa - Uniformes para Empresas',
      ativo: true,
      tipoAcao: 'QUESTIONARIO_ORCAMENTO',
      gatilhos: [
        'uniforme para empresa',
        'uniformes corporativos',
        'uniforme de trabalho',
        'polo bordada',
        'camisa polo empresa',
        'uniforme empresarial'
      ],
      origemLead: 'Campanha Empresas',
      mensagem: `👋 *{saudacao}! Muito bem-vindo(a) à Tenório Confecções!* 👔🏢\n\nCuidamos da identidade visual e uniformização da sua empresa com alta durabilidade e acabamento profissional.\n\n📋 *Para prepararmos sua proposta corporativa sob medida:*\n\n1️⃣ *Quais modelos você procura?* (Ex: Camisas Polo, Camisetas Algodão, Aventais, Jalecos)\n2️⃣ *Quantidade estimada de peças?* (Ex: 15, 30, 100 peças)\n3️⃣ *Sua empresa já possui o logotipo vetorizado ou em foto?*\n4️⃣ *Qual a sua cidade / estado?*\n\n✍️ *Pode responder nesta mesma mensagem* que nossa equipe/sistema já monta seu orçamento!`
    },
    {
      id: 'fluxo-formandos',
      nome: 'Campanha Estudantil - Formandos / Terceirão',
      ativo: false,
      tipoAcao: 'QUESTIONARIO_ORCAMENTO',
      gatilhos: [
        'terceirão',
        'terceirao',
        'camiseta de formandos',
        'camisa de formando',
        'nono ano',
        'uniforme escolar',
        'turma da faculdade'
      ],
      origemLead: 'Campanha Formandos / Terceirão',
      mensagem: `🎓 *{saudacao}! Parabéns pela formatura e reta final de estudos!* 🎉👕\n\nVamos produzir as camisetas/moletons da sua turma com o melhor acabamento e preço especial de atacado!\n\n📋 *Me conta rapidinho:*\n1️⃣ *Quantas peças/alunos são na turma?*\n2️⃣ *Qual o modelo preferido?* (Camiseta Tradicional 100% Algodão, Raglan, Dry-Fit ou Moletom)\n3️⃣ *Já têm o desenho/tema da turma ou querem auxílio para criar?*\n\n✍️ *Envie sua resposta aqui* que já passamos os valores especiais com desconto progressivo para a turma toda!`
    }
  ]);

  // Filtro e Busca de Fluxos
  const [buscaFluxo, setBuscaFluxo] = useState('');
  const [filtroStatusFluxo, setFiltroStatusFluxo] = useState<'TODOS' | 'ATIVOS' | 'INATIVOS'>('TODOS');
  const [simuladorTexto, setSimuladorTexto] = useState('');

  // Modal de Criação / Edição de Fluxo
  const [modalFluxoAberto, setModalFluxoAberto] = useState(false);
  const [editingFluxoId, setEditingFluxoId] = useState<string | null>(null);
  const [fluxoForm, setFluxoForm] = useState<FluxoItem>({
    id: '',
    nome: '',
    ativo: true,
    tipoAcao: 'QUESTIONARIO_ORCAMENTO',
    gatilhos: [],
    origemLead: '',
    mensagem: '',
    descricao: ''
  });
  const [novoGatilhoModal, setNovoGatilhoModal] = useState('');

  // Estados de edição de produto
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [novoProdutoModal, setNovoProdutoModal] = useState(false);
  const [produtoForm, setProdutoForm] = useState<ProdutoTabela>({
    nome: '',
    categoria: 'Geral',
    termosIdentificacao: [],
    precoBaseUnitario: 0,
    prazoConfeccao: '15 a 20 dias úteis',
    quantidadeMinima: null,
    pricingTiers: [],
    gradeTamanhos: ['P', 'M', 'G', 'GG'],
    coresDisponiveis: ['Branco', 'Preto'],
    permiteDescontoProgressivo: true,
    variacoes: [],
    observacoes: ''
  });

  // Campos auxiliares para inputs tipo tags / texto
  const [termosInput, setTermosInput] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [coresInput, setCoresInput] = useState('');
  const [variacoesInput, setVariacoesInput] = useState('');
  const [pricingTiersInput, setPricingTiersInput] = useState('');

  const configLoadedRef = React.useRef(false);

  const carregarStatus = useCallback(async () => {
    try {
      // 1. Tenta carregar via proxy Next.js (funciona em HTTPS, Vercel e Localhost sem problemas de CORS ou Mixed Content)
      let res = await fetch('/api/admin/chatbot/status', { cache: 'no-store' });
      if (res.ok) {
        const json: StatusResponse = await res.json();
        if (json && json.status && json.status !== 'DISCONNECTED') {
          setData(json);
          return;
        } else if (json && json.status) {
          setData(json);
        }
      }

      // 2. Fallback: tenta carregar direto do localhost:3001
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        try {
          const directRes = await fetch(`${botUrl}/api/status`, { cache: 'no-store' });
          if (directRes.ok) {
            const directJson: StatusResponse = await directRes.json();
            setData(directJson);
            return;
          }
        } catch (e) {}
      }
    } catch (e: any) {
      // Se falhar a conexão, mantém estado anterior
    } finally {
      setLoading(false);
    }
  }, [botUrl]);

  const carregarTabela = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/chatbot/tabela', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.tabela) {
          setTabela(json.tabela);
          return;
        }
      }

      // Fallback direto
      const directRes = await fetch(`${botUrl}/api/tabela`, { cache: 'no-store' });
      if (directRes.ok) {
        const directJson = await directRes.json();
        setTabela(directJson.tabela);
      }
    } catch (e) {}
  }, [botUrl]);

  // Carregar lista de múltiplos fluxos do robô ou da base
  const carregarFluxos = useCallback(async () => {
    try {
      const resSite = await fetch('/api/admin/chatbot/config', { cache: 'no-store' });
      if (resSite.ok) {
        const jsonSite = await resSite.json();
        if (jsonSite?.config?.fluxos && Array.isArray(jsonSite.config.fluxos) && jsonSite.config.fluxos.length > 0) {
          setFluxos(jsonSite.config.fluxos);
          return;
        }
      }
    } catch (e) {}

    try {
      const res = await fetch(`${botUrl}/api/config/fluxos`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.fluxos) && json.fluxos.length > 0) {
          setFluxos(json.fluxos);
        }
      }
    } catch (e) {}
  }, [botUrl]);

  // Carregar configurações de notificação do site
  const carregarConfiguracoes = useCallback(async () => {
    if (configLoadedRef.current) return;
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.chatbot_notification_config) {
          const cfg = typeof data.chatbot_notification_config === 'string'
            ? JSON.parse(data.chatbot_notification_config)
            : data.chatbot_notification_config;
          if (cfg.adminPhone) setAdminPhone(cfg.adminPhone);
          setNotifHumano(cfg.notificarAtendimentoHumano !== false);
          setNotifOrcamento(cfg.notificarNovoOrcamento !== false);
          setNotifPush(cfg.notificarPushWeb !== false);
          if (Array.isArray(cfg.fluxos) && cfg.fluxos.length > 0) {
            setFluxos(cfg.fluxos);
          }
        } else if (data.chatbot_admin_phone) {
          setAdminPhone(data.chatbot_admin_phone);
        }
        configLoadedRef.current = true;
      }
    } catch (e) {}
  }, []);

  // Hook principal de inicialização e polling contínuo (a cada 3.5s)
  useEffect(() => {
    carregarConfiguracoes();
    carregarFluxos();
    carregarTabela();
    carregarStatus();

    const interval = setInterval(() => {
      carregarStatus();
    }, 3500);

    return () => clearInterval(interval);
  }, [carregarConfiguracoes, carregarFluxos, carregarTabela, carregarStatus]);

  // Salvar Lista Completa de Fluxos (No Robô e no Banco de Dados)
  const salvarTodosFluxos = async (novaListaFluxos?: FluxoItem[]) => {
    const listaParaSalvar = novaListaFluxos || fluxos;
    try {
      setActionLoading(true);

      // 1. Salva no Robô (Porta 3001)
      try {
        await fetch(`${botUrl}/api/config/fluxos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fluxos: listaParaSalvar })
        });
      } catch (e) {}

      // 2. Salva no Banco de Dados / API do Painel
      await fetch('/api/admin/chatbot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPhone,
          notificarAtendimentoHumano: notifHumano,
          notificarNovoOrcamento: notifOrcamento,
          notificarPushWeb: notifPush,
          fluxos: listaParaSalvar
        })
      });

      setFluxos(listaParaSalvar);
      toast.success('Todos os fluxos foram salvos e sincronizados com sucesso!');
    } catch (e: any) {
      toast.error('Erro ao sincronizar fluxos: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Alternar Status Ativo / Inativo de um Fluxo com 1 Clique
  const toggleFluxoAtivo = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const listaAtualizada = fluxos.map((f) => (f.id === id ? { ...f, ativo: !f.ativo } : f));
    const fluxoAlterado = listaAtualizada.find((f) => f.id === id);
    setFluxos(listaAtualizada);

    toast.success(
      fluxoAlterado?.ativo
        ? `Fluxo "${fluxoAlterado.nome}" HABILITADO!`
        : `Fluxo "${fluxoAlterado?.nome}" DESABILITADO!`
    );

    // Sincroniza em segundo plano
    try {
      fetch(`${botUrl}/api/config/fluxos/${id}/toggle`, { method: 'POST' }).catch(() => {});
      fetch('/api/admin/chatbot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fluxos: listaAtualizada })
      }).catch(() => {});
    } catch (err) {}
  };

  // Excluir Fluxo
  const excluirFluxo = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const fluxo = fluxos.find((f) => f.id === id);
    if (!confirm(`Deseja realmente excluir o fluxo "${fluxo?.nome || id}"?`)) return;

    const listaAtualizada = fluxos.filter((f) => f.id !== id);
    setFluxos(listaAtualizada);
    toast.success(`Fluxo "${fluxo?.nome}" excluído!`);

    try {
      fetch(`${botUrl}/api/config/fluxos/${id}`, { method: 'DELETE' }).catch(() => {});
      fetch('/api/admin/chatbot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fluxos: listaAtualizada })
      }).catch(() => {});
    } catch (err) {}
  };

  // Duplicar Fluxo
  const duplicarFluxo = (fluxo: FluxoItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const novoId = 'fluxo-' + Date.now();
    const novoFluxo: FluxoItem = {
      ...fluxo,
      id: novoId,
      nome: `${fluxo.nome} (Cópia)`,
      ativo: false,
      criadoEm: new Date().toISOString()
    };
    const listaAtualizada = [...fluxos, novoFluxo];
    setFluxos(listaAtualizada);
    toast.success(`Fluxo duplicado com sucesso!`);
    salvarTodosFluxos(listaAtualizada);
  };

  // Abrir Modal de Criação de Novo Fluxo
  const abrirCriarFluxo = (template?: Partial<FluxoItem>) => {
    setEditingFluxoId(null);
    setNovoGatilhoModal('');
    setFluxoForm({
      id: 'fluxo-' + Date.now(),
      nome: template?.nome || '',
      ativo: template?.ativo !== undefined ? template.ativo : true,
      tipoAcao: template?.tipoAcao || 'QUESTIONARIO_ORCAMENTO',
      gatilhos: template?.gatilhos ? [...template.gatilhos] : [],
      origemLead: template?.origemLead || '',
      mensagem: template?.mensagem || '',
      descricao: template?.descricao || ''
    });
    setModalFluxoAberto(true);
  };

  // Abrir Modal de Edição de Fluxo Existente
  const abrirEditarFluxo = (fluxo: FluxoItem) => {
    setEditingFluxoId(fluxo.id);
    setNovoGatilhoModal('');
    setFluxoForm({
      id: fluxo.id,
      nome: fluxo.nome,
      ativo: fluxo.ativo,
      tipoAcao: fluxo.tipoAcao || 'QUESTIONARIO_ORCAMENTO',
      gatilhos: [...(fluxo.gatilhos || [])],
      origemLead: fluxo.origemLead || '',
      mensagem: fluxo.mensagem,
      descricao: fluxo.descricao || ''
    });
    setModalFluxoAberto(true);
  };

  // Adicionar Gatilho no Formulário do Modal
  const adicionarGatilhoModal = (termoManual?: string) => {
    const limpo = (termoManual !== undefined ? termoManual : novoGatilhoModal).trim().toLowerCase();
    if (!limpo) return;
    if (fluxoForm.gatilhos.includes(limpo)) {
      toast.warning('Este gatilho já foi adicionado a este fluxo.');
      return;
    }
    setFluxoForm({ ...fluxoForm, gatilhos: [...fluxoForm.gatilhos, limpo] });
    setNovoGatilhoModal('');
  };

  // Remover Gatilho do Formulário
  const removerGatilhoModal = (gatilhoRemover: string) => {
    setFluxoForm({
      ...fluxoForm,
      gatilhos: fluxoForm.gatilhos.filter((g) => g !== gatilhoRemover)
    });
  };

  // Salvar Fluxo do Modal
  const salvarFluxoFormModal = () => {
    if (!fluxoForm.nome.trim()) {
      toast.error('Informe o nome do fluxo / campanha.');
      return;
    }
    if (fluxoForm.gatilhos.length === 0) {
      toast.error('Adicione pelo menos 1 palavra-chave gatilho para acionar este fluxo.');
      return;
    }
    if (!fluxoForm.mensagem.trim()) {
      toast.error('Informe a mensagem de resposta que o robô enviará.');
      return;
    }

    let novaLista: FluxoItem[];
    if (editingFluxoId) {
      novaLista = fluxos.map((f) => (f.id === editingFluxoId ? { ...fluxoForm } : f));
      toast.success(`Fluxo "${fluxoForm.nome}" atualizado!`);
    } else {
      novaLista = [...fluxos, { ...fluxoForm, id: fluxoForm.id || 'fluxo-' + Date.now() }];
      toast.success(`Novo fluxo "${fluxoForm.nome}" criado com sucesso!`);
    }

    setFluxos(novaLista);
    setModalFluxoAberto(false);
    salvarTodosFluxos(novaLista);
  };

  // Modelos de 1 clique para preencher o formulário
  const aplicarTemplateNoForm = (tipo: 'esportivo' | 'algodao' | 'corporativo' | 'terceirao' | 'eventos' | 'humano') => {
    if (tipo === 'esportivo') {
      setFluxoForm({
        ...fluxoForm,
        nome: 'Campanha Meta Ads - Camisetas Esportivas / Interclasse',
        tipoAcao: 'QUESTIONARIO_ORCAMENTO',
        origemLead: 'Meta Ads (Esportivo / Interclasse)',
        gatilhos: ['vi o anuncio', 'vim pelo anuncio', 'anuncio instagram', 'interclasse', 'dry-fit', 'camisa de time', 'esportivo'],
        mensagem: `👋 *{saudacao}! Que massa ter você por aqui!* 🏆⚽👕\n\nBora montar o uniforme/camisetas personalizadas do seu time ou evento!\n\n📋 *Para eu calcular o valor certinho para você agora mesmo, me conta rapidinho:* \n\n1️⃣ *Qual modelo você procura?* (Ex: Camiseta Dry-Fit manga curta ou Conjunto Camisa + Calção)\n2️⃣ *Quantas peças você precisa aproximadamente?* (Ex: 10, 20, 50 peças)\n3️⃣ *Para qual time ou evento?* (Ex: Interclasse, Time de Futebol/Vôlei, Corrida, Empresa, Academia)\n4️⃣ *Já tem a arte ou logotipo?* (Sim / Não / Pode mandar a foto aqui)\n5️⃣ *Vai querer Nome e Número individual em cada peça?* (Sim / Não)\n\n✍️ *Pode responder tudo junto em uma mensagem* que já calculamos sua cotação na hora! 🚀\n\n_Se preferir ver outras opções, digite *menu* a qualquer momento._`
      });
    } else if (tipo === 'corporativo') {
      setFluxoForm({
        ...fluxoForm,
        nome: 'Campanha Corporativa - Uniformes para Empresas',
        tipoAcao: 'QUESTIONARIO_ORCAMENTO',
        origemLead: 'Campanha Empresas & B2B',
        gatilhos: ['uniforme para empresa', 'uniforme corporativo', 'polo bordada', 'camisa polo empresa', 'uniforme empresarial'],
        mensagem: `👋 *{saudacao}! Muito bem-vindo(a) à Tenório Confecções!* 👔🏢\n\nCuidamos da identidade visual e uniformização da sua equipe com alta durabilidade e acabamento profissional.\n\n📋 *Para prepararmos sua proposta comercial sob medida:*\n\n1️⃣ *Quais modelos você procura?* (Ex: Camisas Polo Piquet, Camisetas Algodão, Aventais, Jalecos)\n2️⃣ *Quantidade estimada de peças?* (Ex: 15, 30, 60, 100+ peças)\n3️⃣ *Sua empresa já possui o logotipo vetorizado ou em foto?*\n4️⃣ *Deseja logotipo bordado ou estampado?*\n5️⃣ *Qual a sua cidade / estado?*\n\n✍️ *Envie essas informações* para montarmos sua proposta na hora!`
      });
    } else if (tipo === 'algodao') {
      setFluxoForm({
        ...fluxoForm,
        nome: 'Campanha Promocional - Camisetas 100% Algodão',
        tipoAcao: 'QUESTIONARIO_ORCAMENTO',
        origemLead: 'Campanha Algodão',
        gatilhos: ['camiseta de algodao', 'camiseta personalizada', 'promocao camiseta', 'camisa 100% algodao', 'marca propria'],
        mensagem: `👋 *{saudacao}! Seja muito bem-vindo(a) à Tenório Confecções!* 🧵✨\n\nVi que você tem interesse nas nossas *Camisetas 100% Algodão Premium* (fio 30.1 penteado)!\n\n📋 *Para eu calcular seu orçamento com as melhores condições:*\n\n1️⃣ *Quantas camisetas você precisa aproximadamente?* (Ex: 10, 20, 50, 100 peças)\n2️⃣ *Qual a cor principal desejada?* (Ex: Branca, Preta, Colorida)\n3️⃣ *Para qual finalidade?* (Ex: Evento, Marca própria, Uniforme, Presente)\n4️⃣ *Já possui a estampa/arte pronta?* (Sim / Não / Pode enviar aqui)\n5️⃣ *Qual o prazo estimado que precisa das peças?*\n\n✍️ *Pode responder tudo junto em uma mensagem* que já calculamos sua cotação na hora! 🚀`
      });
    } else if (tipo === 'terceirao') {
      setFluxoForm({
        ...fluxoForm,
        nome: 'Campanha Estudantil - Terceirão & Formandos',
        tipoAcao: 'QUESTIONARIO_ORCAMENTO',
        origemLead: 'Campanha Terceirão / Formaturas',
        gatilhos: ['terceirao', 'terceirão', 'camisa de formando', 'moletom terceirao', 'formatura', 'nono ano'],
        mensagem: `🎓 *{saudacao}! Fala terceirão, tudo bem?* 🎉👕🏆\n\nBora fazer o manto da formatura / terceirão mais top da escola!\n\n📋 *Para eu calcular os valores especiais com desconto progressivo para a turma:*\n\n1️⃣ *Qual peça a turma quer produzir?* (Ex: Camiseta Algodão, Moletom Canguru com Capuz, Corta-Vento, Raglan)\n2️⃣ *Quantos alunos na turma aproximadamente?* (Ex: 25, 40, 60 pessoas)\n3️⃣ *Nome da escola / cidade:*\n4️⃣ *Já têm o desenho/tema ou querem auxílio para criar o layout virtual?*\n5️⃣ *Vai ter nome e número de cada formando?* (Sim / Não)\n\n✍️ *Mande aqui* que já calculamos a cotação por aluno com condições facilitadas!`
      });
    } else if (tipo === 'eventos') {
      setFluxoForm({
        ...fluxoForm,
        nome: 'Campanha Eventos - Congressos, Igrejas & Blocos',
        tipoAcao: 'QUESTIONARIO_ORCAMENTO',
        origemLead: 'Campanha Eventos & Congressos',
        gatilhos: ['camisa de evento', 'camiseta para igreja', 'congresso', 'bloco', 'retiro', 'camiseta corrida'],
        mensagem: `👋 *{saudacao}! Tudo bem? Que alegria receber você!* 🌟👕\n\nSomos especialistas em camisetas e abadás para grandes eventos, retiros, congressos e corridas com entrega rápida e preço imbatível de atacado!\n\n📋 *Para calcularmos sua cotação:*\n\n1️⃣ *Qual a quantidade estimada de peças?* (Ex: 30, 50, 100, 300+ peças)\n2️⃣ *Qual o tecido de preferência?* (Algodão, Dry-Fit ou Poliviscose)\n3️⃣ *Para qual data é o seu evento?*\n4️⃣ *Já possuem a arte da estampa?*\n\n✍️ *Envie sua resposta* que já passamos o valor com tabela de desconto de atacado!`
      });
    } else if (tipo === 'humano') {
      setFluxoForm({
        ...fluxoForm,
        nome: 'Atendimento Prioritário - Direto com Atendente',
        tipoAcao: 'TRANSFERIR_HUMANO',
        origemLead: 'Fila de Atendimento Humano',
        gatilhos: ['falar com atendente', 'quero falar com humano', 'falar com vendedor', 'urgente', 'suporte humano'],
        mensagem: `👋 *{saudacao}! Com certeza!* 👤✨\n\nJá transferi seu contato com prioridade para um de nossos especialistas em atendimento.\n\n⏳ Em instantes nossa equipe vai te responder por aqui mesmo. Se quiser já adiantar sua dúvida ou pedido, sinta-se à vontade para escrever abaixo!`
      });
    }
  };

  // Testar qual fluxo seria disparado pelo texto digitado no simulador
  const obterFluxoSimulado = (texto: string) => {
    if (!texto.trim()) return null;
    const tLimpo = texto.toLowerCase().trim();
    for (const fluxo of fluxos) {
      const match = fluxo.gatilhos.some((g) => g && tLimpo.includes(g.toLowerCase().trim()));
      if (match) {
        return fluxo;
      }
    }
    return null;
  };

  // Função auxiliar para conversão de chave VAPID no padrão iOS/Safari
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Função para Ativar Notificações no iPhone / Navegador
  const ativarNotificacoesPush = async () => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações Web Push.');
      return;
    }

    try {
      setActionLoading(true);
      const permission = await Notification.requestPermission();
      setPushStatus(permission as any);

      if (permission !== 'granted') {
        toast.error('Permissão de notificações não foi concedida no iOS.');
        return;
      }

      // Registrar Service Worker
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Obter chave pública VAPID
      const vapidRes = await fetch('/api/notifications/vapid-public-key');
      const { publicKey } = await vapidRes.json();

      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // Inscrever no PushManager
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      // Salvar subscription no backend
      const saveRes = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });

      if (saveRes.ok) {
        setIsSubscribed(true);
        toast.success('🎉 Notificações no iPhone ativadas com sucesso! Agora você pode clicar em "Testar Push".');
      } else {
        throw new Error('Falha ao registrar inscrição no servidor');
      }
    } catch (err: any) {
      console.error('Erro ao ativar push:', err);
      toast.error('Erro ao ativar notificações: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const testarNotificacaoPush = async () => {
    if (!isSubscribed) {
      toast.info('💡 Toque primeiro no botão azul "Ativar Notificações no iPhone" para registrar este aparelho.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch('/api/notifications/test', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success('🔔 Notificação enviada para o seu iPhone!');
      } else {
        toast.warning(json.message || 'Nenhum dispositivo cadastrado ainda.');
      }
    } catch (e: any) {
      toast.error('Erro ao disparar teste: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const salvarConfiguracoesNotificacao = async () => {
    try {
      setActionLoading(true);
      const payload = {
        adminPhone,
        notificarAtendimentoHumano: notifHumano,
        notificarNovoOrcamento: notifOrcamento,
        notificarPushWeb: notifPush
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbot_notification_config: JSON.stringify(payload),
          chatbot_admin_phone: adminPhone
        })
      });

      if (res.ok) {
        toast.success('✅ Configurações salvas com sucesso no sistema!');
      } else {
        throw new Error('Falha ao salvar configurações');
      }
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + (e?.message || 'Falha de rede'));
    } finally {
      setActionLoading(false);
    }
  };

  const testarWhatsAppAdmin = async () => {
    if (!adminPhone) {
      toast.warning('Por favor, informe seu número de WhatsApp primeiro.');
      return;
    }
    try {
      setActionLoading(true);
      await salvarConfiguracoesNotificacao();

      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        try {
          const res = await fetch(`${botUrl}/api/config/notificacoes/test`, { method: 'POST' });
          if (res.ok) {
            toast.success('📲 Mensagem de teste enviada para seu WhatsApp!');
            return;
          }
        } catch (e) {}
      }

      toast.success('✅ Número salvo! O robô no computador já sincronizou e enviará os alertas para o seu WhatsApp.');
    } catch (e: any) {
      toast.error('Erro ao testar: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const concluirAtendimento = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${botUrl}/api/atendimento/${id}/concluir`, { method: 'POST' });
      if (res.ok) {
        toast.success('Atendimento concluído!');
        carregarStatus();
      }
    } catch (e) {
      toast.error('Erro ao concluir atendimento');
    } finally {
      setActionLoading(false);
    }
  };

  const removerAtendimento = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${botUrl}/api/atendimento/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Removido da fila!');
        carregarStatus();
      }
    } catch (e) {
      toast.error('Erro ao remover da fila');
    } finally {
      setActionLoading(false);
    }
  };

  const reiniciarBot = async () => {
    try {
      setActionLoading(true);
      await fetch(`${botUrl}/api/restart`, { method: 'POST' });
      toast.success('Solicitação de reinicialização enviada. Aguarde...');
      setTimeout(carregarStatus, 3000);
    } catch (e) {
      toast.error('Erro ao reiniciar robô.');
    } finally {
      setActionLoading(false);
    }
  };

  const desconectarBot = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp do robô?')) return;
    try {
      setActionLoading(true);
      await fetch(`${botUrl}/api/logout`, { method: 'POST' });
      toast.success('WhatsApp desconectado!');
      carregarStatus();
    } catch (e) {
      toast.error('Erro ao desconectar robô.');
    } finally {
      setActionLoading(false);
    }
  };

  const abrirEdicaoProduto = (prod: ProdutoTabela, index: number) => {
    setEditingIndex(index);
    setProdutoForm({
      ...prod,
      precoBaseUnitario: prod.precoBase ?? prod.precoBaseUnitario ?? 0,
      prazoConfeccao: prod.prazoConfeccao || '15 a 20 dias úteis',
      quantidadeMinima: prod.quantidadeMinima || null,
      permiteDescontoProgressivo: prod.permiteDescontoProgressivo !== false,
    });
    setTermosInput((prod.termos || prod.termosIdentificacao || []).join(', '));
    setGradeInput((prod.gradeTamanhos || []).join(', '));
    setCoresInput((prod.coresDisponiveis || []).join(', '));
    
    // Formata faixas de preço (pricing tiers)
    if (Array.isArray(prod.pricingTiers) && prod.pricingTiers.length > 0) {
      setPricingTiersInput(
        prod.pricingTiers
          .map((t) => (t.maxQty ? `${t.minQty} a ${t.maxQty}: ${t.unitPrice}` : `${t.minQty}+: ${t.unitPrice}`))
          .join('\n')
      );
    } else {
      setPricingTiersInput('');
    }

    setVariacoesInput(
      (prod.variacoes || []).map((v) => `${v.nome || v.termo}: ${Number(v.preco ?? 0).toFixed(2)}`).join('\n')
    );
  };

  const abrirNovoProduto = () => {
    setEditingIndex(null);
    setProdutoForm({
      nome: '',
      categoria: 'Geral',
      termos: [],
      termosIdentificacao: [],
      precoBase: 0,
      precoBaseUnitario: 0,
      prazoConfeccao: '15 a 20 dias úteis',
      quantidadeMinima: null,
      pricingTiers: [],
      gradeTamanhos: ['P', 'M', 'G', 'GG'],
      coresDisponiveis: ['Branco', 'Preto'],
      permiteDescontoProgressivo: true,
      variacoes: [],
      observacoes: ''
    });
    setTermosInput('');
    setPricingTiersInput('1 a 10: 49.90\n11+: 45.80');
    setGradeInput('P, M, G, GG');
    setCoresInput('Branco, Preto');
    setVariacoesInput('');
    setNovoProdutoModal(true);
  };

  const salvarProduto = async () => {
    if (!produtoForm.nome) {
      toast.warning('O nome do produto é obrigatório.');
      return;
    }

    const termos = termosInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const grade = gradeInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const cores = coresInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    // Parsing das faixas de preço por quantidade (pricingTiers)
    const pricingTiersParsed: PricingTierItem[] = [];
    if (pricingTiersInput.trim()) {
      const linhasTiers = pricingTiersInput.split('\n');
      for (const linha of linhasTiers) {
        if (!linha.trim()) continue;
        const partes = linha.split(':');
        if (partes.length >= 2) {
          const faixaStr = partes[0].toLowerCase().trim();
          const preco = parseFloat(partes[1].replace(',', '.').replace(/[^0-9.]/g, '').trim());
          if (!isNaN(preco) && preco > 0) {
            let minQty = 1;
            let maxQty: number | null = null;
            if (faixaStr.includes('a') || faixaStr.includes('-')) {
              const numMatch = faixaStr.match(/(\d+)\s*(?:a|-)\s*(\d+)/);
              if (numMatch) {
                minQty = parseInt(numMatch[1], 10);
                maxQty = parseInt(numMatch[2], 10);
              }
            } else if (faixaStr.includes('+') || faixaStr.includes('mais')) {
              const numMatch = faixaStr.match(/(\d+)/);
              if (numMatch) {
                minQty = parseInt(numMatch[1], 10);
                maxQty = null;
              }
            } else {
              const numMatch = faixaStr.match(/(\d+)/);
              if (numMatch) {
                minQty = parseInt(numMatch[1], 10);
                maxQty = null;
              }
            }
            pricingTiersParsed.push({ minQty, maxQty, unitPrice: preco });
          }
        }
      }
    }

    // Parsing de variações
    const variacoesParsed: Array<{ nome: string; termo: string; termos: string[]; preco: number }> = [];
    if (variacoesInput.trim()) {
      const linhas = variacoesInput.split('\n');
      for (const linha of linhas) {
        const partes = linha.split(':');
        if (partes.length >= 2) {
          const termo = partes[0].trim();
          const preco = parseFloat(partes[1].replace(',', '.').replace(/[^0-9.]/g, '').trim());
          if (termo && !isNaN(preco)) {
            variacoesParsed.push({
              nome: termo,
              termo,
              termos: [termo.toLowerCase()],
              preco
            });
          }
        }
      }
    }

    const precoBase = Number(produtoForm.precoBaseUnitario || produtoForm.precoBase || 0);

    const payload: ProdutoTabela = {
      ...produtoForm,
      precoBase,
      precoBaseUnitario: precoBase,
      prazoConfeccao: produtoForm.prazoConfeccao || '15 a 20 dias úteis',
      quantidadeMinima: produtoForm.quantidadeMinima ? Number(produtoForm.quantidadeMinima) : null,
      termos: termos.length > 0 ? termos : [produtoForm.nome.toLowerCase()],
      termosIdentificacao: termos.length > 0 ? termos : [produtoForm.nome.toLowerCase()],
      pricingTiers: pricingTiersParsed.length > 0 ? pricingTiersParsed : undefined,
      gradeTamanhos: grade,
      coresDisponiveis: cores,
      variacoes: variacoesParsed
    };

    try {
      setActionLoading(true);
      if (editingIndex !== null) {
        const res = await fetch(`${botUrl}/api/produtos/${editingIndex}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          toast.success('Produto atualizado com sucesso no robô!');
          setEditingIndex(null);
          carregarTabela();
        }
      } else {
        const res = await fetch(`${botUrl}/api/produtos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          toast.success('Produto cadastrado com sucesso no robô!');
          setNovoProdutoModal(false);
          carregarTabela();
        }
      }
    } catch (e) {
      toast.error('Erro ao salvar produto.');
    } finally {
      setActionLoading(false);
    }
  };

  const excluirProduto = async (index: number) => {
    if (!confirm('Deseja excluir este produto da tabela do robô?')) return;
    try {
      setActionLoading(true);
      const res = await fetch(`${botUrl}/api/produtos/${index}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Produto removido!');
        carregarTabela();
      }
    } catch (e) {
      toast.error('Erro ao excluir produto.');
    } finally {
      setActionLoading(false);
    }
  };

  const clientesFiltrados = (data?.clientesAguardando || []).filter((item) => {
    if (filtroStatusHumano !== 'TODOS' && item.status !== filtroStatusHumano) return false;
    if (!buscaHumano) return true;
    const query = buscaHumano.toLowerCase();
    const nome = (item.nome || '').toLowerCase();
    const tel = (item.telefone || '').toLowerCase();
    const motivo = (item.motivo || '').toLowerCase();
    return nome.includes(query) || tel.includes(query) || motivo.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              Automação WhatsApp & Notificações
              {data?.status === 'CONNECTED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              )}
              {data?.status === 'QR_READY' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Aguardando QR Code
                </span>
              )}
              {(!data || data?.status === 'DISCONNECTED') && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Desconectado
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Robô de atendimento, orçamentos automáticos e notificações em tempo real no iPhone e WhatsApp.
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'status'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <QrCode className="h-4 w-4" />
            Conexão
          </button>

          <button
            onClick={() => setActiveTab('anuncio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'anuncio'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Megaphone className="h-4 w-4 text-pink-300" />
            Fluxos & Campanhas
            <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              {fluxos.filter((f) => f.ativo).length} ativos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('humano')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
              activeTab === 'humano'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            Atendimento Humano
            {(data?.stats?.totalAguardandoHumano || 0) > 0 && (
              <span className="ml-1 px-2 py-0.2 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 animate-bounce">
                {data?.stats?.totalAguardandoHumano}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'produtos'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="h-4 w-4" />
            Tabela de Preços
          </button>

          <button
            onClick={() => setActiveTab('notificacoes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'notificacoes'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4" />
            Notificações (iPhone)
          </button>
        </div>
      </div>

      {/* METRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status do Bot</p>
            <p className="text-lg font-bold text-slate-100 mt-1">
              {data?.status === 'CONNECTED' ? 'Conectado' : data?.status === 'QR_READY' ? 'Lendo QR Code' : 'Desconectado'}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mensagens Recebidas</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{data?.stats.totalMensagens || 0}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <MessageSquare className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Orçamentos Gerados</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{data?.stats.totalOrcamentos || 0}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aguardando Atendente</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{data?.stats.totalAguardandoHumano || 0}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ABA 1: CONEXÃO E QR CODE */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center text-center">
            {data?.status === 'QR_READY' && data.qrCode ? (
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-2xl inline-block shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.qrCode} alt="WhatsApp QR Code" className="w-64 h-64 rounded-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Escaneie o QR Code</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Abra o WhatsApp no celular do atendimento &gt; Configurações / Aparelhos Conectados &gt; Conectar um Aparelho.
                  </p>
                </div>
              </div>
            ) : data?.status === 'CONNECTED' ? (
              <div className="space-y-4 py-8">
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">WhatsApp Conectado!</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Operando como: <span className="text-slate-200 font-semibold">{data.info.name || 'Tenório Confecções'}</span>
                  </p>
                  {data.info.phone && (
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Número: +{data.info.phone}</p>
                  )}
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={reiniciarBot}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reiniciar Sessão
                  </button>
                  <button
                    onClick={desconectarBot}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-2 transition"
                  >
                    <Power className="h-3.5 w-3.5" />
                    Desconectar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Iniciando Cliente WhatsApp...</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Aguarde alguns segundos enquanto o robô prepara a conexão ou gera o QR Code.
                  </p>
                </div>
                <button
                  onClick={reiniciarBot}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 mx-auto transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Forçar Reinicialização
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Últimos Orçamentos Gerados pelo Robô
            </h3>
            {(!data?.ultimosOrcamentos || data.ultimosOrcamentos.length === 0) ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Nenhum orçamento calculado ainda nesta sessão.
              </div>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {data.ultimosOrcamentos.map((orc, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{orc.cliente || 'Cliente'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {orc.pecas ?? 0} peças • {orc.data ? new Date(orc.data).toLocaleTimeString('pt-BR') : '--:--'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-emerald-400">
                        {Number(orc.total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{orc.codigo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: GERENCIADOR DE MÚLTIPLOS FLUXOS & CAMPANHAS */}
      {activeTab === 'anuncio' && (
        <div className="space-y-6">
          {/* HEADER PRINCIPAL & AÇÕES GERAIS */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-lg shadow-pink-500/10">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    Gerenciador de Fluxos & Campanhas
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {fluxos.length} cadastrados
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Crie e personalize múltiplos fluxos de qualificação, integre com anúncios e ative ou desative cada fluxo com 1 clique.
                  </p>
                </div>
              </div>

              {/* BOTÕES DE AÇÃO: NOVO FLUXO E SALVAR TODOS */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => abrirCriarFluxo()}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white flex items-center gap-2 shadow-lg shadow-pink-600/25 transition"
                >
                  <Plus className="h-4 w-4" />
                  Novo Fluxo
                </button>

                <button
                  type="button"
                  onClick={() => salvarTodosFluxos()}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 border border-slate-700 transition disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-emerald-400" />}
                  Salvar Alterações
                </button>
              </div>
            </div>

            {/* MINI METRICAS DOS FLUXOS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total de Fluxos</p>
                <p className="text-xl font-bold text-slate-100 mt-0.5">{fluxos.length}</p>
              </div>

              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900/30">
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Fluxos Habilitados</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">{fluxos.filter((f) => f.ativo).length}</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fluxos Desabilitados</p>
                <p className="text-xl font-bold text-slate-400 mt-0.5">{fluxos.filter((f) => !f.ativo).length}</p>
              </div>

              <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-900/30">
                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Gatilhos Monitorados</p>
                <p className="text-xl font-bold text-blue-400 mt-0.5">
                  {fluxos.reduce((acc, f) => acc + (Array.isArray(f.gatilhos) ? f.gatilhos.length : 0), 0)}
                </p>
              </div>
            </div>

            {/* MODELOS PRONTOS DE 1 CLIQUE PARA CRIAR NOVO FLUXO */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Criar a partir de Modelo Pronto (1 Clique)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => abrirCriarFluxo({
                    nome: 'Campanha Meta Ads - Camisetas Esportivas / Interclasse',
                    tipoAcao: 'QUESTIONARIO_ORCAMENTO',
                    origemLead: 'Meta Ads (Esportivo / Interclasse)',
                    gatilhos: ['vi o anuncio', 'vim pelo anuncio', 'anuncio instagram', 'interclasse', 'dry-fit', 'camisa de time', 'esportivo'],
                    mensagem: `👋 *{saudacao}! Que massa ter você por aqui!* 🏆⚽👕\n\nBora montar o uniforme/camisetas personalizadas do seu time ou evento!\n\n📋 *Para eu calcular o valor certinho para você agora mesmo, me conta rapidinho:* \n\n1️⃣ *Qual modelo você procura?* (Ex: Camiseta Dry-Fit manga curta ou Conjunto Camisa + Calção)\n2️⃣ *Quantas peças você precisa aproximadamente?* (Ex: 10, 20, 50 peças)\n3️⃣ *Para qual time ou evento?* (Ex: Interclasse, Time de Futebol/Vôlei, Corrida, Empresa, Academia)\n4️⃣ *Já tem a arte ou logotipo?* (Sim / Não / Pode mandar a foto aqui)\n5️⃣ *Vai querer Nome e Número individual em cada peça?* (Sim / Não)\n\n✍️ *Pode responder tudo junto em uma mensagem* que já calculamos sua cotação na hora! 🚀\n\n_Se preferir ver outras opções, digite *menu* a qualquer momento._`
                  })}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/50 text-left transition group flex items-start justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-pink-400 flex items-center gap-1.5">
                      ⚽ Esportivo / Interclasse
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dry-Fit, fardamentos, numeração individual e eventos.
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-slate-500 group-hover:text-pink-400 mt-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => abrirCriarFluxo({
                    nome: 'Campanha Corporativa - Uniformes para Empresas',
                    tipoAcao: 'QUESTIONARIO_ORCAMENTO',
                    origemLead: 'Campanha Empresas & B2B',
                    gatilhos: ['uniforme para empresa', 'uniforme corporativo', 'polo bordada', 'camisa polo empresa', 'uniforme empresarial'],
                    mensagem: `👋 *{saudacao}! Muito bem-vindo(a) à Tenório Confecções!* 👔🏢\n\nCuidamos da identidade visual e uniformização da sua equipe com alta durabilidade e acabamento profissional.\n\n📋 *Para prepararmos sua proposta comercial sob medida:*\n\n1️⃣ *Quais modelos você procura?* (Ex: Camisas Polo Piquet, Camisetas Algodão, Aventais, Jalecos)\n2️⃣ *Quantidade estimada de peças?* (Ex: 15, 30, 60, 100+ peças)\n3️⃣ *Sua empresa já possui o logotipo vetorizado ou em foto?*\n4️⃣ *Deseja logotipo bordado ou estampado?*\n5️⃣ *Qual a sua cidade / estado?*\n\n✍️ *Envie essas informações* para montarmos sua proposta na hora!`
                  })}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/50 text-left transition group flex items-start justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-pink-400 flex items-center gap-1.5">
                      👔 Uniformes Corporativos & Polos
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Polos bordadas, camisas para empresas e B2B.
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-slate-500 group-hover:text-pink-400 mt-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => abrirCriarFluxo({
                    nome: 'Campanha Estudantil - Terceirão & Formandos',
                    tipoAcao: 'QUESTIONARIO_ORCAMENTO',
                    origemLead: 'Campanha Terceirão / Formaturas',
                    gatilhos: ['terceirao', 'terceirão', 'camisa de formando', 'moletom terceirao', 'formatura', 'nono ano'],
                    mensagem: `🎓 *{saudacao}! Fala terceirão, tudo bem?* 🎉👕🏆\n\nBora fazer o manto da formatura / terceirão mais top da escola!\n\n📋 *Para eu calcular os valores especiais com desconto progressivo para a turma:*\n\n1️⃣ *Qual peça a turma quer produzir?* (Ex: Camiseta Algodão, Moletom Canguru com Capuz, Corta-Vento, Raglan)\n2️⃣ *Quantos alunos na turma aproximadamente?* (Ex: 25, 40, 60 pessoas)\n3️⃣ *Nome da escola / cidade:*\n4️⃣ *Já têm o desenho/tema ou querem auxílio para criar o layout virtual?*\n5️⃣ *Vai ter nome e número de cada formando?* (Sim / Não)\n\n✍️ *Mande aqui* que já calculamos a cotação por aluno com condições facilitadas!`
                  })}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/50 text-left transition group flex items-start justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-pink-400 flex items-center gap-1.5">
                      🎓 Terceirão & Formandos
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Moletons, camisetas de turma e formaturas escolares.
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-slate-500 group-hover:text-pink-400 mt-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SIMULADOR DE GATILHOS AO VIVO */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Send className="h-4 w-4 text-pink-400" />
                Simulador de Disparo de Fluxos em Tempo Real
              </h3>
              <span className="text-[11px] text-slate-400">
                Teste qualquer frase que um cliente enviaria no WhatsApp
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={simuladorTexto}
                onChange={(e) => setSimuladorTexto(e.target.value)}
                placeholder="Digite aqui para testar: ex: Olá, vim pelo anúncio de dry-fit | quero uniforme pra minha empresa..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 pr-10 font-medium"
              />
              {simuladorTexto && (
                <button
                  type="button"
                  onClick={() => setSimuladorTexto('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* RESULTADO DA SIMULAÇÃO */}
            {simuladorTexto.trim() && (
              <div className="mt-2">
                {(() => {
                  const fluxoMatch = obterFluxoSimulado(simuladorTexto);
                  if (fluxoMatch) {
                    return (
                      <div className={`p-4 rounded-xl border ${fluxoMatch.ativo ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'} space-y-2`}>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold flex items-center gap-2">
                            {fluxoMatch.ativo ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span>Fluxo Acionado com Sucesso: <strong>{fluxoMatch.nome}</strong></span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-rose-400" />
                                <span>Fluxo Detectado porém <strong>DESABILITADO</strong>: {fluxoMatch.nome} (O bot cairá no menu padrão)</span>
                              </>
                            )}
                          </p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${fluxoMatch.ativo ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                            {fluxoMatch.ativo ? 'Habilitado' : 'Desabilitado'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          <strong>Ação:</strong> {fluxoMatch.tipoAcao === 'QUESTIONARIO_ORCAMENTO' ? '🎯 Questionário de Orçamento Automático' : fluxoMatch.tipoAcao === 'TRANSFERIR_HUMANO' ? '👤 Transferência Imediata para Atendente Humano' : '💬 Resposta Rápida Direta'}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-slate-500" />
                      Nenhum fluxo customizado foi acionado para essa mensagem. O robô responderá com o <strong>Menu Principal Padrão</strong> ou <strong>Cálculo Direto de Orçamento</strong>.
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* BARRA DE FILTROS E BUSCA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={buscaFluxo}
                onChange={(e) => setBuscaFluxo(e.target.value)}
                placeholder="Buscar por nome ou gatilho..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFiltroStatusFluxo('TODOS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filtroStatusFluxo === 'TODOS'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({fluxos.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatusFluxo('ATIVOS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filtroStatusFluxo === 'ATIVOS'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Habilitados ({fluxos.filter((f) => f.ativo).length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatusFluxo('INATIVOS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filtroStatusFluxo === 'INATIVOS'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Desabilitados ({fluxos.filter((f) => !f.ativo).length})
              </button>
            </div>
          </div>

          {/* LISTA DE CARDS DE FLUXOS */}
          <div className="space-y-4">
            {fluxos
              .filter((fluxo) => {
                if (filtroStatusFluxo === 'ATIVOS' && !fluxo.ativo) return false;
                if (filtroStatusFluxo === 'INATIVOS' && fluxo.ativo) return false;
                if (!buscaFluxo.trim()) return true;
                const b = buscaFluxo.toLowerCase().trim();
                const matchNome = fluxo.nome.toLowerCase().includes(b);
                const matchGatilho = (fluxo.gatilhos || []).some((g) => g.toLowerCase().includes(b));
                const matchLead = (fluxo.origemLead || '').toLowerCase().includes(b);
                return matchNome || matchGatilho || matchLead;
              })
              .map((fluxo) => (
                <div
                  key={fluxo.id}
                  className={`bg-slate-900/70 p-5 rounded-2xl border transition-all ${
                    fluxo.ativo
                      ? 'border-slate-800 hover:border-pink-500/40 shadow-lg shadow-black/20'
                      : 'border-slate-800/40 opacity-75 hover:opacity-100 bg-slate-950/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                          {fluxo.nome}
                        </h3>

                        {/* BADGE DE TIPO DE AÇÃO */}
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                          {fluxo.tipoAcao === 'QUESTIONARIO_ORCAMENTO' ? '🎯 Orçamento Automático' : fluxo.tipoAcao === 'TRANSFERIR_HUMANO' ? '👤 Transferir Humano' : '💬 Resposta Direta'}
                        </span>

                        {fluxo.origemLead && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                            Origem: {fluxo.origemLead}
                          </span>
                        )}
                      </div>

                      {fluxo.descricao && (
                        <p className="text-xs text-slate-400">{fluxo.descricao}</p>
                      )}
                    </div>

                    {/* CONTROLES: TOGGLE HABILITADO / DESABILITADO + AÇÕES */}
                    <div className="flex items-center gap-3">
                      {/* TOGGLE SWITCH RÁPIDO */}
                      <div className="flex items-center gap-2.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span className={`text-xs font-semibold ${fluxo.ativo ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {fluxo.ativo ? 'Habilitado' : 'Desabilitado'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fluxo.ativo}
                            onChange={(e) => toggleFluxoAtivo(fluxo.id, e as any)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* BOTOES EDITAR / DUPLICAR / EXCLUIR */}
                      <button
                        type="button"
                        onClick={() => abrirEditarFluxo(fluxo)}
                        className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
                        title="Editar Fluxo"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => duplicarFluxo(fluxo, e)}
                        className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
                        title="Duplicar Fluxo"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => excluirFluxo(fluxo.id, e)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/40 transition"
                        title="Excluir Fluxo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* CORPO DO CARD: GATILHOS E PREVIEW DA MENSAGEM */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 text-xs">
                    {/* GATILHOS */}
                    <div className="lg:col-span-5 space-y-2">
                      <p className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Send className="h-3.5 w-3.5 text-blue-400" />
                        Gatilhos de Ativação ({fluxo.gatilhos?.length || 0}):
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {(!fluxo.gatilhos || fluxo.gatilhos.length === 0) ? (
                          <span className="text-slate-500 italic">Nenhum gatilho configurado.</span>
                        ) : (
                          fluxo.gatilhos.map((g, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-950 border border-slate-800 text-slate-300"
                            >
                              {g}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* PREVIEW DA MENSAGEM */}
                    <div className="lg:col-span-7 space-y-2">
                      <p className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-pink-400" />
                        Mensagem de Resposta do Robô:
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 font-mono text-[11px] leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {fluxo.mensagem}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {fluxos.length === 0 && (
              <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <Megaphone className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-200">Nenhum fluxo cadastrado</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Crie seu primeiro fluxo de qualificação para atender clientes vindos de anúncios ou mensagens específicas.
                </p>
                <button
                  type="button"
                  onClick={() => abrirCriarFluxo()}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white transition shadow-lg shadow-pink-600/20 inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Criar Primeiro Fluxo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: ATENDIMENTO HUMANO COM FILTROS */}
      {activeTab === 'humano' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={buscaHumano}
                onChange={(e) => setBuscaHumano(e.target.value)}
                placeholder="Filtrar por nome ou número do cliente..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              {buscaHumano && (
                <button
                  onClick={() => setBuscaHumano('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setFiltroStatusHumano('AGUARDANDO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filtroStatusHumano === 'AGUARDANDO'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Aguardando
              </button>
              <button
                onClick={() => setFiltroStatusHumano('ATENDIDO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filtroStatusHumano === 'ATENDIDO'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Concluídos
              </button>
              <button
                onClick={() => setFiltroStatusHumano('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filtroStatusHumano === 'TODOS'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Todos
              </button>
            </div>
          </div>

          {clientesFiltrados.length === 0 ? (
            <div className="bg-slate-900/40 p-12 rounded-2xl border border-slate-800/80 text-center">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">Nenhum cliente na fila de espera</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {buscaHumano
                  ? 'Nenhum resultado encontrado para a busca especificada.'
                  : 'Quando um cliente solicitar atendimento com vendedor ou tirar dúvidas, ele aparecerá aqui com acesso rápido.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientesFiltrados.map((cli) => {
                const telLimpo = cli.telefone ? cli.telefone.replace(/[^0-9]/g, '') : '';
                const linkWhats = `https://wa.me/${telLimpo}?text=Ol%C3%A1%20${encodeURIComponent(
                  cli.nome
                )}!%20Sou%20da%20equipe%20Ten%C3%B3rio%20Confec%C3%A7%C3%B5es,%20como%20posso%20te%20ajudar?`;

                return (
                  <div
                    key={cli.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all backdrop-blur-sm ${
                      cli.status === 'AGUARDANDO'
                        ? 'bg-amber-950/20 border-amber-500/30 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-900/50 border-slate-800/60 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                            {cli.nome || 'Cliente WhatsApp'}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">📱 {cli.telefone || 'Sem número'}</p>
                        </div>
                        {cli.status === 'AGUARDANDO' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                            Aguardando
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Atendido
                          </span>
                        )}
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/50">
                        <p className="text-xs text-slate-400">
                          <strong className="text-slate-300">Motivo:</strong> {cli.motivo}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          ⏰ Solicitado em: {cli.data ? new Date(cli.data).toLocaleString('pt-BR') : 'Data não informada'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <a
                        href={linkWhats}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Abrir WhatsApp
                      </a>

                      {cli.status === 'AGUARDANDO' && (
                        <button
                          onClick={() => concluirAtendimento(cli.id)}
                          disabled={actionLoading}
                          title="Marcar como atendido"
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => removerAtendimento(cli.id)}
                        disabled={actionLoading}
                        title="Remover da lista"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: NOTIFICAÇÕES NO IPHONE E WHATSAPP */}
      {activeTab === 'notificacoes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1: WEB PUSH NO IPHONE (PWA) */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Notificações Push no iPhone</h3>
                  <p className="text-xs text-slate-400">Alertas na tela de bloqueio e central de notificações</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Suporte no Dispositivo:</span>
                  <span className="font-semibold text-emerald-400">
                    {pushStatus === 'unsupported' ? 'Não Suportado' : 'Compatível (iOS 16.4+ / iOS 17 / 18)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status da Inscrição:</span>
                  <span
                    className={`font-semibold ${
                      isSubscribed ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isSubscribed ? '✅ Inscrito e Ativo' : '⚠️ Não Inscrito'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Permissão do iOS:</span>
                  <span className="font-semibold text-slate-200 uppercase">{pushStatus}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 space-y-2 mb-6">
                <p className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-blue-400" />
                  Dica de Instalação no iPhone:
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Para o iPhone permitir notificações mesmo com o navegador fechado, o painel deve ser adicionado à Tela de Início:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Abra o painel no Safari do seu iPhone</li>
                  <li>Toque no botão de Compartilhar (quadrado com seta para cima)</li>
                  <li>Selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong></li>
                  <li>Abra pelo novo ícone e clique no botão abaixo para ativar.</li>
                </ol>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row gap-3">
              <button
                onClick={ativarNotificacoesPush}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20"
              >
                <Bell className="h-4 w-4" />
                {isSubscribed ? 'Reativar / Atualizar Inscrição' : 'Ativar Notificações no iPhone'}
              </button>

              <button
                onClick={testarNotificacaoPush}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-2 transition"
              >
                <Send className="h-3.5 w-3.5" />
                Testar Push
              </button>
            </div>
          </div>

          {/* CARD 2: AVISOS NO WHATSAPP DO ADMINISTRADOR */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Alertas no seu WhatsApp Pessoal</h3>
                  <p className="text-xs text-slate-400">Receba mensagens automáticas quando algo acontecer</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Seu Número de WhatsApp (com DDD):
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="Ex: 5581999999999 ou 81999999999"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    O robô enviará um aviso direto neste número assim que houver solicitação ou venda.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 cursor-pointer hover:bg-slate-950/80 transition">
                    <input
                      type="checkbox"
                      checked={notifHumano}
                      onChange={(e) => setNotifHumano(e.target.checked)}
                      className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-200">Alerta de Atendimento Humano</p>
                      <p className="text-slate-400">Avisa quando um cliente escolher a opção de falar com vendedor.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 cursor-pointer hover:bg-slate-950/80 transition">
                    <input
                      type="checkbox"
                      checked={notifOrcamento}
                      onChange={(e) => setNotifOrcamento(e.target.checked)}
                      className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-200">Alerta de Novo Orçamento / Venda</p>
                      <p className="text-slate-400">Avisa os valores e quantidade de peças cotadas pelo cliente.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row gap-3">
              <button
                onClick={salvarConfiguracoesNotificacao}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                <Save className="h-4 w-4" />
                Salvar Configurações
              </button>

              <button
                onClick={testarWhatsAppAdmin}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-2 transition"
              >
                <Send className="h-3.5 w-3.5" />
                Testar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: TABELA DE PREÇOS */}
      {activeTab === 'produtos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <h3 className="text-base font-bold text-slate-100">Catálogo de Produtos & Preços do Robô</h3>
              <p className="text-xs text-slate-400">
                Configure os valores unitários, variações e regras de desconto que o bot calcula automaticamente.
              </p>
            </div>
            <button
              onClick={abrirNovoProduto}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
            >
              <Plus className="h-4 w-4" />
              Adicionar Novo Produto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabela?.produtos.map((prod, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-100">{prod.nome}</h4>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                      {prod.categoria || 'Geral'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Preço Base:</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {Number(prod.precoBase ?? prod.precoBaseUnitario ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Prazo de Confecção:</span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-400" />
                        {prod.prazoConfeccao || '15 a 20 dias úteis'}
                      </span>
                    </div>

                    {prod.quantidadeMinima ? (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Pedido Mínimo:</span>
                        <span className="font-semibold text-amber-400">
                          {prod.quantidadeMinima} unidades
                        </span>
                      </div>
                    ) : null}

                    {/* Faixas de preço por quantidade / Preços Progressivos */}
                    {prod.pricingTiers && prod.pricingTiers.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800/60">
                        <p className="text-[11px] font-semibold text-blue-400 mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Preços por Quantidade:
                        </p>
                        <div className="space-y-1">
                          {prod.pricingTiers.map((t, ti) => (
                            <div key={ti} className="flex justify-between text-[11px] text-slate-300 bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-800/40">
                              <span>• {t.maxQty ? `${t.minQty} a ${t.maxQty} un` : `${t.minQty}+ un`}</span>
                              <span className="font-mono font-bold text-emerald-400">
                                {Number(t.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/un
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Variações específicas */}
                    {prod.variacoes && prod.variacoes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800/60">
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">Variações Cadastradas:</p>
                        <div className="space-y-1">
                          {prod.variacoes.map((v, vi) => (
                            <div key={vi} className="flex justify-between text-[11px] text-slate-300 bg-slate-950/30 px-2 py-0.5 rounded">
                              <span>• {v.nome || v.termo}</span>
                              <span className="font-mono text-emerald-400">
                                {Number(v.preco ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-end gap-2">
                  <button
                    onClick={() => abrirEdicaoProduto(prod, index)}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                    title="Editar produto"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluirProduto(index)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Excluir produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO / CRIAÇÃO DE PRODUTO */}
      {(editingIndex !== null || novoProdutoModal) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {editingIndex !== null ? 'Editar Produto da Tabela do Robô' : 'Novo Produto para o Robô'}
                </h3>
                <p className="text-xs text-slate-400">
                  Configure preços base, prazos de confecção e faixas progressivas de quantidade lidas pelo chatbot.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingIndex(null);
                  setNovoProdutoModal(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Produto:</label>
                <input
                  type="text"
                  value={produtoForm.nome}
                  onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                  placeholder="Ex: Camiseta 100% Algodão Personalizada"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria:</label>
                  <input
                    type="text"
                    value={produtoForm.categoria}
                    onChange={(e) => setProdutoForm({ ...produtoForm, categoria: e.target.value })}
                    placeholder="Ex: Camisetas, Moletons, Brindes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preço Base (1 un) (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoForm.precoBaseUnitario}
                    onChange={(e) =>
                      setProdutoForm({ ...produtoForm, precoBaseUnitario: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Qtd Mínima (Opcional):</label>
                  <input
                    type="number"
                    value={produtoForm.quantidadeMinima || ''}
                    onChange={(e) =>
                      setProdutoForm({
                        ...produtoForm,
                        quantidadeMinima: e.target.value ? parseInt(e.target.value, 10) : null
                      })
                    }
                    placeholder="Ex: 10 ou 20"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Prazo de Confecção */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Prazo de Confecção / Entrega:</label>
                  <div className="flex gap-1">
                    {['15 a 20 dias úteis', '20 a 25 dias úteis', '30 a 40 dias úteis'].map((pz) => (
                      <button
                        key={pz}
                        type="button"
                        onClick={() => setProdutoForm({ ...produtoForm, prazoConfeccao: pz })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        {pz.split(' ')[0]} {pz.split(' ')[1]} {pz.split(' ')[2]}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={produtoForm.prazoConfeccao || ''}
                  onChange={(e) => setProdutoForm({ ...produtoForm, prazoConfeccao: e.target.value })}
                  placeholder="Ex: 15 a 20 dias úteis"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Faixas de Preço por Quantidade (Pricing Tiers) */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-400 font-bold flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      Preços Progressivos / Faixas por Quantidade (Pricing Tiers):
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Defina os valores reduzidos por faixa de quantidade (uma por linha, formato: <code>Faixa: Valor</code>):
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPricingTiersInput('1 a 10: 49.90\n11+: 45.80')}
                      className="text-[10px] px-2 py-1 rounded bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/40 font-medium transition"
                    >
                      Ex: 11+ peças (-R$ 4,10)
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={pricingTiersInput}
                  onChange={(e) => setPricingTiersInput(e.target.value)}
                  placeholder={"1 a 10: 49.90\n11+: 45.80\n50+: 39.90"}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-500">
                  💡 <em>Exemplo: Ao cotar 15 peças, o robô lerá a faixa &quot;11+&quot; e aplicará automaticamente o valor unitário configurado.</em>
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Termos de Identificação no WhatsApp (separados por vírgula):
                </label>
                <input
                  type="text"
                  value={termosInput}
                  onChange={(e) => setTermosInput(e.target.value)}
                  placeholder="Ex: algodao, algodão, camiseta algodao, 100% algodao"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Variações Específicas de Preço (uma por linha, formato: <code>Nome: Valor</code>):
                </label>
                <textarea
                  rows={3}
                  value={variacoesInput}
                  onChange={(e) => setVariacoesInput(e.target.value)}
                  placeholder={"300ml: 28.46\n500ml: 31.66\n700ml: 36.86\nKit Suporte + Wind Banner: 289.80"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingIndex(null);
                  setNovoProdutoModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={salvarProduto}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20"
              >
                Salvar Produto no Robô
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR OU EDITAR FLUXO DE ATENDIMENTO */}
      {modalFluxoAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
            {/* CABEÇALHO DO MODAL */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {editingFluxoId ? 'Editar Fluxo de Atendimento' : 'Criar Novo Fluxo de Atendimento'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure os gatilhos, mensagens e tipo de ação do robô.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalFluxoAberto(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODELOS RÁPIDOS DE 1 CLIQUE */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Preencher com Modelo Pré-Configurado (1 Clique)
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => aplicarTemplateNoForm('esportivo')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-pink-400 border border-slate-800 transition font-medium"
                >
                  ⚽ Esportivo / Interclasse
                </button>
                <button
                  type="button"
                  onClick={() => aplicarTemplateNoForm('corporativo')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-pink-400 border border-slate-800 transition font-medium"
                >
                  👔 Uniformes Corporativos
                </button>
                <button
                  type="button"
                  onClick={() => aplicarTemplateNoForm('algodao')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-pink-400 border border-slate-800 transition font-medium"
                >
                  👕 100% Algodão
                </button>
                <button
                  type="button"
                  onClick={() => aplicarTemplateNoForm('terceirao')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-pink-400 border border-slate-800 transition font-medium"
                >
                  🎓 Terceirão / Formandos
                </button>
                <button
                  type="button"
                  onClick={() => aplicarTemplateNoForm('eventos')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-pink-400 border border-slate-800 transition font-medium"
                >
                  🌟 Eventos & Congressos
                </button>
                <button
                  type="button"
                  onClick={() => aplicarTemplateNoForm('humano')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-blue-400 border border-slate-800 transition font-medium"
                >
                  👤 Atendente Humano
                </button>
              </div>
            </div>

            {/* FORMULÁRIO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NOME DO FLUXO */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome / Identificador do Fluxo ou Campanha *
                </label>
                <input
                  type="text"
                  value={fluxoForm.nome}
                  onChange={(e) => setFluxoForm({ ...fluxoForm, nome: e.target.value })}
                  placeholder="Ex: Campanha Anúncios Instagram - Camisetas Interclasse"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* TOGGLE HABILITADO / DESABILITADO */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Status deste Fluxo</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {fluxoForm.ativo ? '🟢 Habilitado (O robô responderá a este fluxo)' : '⚪ Desabilitado (Inativo no robô)'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fluxoForm.ativo}
                    onChange={(e) => setFluxoForm({ ...fluxoForm, ativo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* ORIGEM DO LEAD */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Origem do Lead / Campanha (Opcional)
                </label>
                <input
                  type="text"
                  value={fluxoForm.origemLead || ''}
                  onChange={(e) => setFluxoForm({ ...fluxoForm, origemLead: e.target.value })}
                  placeholder="Ex: Meta Ads (Instagram/FB)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* SELETOR DE TIPO DE AÇÃO */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tipo de Ação ao Acionar este Fluxo *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFluxoForm({ ...fluxoForm, tipoAcao: 'QUESTIONARIO_ORCAMENTO' })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      fluxoForm.tipoAcao === 'QUESTIONARIO_ORCAMENTO'
                        ? 'bg-blue-600/10 border-blue-500 text-blue-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      🎯 Orçamento Automático
                    </p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      O bot envia o questionário e na resposta calcula e grava o orçamento no banco com desconto.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFluxoForm({ ...fluxoForm, tipoAcao: 'TRANSFERIR_HUMANO' })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      fluxoForm.tipoAcao === 'TRANSFERIR_HUMANO'
                        ? 'bg-amber-600/10 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      👤 Transferir para Humano
                    </p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      Envia mensagem informando o atendimento humano e adiciona na fila de espera com notificação.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFluxoForm({ ...fluxoForm, tipoAcao: 'RESPOSTA_DIRETA' })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      fluxoForm.tipoAcao === 'RESPOSTA_DIRETA'
                        ? 'bg-purple-600/10 border-purple-500 text-purple-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      💬 Resposta Direta / FAQ
                    </p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      Apenas envia a mensagem e orientações pré-definidas para o cliente.
                    </p>
                  </button>
                </div>
              </div>

              {/* GATILHOS / PALAVRAS-CHAVE */}
              <div className="md:col-span-2 space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Palavras-Chave Gatilhos (Que Disparam este Fluxo) *
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Se a primeira mensagem do cliente contiver qualquer um desses termos, este fluxo será ativado.
                  </p>
                </div>

                {/* TAGS */}
                <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2.5 rounded-xl bg-slate-900 border border-slate-800 items-center">
                  {fluxoForm.gatilhos.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Nenhum gatilho adicionado ainda.</span>
                  ) : (
                    fluxoForm.gatilhos.map((g, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-pink-500/10 text-pink-300 border border-pink-500/20"
                      >
                        {g}
                        <button
                          type="button"
                          onClick={() => removerGatilhoModal(g)}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* INPUT PARA NOVO GATILHO */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novoGatilhoModal}
                    onChange={(e) => setNovoGatilhoModal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        adicionarGatilhoModal();
                      }
                    }}
                    placeholder="Digite um termo e tecle Enter (ex: vi o anuncio, interclasse, polo bordada...)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => adicionarGatilhoModal()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* EDITOR DE MENSAGEM */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mensagem de Resposta do Robô (WhatsApp) *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFluxoForm({ ...fluxoForm, mensagem: fluxoForm.mensagem + ' {saudacao}' })}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                      title="Insere Bom dia / Boa tarde / Boa noite de acordo com o horário"
                    >
                      + {'{saudacao}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFluxoForm({ ...fluxoForm, mensagem: fluxoForm.mensagem + ' {nome}' })}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                      title="Insere o nome do cliente salvo no WhatsApp"
                    >
                      + {'{nome}'}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={10}
                  value={fluxoForm.mensagem}
                  onChange={(e) => setFluxoForm({ ...fluxoForm, mensagem: e.target.value })}
                  placeholder="Digite a mensagem formatada para WhatsApp..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-pink-500 leading-relaxed"
                />
              </div>
            </div>

            {/* BOTOES DO MODAL */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalFluxoAberto(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarFluxoFormModal}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white transition shadow-lg shadow-pink-600/25 flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                Salvar Fluxo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
