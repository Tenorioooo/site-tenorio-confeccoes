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

interface FluxoAnuncioConfig {
  ativo: boolean;
  tituloCampanha: string;
  gatilhos: string[];
  mensagem: string;
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
    fluxoAnuncio?: FluxoAnuncioConfig;
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

  // Configurações do Fluxo de Anúncios (ADS)
  const [fluxoAnuncio, setFluxoAnuncio] = useState<FluxoAnuncioConfig>({
    ativo: true,
    tituloCampanha: 'Camisetas Esportivas / Interclasse',
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
      'esportiva',
      'uniforme esportivo',
      'camisa de time',
      'torcida'
    ],
    mensagem: `👋 *{saudacao}! Que massa ter você por aqui!* 🏆⚽👕\n\nBora montar o uniforme/camisetas personalizadas do seu time ou evento!\n\n📋 *Para eu calcular o valor certinho para você agora mesmo, me conta rapidinho:* \n\n1️⃣ *Qual modelo você procura?* (Ex: Camiseta Dry-Fit manga curta ou Conjunto Camisa + Calção)\n2️⃣ *Quantas peças você precisa aproximadamente?* (Ex: 10, 20, 50 peças)\n3️⃣ *Para qual time ou evento?* (Ex: Interclasse, Time de Futebol/Vôlei, Corrida, Empresa, Academia)\n4️⃣ *Já tem a arte ou logotipo?* (Sim / Não / Pode mandar a foto aqui)\n5️⃣ *Vai querer Nome e Número individual em cada peça?* (Sim / Não)\n\n✍️ *Pode responder tudo junto em uma mensagem* que já calculamos sua cotação na hora! 🚀\n\n_Se preferir ver outras opções, digite *menu* a qualquer momento._`
  });
  const [gatilhosInput, setGatilhosInput] = useState('');
  const [novoGatilhoTexto, setNovoGatilhoTexto] = useState('');

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
      const res = await fetch(`${botUrl}/api/status`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Servidor do bot offline');
      const json: StatusResponse = await res.json();
      setData(json);
    } catch (e: any) {
      // Se falhar a conexão direta, mantém os dados anteriores ou null
    } finally {
      setLoading(false);
    }
  }, [botUrl]);

  const carregarTabela = useCallback(async () => {
    try {
      const res = await fetch(`${botUrl}/api/tabela`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setTabela(json.tabela);
      }
    } catch (e) {}
  }, [botUrl]);

  // Carregar configurações do fluxo de anúncios do robô
  const carregarFluxoAnuncio = useCallback(async () => {
    try {
      const res = await fetch(`${botUrl}/api/config/fluxo-anuncio`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.fluxoAnuncio) {
          setFluxoAnuncio(json.fluxoAnuncio);
          setGatilhosInput((json.fluxoAnuncio.gatilhos || []).join(', '));
        }
      }
    } catch (e) {}
  }, [botUrl]);

  // Carregar configurações de notificação do site (apenas uma vez no carregamento inicial)
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
          if (cfg.fluxoAnuncio) {
            setFluxoAnuncio(cfg.fluxoAnuncio);
            setGatilhosInput((cfg.fluxoAnuncio.gatilhos || []).join(', '));
          }
        } else if (data.chatbot_admin_phone) {
          setAdminPhone(data.chatbot_admin_phone);
        }
        configLoadedRef.current = true;
      }
    } catch (e) {}
  }, []);

  // Verificar suporte e status de Push no Navegador / iPhone
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        setPushStatus('unsupported');
      } else {
        setPushStatus(Notification.permission as any);
        navigator.serviceWorker.ready.then((reg) => {
          reg.pushManager.getSubscription().then((sub) => {
            setIsSubscribed(!!sub);
          });
        });
      }
    }
  }, []);

  useEffect(() => {
    carregarStatus();
    carregarTabela();
    carregarFluxoAnuncio();
    carregarConfiguracoes();
    const interval = setInterval(carregarStatus, 4000);
    return () => clearInterval(interval);
  }, [carregarStatus, carregarTabela, carregarFluxoAnuncio, carregarConfiguracoes]);

  // Salvar Fluxo de Anúncios no Robô
  const salvarFluxoAnuncio = async () => {
    try {
      setActionLoading(true);
      const gatilhosArray = gatilhosInput
        .split(',')
        .map((g) => g.trim().toLowerCase())
        .filter(Boolean);

      const payload: FluxoAnuncioConfig = {
        ...fluxoAnuncio,
        gatilhos: gatilhosArray.length > 0 ? gatilhosArray : fluxoAnuncio.gatilhos
      };

      const res = await fetch(`${botUrl}/api/config/fluxo-anuncio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Fluxo de anúncio atualizado com sucesso no robô!');
        setFluxoAnuncio(payload);
      } else {
        toast.error('Erro ao salvar fluxo no robô.');
      }
    } catch (e) {
      toast.error('Erro ao conectar com o robô.');
    } finally {
      setActionLoading(false);
    }
  };

  // Adicionar e remover gatilhos de forma interativa
  const adicionarGatilho = (novo?: string) => {
    const limpo = (novo !== undefined ? novo : novoGatilhoTexto).trim().toLowerCase();
    if (!limpo) return;
    if (fluxoAnuncio.gatilhos.includes(limpo)) {
      toast.warning('Este gatilho já está na lista.');
      return;
    }
    const novosGatilhos = [...fluxoAnuncio.gatilhos, limpo];
    setFluxoAnuncio({ ...fluxoAnuncio, gatilhos: novosGatilhos });
    setGatilhosInput(novosGatilhos.join(', '));
    setNovoGatilhoTexto('');
    toast.success(`Gatilho "${limpo}" adicionado!`);
  };

  const removerGatilho = (gatilhoRemover: string) => {
    const novosGatilhos = fluxoAnuncio.gatilhos.filter((g) => g !== gatilhoRemover);
    setFluxoAnuncio({ ...fluxoAnuncio, gatilhos: novosGatilhos });
    setGatilhosInput(novosGatilhos.join(', '));
  };

  // Aplicar modelo pré-configurado
  const aplicarTemplateAnuncio = (tipo: 'esportivo' | 'algodao' | 'corporativo' | 'terceirao') => {
    if (tipo === 'esportivo') {
      const template: FluxoAnuncioConfig = {
        ativo: true,
        tituloCampanha: 'Camisetas Esportivas / Interclasse',
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
          'esportiva',
          'uniforme esportivo',
          'camisa de time',
          'torcida'
        ],
        mensagem: `👋 *{saudacao}! Que massa ter você por aqui!* 🏆⚽👕\n\nBora montar o uniforme/camisetas personalizadas do seu time ou evento!\n\n📋 *Para eu calcular o valor certinho para você agora mesmo, me conta rapidinho:* \n\n1️⃣ *Qual modelo você procura?* (Ex: Camiseta Dry-Fit manga curta ou Conjunto Camisa + Calção)\n2️⃣ *Quantas peças você precisa aproximadamente?* (Ex: 10, 20, 50 peças)\n3️⃣ *Para qual time ou evento?* (Ex: Interclasse, Time de Futebol/Vôlei, Corrida, Empresa, Academia)\n4️⃣ *Já tem a arte ou logotipo?* (Sim / Não / Pode mandar a foto aqui)\n5️⃣ *Vai querer Nome e Número individual em cada peça?* (Sim / Não)\n\n✍️ *Pode responder tudo junto em uma mensagem* que já calculamos sua cotação na hora! 🚀\n\n_Se preferir ver outras opções, digite *menu* a qualquer momento._`
      };
      setFluxoAnuncio(template);
      setGatilhosInput(template.gatilhos.join(', '));
      toast.success('Modelo de Camisetas Esportivas aplicado!');
    } else if (tipo === 'algodao') {
      const template: FluxoAnuncioConfig = {
        ativo: true,
        tituloCampanha: 'Camisetas 100% Algodão Premium',
        gatilhos: [
          'vi o anuncio de camiseta',
          'anuncio camiseta algodao',
          'anuncio algodao',
          'promoção camiseta',
          'promocao camiseta',
          'camiseta personalizada algodao'
        ],
        mensagem: `👋 *{saudacao}! Seja muito bem-vindo(a) à Tenório Confecções!* 🧵✨\n\nVi que você tem interesse nas nossas *Camisetas 100% Algodão Premium*!\n\n📋 *Para eu montar seu orçamento com as melhores condições, me conta:* \n\n1️⃣ *Quantas camisetas você precisa aproximadamente?* (Ex: 10, 20, 50, 100+ un)\n2️⃣ *Qual a cor principal desejada?* (Ex: Branca, Preta, Colorida)\n3️⃣ *Para qual finalidade?* (Ex: Evento, Marca própria, Empresa, Presente)\n4️⃣ *Já possui a estampa/arte pronta?* (Sim / Não / Pode enviar aqui)\n5️⃣ *Qual o prazo que precisa das peças?*\n\n✍️ *Envie suas respostas aqui em uma única mensagem* que já calculamos o seu valor! 🚀`
      };
      setFluxoAnuncio(template);
      setGatilhosInput(template.gatilhos.join(', '));
      toast.success('Modelo de Camisetas de Algodão aplicado!');
    } else if (tipo === 'corporativo') {
      const template: FluxoAnuncioConfig = {
        ativo: true,
        tituloCampanha: 'Uniformes Corporativos & Polos',
        gatilhos: [
          'anuncio uniforme empresa',
          'anuncio camisa polo',
          'anuncio corporativo',
          'uniforme empresarial',
          'polo bordada'
        ],
        mensagem: `👋 *{saudacao}! Seja bem-vindo(a) à Tenório Confecções!* 👔💼\n\nEspecialistas em *Uniformes Corporativos de Alta Durabilidade* (Polos Piquet, Camisas Sociais, Moletons e Jalecos com Bordado Computadorizado).\n\n📋 *Para montarmos a proposta comercial para sua empresa:* \n\n1️⃣ *Qual modelo de uniforme?* (Ex: Camisa Polo Piquet, Camiseta Algodão, Colete)\n2️⃣ *Qual a quantidade estimada?* (Ex: 15, 30, 60 peças)\n3️⃣ *Nome da sua empresa / cidade:*\n4️⃣ *Deseja logotipo bordado ou estampado?* (Bordado / Silk / DTF)\n5️⃣ *Qual o prazo desejado para entrega?*\n\n✍️ *Envie essas informações* para enviarmos sua cotação formalizada! 🚀`
      };
      setFluxoAnuncio(template);
      setGatilhosInput(template.gatilhos.join(', '));
      toast.success('Modelo Corporativo aplicado!');
    } else if (tipo === 'terceirao') {
      const template: FluxoAnuncioConfig = {
        ativo: true,
        tituloCampanha: 'Terceirão & Formaturas',
        gatilhos: [
          'anuncio terceirao',
          'anúncio terceirão',
          'camisa terceirao',
          'moletom terceirao',
          'interclasse formatura'
        ],
        mensagem: `👋 *{saudacao}! Fala terceirão, tudo bem?* 🎓✨🏆\n\nBora fazer o manto da formatura / terceirão mais pesado da escola!\n\n📋 *Para eu calcular os valores com desconto de turma, me responde rapidinho:* \n\n1️⃣ *Qual peça a turma quer fazer?* (Ex: Camiseta 100% Algodão, Moletom Canguru com Capuz, Corta-Vento)\n2️⃣ *Quantos alunos na turma aproximadamente?* (Ex: 25, 40, 60 pessoas)\n3️⃣ *Nome da escola / cidade:*\n4️⃣ *Já têm o desenho/tema ou querem que a gente crie o layout virtual?*\n5️⃣ *Vai ter nome e número de cada formando?* (Sim / Não)\n\n✍️ *Manda aqui em uma única mensagem* que já calculamos a cotação por aluno! 🚀`
      };
      setFluxoAnuncio(template);
      setGatilhosInput(template.gatilhos.join(', '));
      toast.success('Modelo de Terceirão aplicado!');
    }
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
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Megaphone className="h-4 w-4 text-pink-300" />
            Fluxo Anúncios (ADS)
            {fluxoAnuncio.ativo && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
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

      {/* ABA: FLUXO DE ANÚNCIOS (ADS / FACEBOOK / INSTAGRAM) */}
      {activeTab === 'anuncio' && (
        <div className="space-y-6">
          {/* HEADER DA CAMPANHA & STATUS */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-lg shadow-pink-500/10">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    Fluxo de Entrada para Anúncios (ADS)
                    {fluxoAnuncio.ativo ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Ativo
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Desativado
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure as mensagens automáticas e perguntas de qualificação quando o cliente vier de campanhas do Facebook, Instagram ou WhatsApp.
                  </p>
                </div>
              </div>

              {/* TOGGLE STATUS & SALVAR */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fluxoAnuncio.ativo}
                    onChange={(e) => setFluxoAnuncio({ ...fluxoAnuncio, ativo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  <span className="ml-3 text-xs font-medium text-slate-300">
                    {fluxoAnuncio.ativo ? 'Fluxo Habilitado' : 'Fluxo Desabilitado'}
                  </span>
                </label>

                <button
                  onClick={salvarFluxoAnuncio}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 shadow-lg shadow-pink-600/25 transition disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar Fluxo
                </button>
              </div>
            </div>

            {/* MODELOS RÁPIDOS / TEMPLATES */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Carregar Modelo Pré-Configurado (1 Clique)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => aplicarTemplateAnuncio('esportivo')}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/50 text-left transition group"
                >
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-pink-400 flex items-center gap-2">
                    ⚽ Esportivo / Interclasse
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Dry-Fit, fardamentos, numeração individual e eventos esportivos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => aplicarTemplateAnuncio('algodao')}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/50 text-left transition group"
                >
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-pink-400 flex items-center gap-2">
                    👕 100% Algodão Premium
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Camisetas personalizadas, marcas próprias e eventos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => aplicarTemplateAnuncio('corporativo')}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/50 text-left transition group"
                >
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-pink-400 flex items-center gap-2">
                    👔 Corporativo & Polos
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Polos bordadas, uniformes de empresas e atendimento B2B.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => aplicarTemplateAnuncio('terceirao')}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/50 text-left transition group"
                >
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-pink-400 flex items-center gap-2">
                    🎓 Terceirão & Turmas
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Moletons, camisetas de formatura e interclasses escolares.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* PALAVRAS-CHAVE GATILHOS */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-400" />
                Gatilhos de Ativação Automática (Palavras e Frases)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Se a primeira mensagem do cliente contiver qualquer uma dessas palavras, o robô ativará este fluxo personalizado automaticamente.
              </p>
            </div>

            {/* TAGS ATUAIS */}
            <div className="flex flex-wrap gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl min-h-[52px] items-center">
              {fluxoAnuncio.gatilhos.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Nenhum gatilho cadastrado. Adicione abaixo.</span>
              ) : (
                fluxoAnuncio.gatilhos.map((gatilho, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 group hover:border-rose-500/40"
                  >
                    {gatilho}
                    <button
                      type="button"
                      onClick={() => removerGatilho(gatilho)}
                      className="text-slate-400 hover:text-rose-400 transition"
                      title="Remover gatilho"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* ADICIONAR NOVO GATILHO */}
            <div className="flex gap-2">
              <input
                type="text"
                value={novoGatilhoTexto}
                onChange={(e) => setNovoGatilhoTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    adicionarGatilho();
                  }
                }}
                placeholder="Ex: vi no insta, vi o anúncio, quero fazer camisa de time..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={() => adicionarGatilho()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Gatilho
              </button>
            </div>
          </div>

          {/* GRID: EDITOR DE MENSAGEM & PREVIEW DO WHATSAPP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* COLUNA ESQUERDA: EDITOR */}
            <div className="lg:col-span-7 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Edit2 className="h-4 w-4 text-pink-400" />
                    Editor da Mensagem do Robô
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Personalize o texto, emojis e as perguntas enviadas para o cliente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFluxoAnuncio({
                      ...fluxoAnuncio,
                      mensagem: fluxoAnuncio.mensagem + ' {saudacao}'
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition"
                  title="Inserir variável de saudação dinâmica (Bom dia / Boa tarde / Boa noite)"
                >
                  <Plus className="h-3 w-3" />
                  + {'{saudacao}'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Nome / Título da Campanha:
                </label>
                <input
                  type="text"
                  value={fluxoAnuncio.tituloCampanha}
                  onChange={(e) => setFluxoAnuncio({ ...fluxoAnuncio, tituloCampanha: e.target.value })}
                  placeholder="Ex: Campanha Interclasse Facebook ADS"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 mb-4"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Texto da Mensagem Inicial (WhatsApp Formatação):
                </label>
                <textarea
                  rows={14}
                  value={fluxoAnuncio.mensagem}
                  onChange={(e) => setFluxoAnuncio({ ...fluxoAnuncio, mensagem: e.target.value })}
                  placeholder="Digite a mensagem que o robô responderá..."
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 font-mono focus:outline-none focus:border-pink-500 leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-300 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5 text-blue-200">
                  <HelpCircle className="h-4 w-4 text-blue-400" />
                  Dicas de Inteligência do Robô:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Use <code className="text-pink-300 font-mono bg-slate-900 px-1 py-0.5 rounded">{'{saudacao}'}</code> para o bot saudar automaticamente com <i>Bom dia</i>, <i>Boa tarde</i> ou <i>Boa noite</i>.</li>
                  <li>Use <code className="text-pink-300 font-mono bg-slate-900 px-1 py-0.5 rounded">*texto*</code> para <b>negrito</b> e <code className="text-pink-300 font-mono bg-slate-900 px-1 py-0.5 rounded">_texto_</code> para <i>itálico</i>.</li>
                  <li>O robô lê a quantidade (ex: 20 peças) e aplica automaticamente o desconto progressivo da tabela de preços!</li>
                </ul>
              </div>
            </div>

            {/* COLUNA DIREITA: SIMULADOR WHATSAPP EM TEMPO REAL */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    Pré-visualização no WhatsApp
                  </h3>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Tempo Real
                  </span>
                </div>

                {/* CONTAINER MOCKUP WHATSAPP */}
                <div className="flex-1 bg-[#0b141a] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
                  {/* BARRA SUPERIOR WHATSAPP */}
                  <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                        TC
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                          Tenório Confecções
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 inline" />
                        </p>
                        <p className="text-[10px] text-emerald-400">online (Robô Ativo)</p>
                      </div>
                    </div>
                  </div>

                  {/* CORPO DA CONVERSA */}
                  <div
                    className="p-4 flex-1 overflow-y-auto space-y-3"
                    style={{
                      backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
                      backgroundSize: '16px 16px'
                    }}
                  >
                    {/* MENSAGEM DO CLIENTE (ANÚNCIO) */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] text-slate-100 text-xs p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-md">
                        <p>Olá! Vi o anúncio no Facebook e gostaria de saber mais informações e orçamentos.</p>
                        <div className="text-[9px] text-emerald-200/70 text-right mt-1 flex items-center justify-end gap-1">
                          <span>12:00</span>
                          <span>✓✓</span>
                        </div>
                      </div>
                    </div>

                    {/* RESPOSTA DO ROBÔ (FLUXO ANÚNCIO) */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] text-slate-100 text-xs p-3.5 rounded-2xl rounded-tl-none max-w-[92%] shadow-md border border-slate-700/30">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {fluxoAnuncio.mensagem
                            .replace(
                              /\{saudacao\}/g,
                              new Date().getHours() < 12
                                ? 'Bom dia'
                                : new Date().getHours() < 18
                                ? 'Boa tarde'
                                : 'Boa noite'
                            )
                            .split('\n')
                            .map((linha, idx) => {
                              // Formatação básica de negrito (*texto*) e itálico (_texto_)
                              let formatted = linha;
                              return (
                                <span key={idx}>
                                  {linha}
                                  <br />
                                </span>
                              );
                            })}
                        </div>
                        <div className="text-[9px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1">
                          <span>12:00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BARRA INFERIOR INPUT WHATSAPP */}
                  <div className="bg-[#202c33] px-3 py-2.5 flex items-center gap-2 border-t border-slate-800/60">
                    <div className="flex-1 bg-[#2a3942] rounded-xl px-3 py-1.5 text-xs text-slate-400">
                      Mensagem
                    </div>
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <Send className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={salvarFluxoAnuncio}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition"
                  >
                    <Check className="h-4 w-4" />
                    Publicar Alterações no Robô Agora
                  </button>
                </div>
              </div>
            </div>
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
    </div>
  );
}
