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
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ProdutoTabela {
  nome: string;
  categoria?: string;
  termosIdentificacao: string[];
  precoBaseUnitario: number;
  gradeTamanhos?: string[];
  coresDisponiveis?: string[];
  permiteDescontoProgressivo?: boolean;
  variacoes?: { termo: string; preco: number }[];
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
  };
}

export default function ChatbotAdminTab() {
  const [activeTab, setActiveTab] = useState<'status' | 'produtos' | 'humano' | 'notificacoes'>('status');
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

  // Estados de edição de produto
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [novoProdutoModal, setNovoProdutoModal] = useState(false);
  const [produtoForm, setProdutoForm] = useState<ProdutoTabela>({
    nome: '',
    categoria: '',
    termosIdentificacao: [],
    precoBaseUnitario: 0,
    gradeTamanhos: [],
    coresDisponiveis: [],
    permiteDescontoProgressivo: true,
    variacoes: [],
    observacoes: ''
  });

  // Campos auxiliares para inputs tipo tags / texto
  const [termosInput, setTermosInput] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [coresInput, setCoresInput] = useState('');
  const [variacoesInput, setVariacoesInput] = useState('');

  const carregarStatus = useCallback(async () => {
    try {
      const res = await fetch(`${botUrl}/api/status`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Servidor do bot offline');
      const json: StatusResponse = await res.json();
      setData(json);
      if (json.notificacoes) {
        if (adminPhone === '') setAdminPhone(json.notificacoes.adminPhone || '');
        setNotifHumano(json.notificacoes.notificarAtendimentoHumano !== false);
        setNotifOrcamento(json.notificacoes.notificarNovoOrcamento !== false);
        setNotifPush(json.notificacoes.notificarPushWeb !== false);
      }
    } catch (e: any) {
      // Se falhar a conexão direta, mantém os dados anteriores ou null
    } finally {
      setLoading(false);
    }
  }, [botUrl, adminPhone]);

  const carregarTabela = useCallback(async () => {
    try {
      const res = await fetch(`${botUrl}/api/tabela`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setTabela(json.tabela);
      }
    } catch (e) {}
  }, [botUrl]);

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
    carregarConfiguracoes();
    const interval = setInterval(carregarStatus, 4000);
    return () => clearInterval(interval);
  }, [carregarStatus, carregarTabela, carregarConfiguracoes]);

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

  // Carregar configurações de notificação do site
  const carregarConfiguracoes = useCallback(async () => {
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
        } else if (data.chatbot_admin_phone) {
          setAdminPhone(data.chatbot_admin_phone);
        } else if (data.whatsapp_number) {
          setAdminPhone((prev) => prev || data.whatsapp_number.replace(/[^0-9]/g, ''));
        }
      }
    } catch (e) {}
  }, []);

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
    setProdutoForm({ ...prod });
    setTermosInput((prod.termosIdentificacao || []).join(', '));
    setGradeInput((prod.gradeTamanhos || []).join(', '));
    setCoresInput((prod.coresDisponiveis || []).join(', '));
    setVariacoesInput(
      (prod.variacoes || []).map((v) => `${v.termo}: ${v.preco.toFixed(2)}`).join('\n')
    );
  };

  const abrirNovoProduto = () => {
    setEditingIndex(null);
    setProdutoForm({
      nome: '',
      categoria: 'Geral',
      termosIdentificacao: [],
      precoBaseUnitario: 0,
      gradeTamanhos: ['P', 'M', 'G', 'GG'],
      coresDisponiveis: ['Branco', 'Preto'],
      permiteDescontoProgressivo: true,
      variacoes: [],
      observacoes: ''
    });
    setTermosInput('');
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

    const variacoesParsed: { termo: string; preco: number }[] = [];
    if (variacoesInput.trim()) {
      const linhas = variacoesInput.split('\n');
      for (const linha of linhas) {
        const partes = linha.split(':');
        if (partes.length >= 2) {
          const termo = partes[0].trim();
          const preco = parseFloat(partes[1].replace(',', '.').trim());
          if (termo && !isNaN(preco)) {
            variacoesParsed.push({ termo, preco });
          }
        }
      }
    }

    const payload: ProdutoTabela = {
      ...produtoForm,
      termosIdentificacao: termos.length > 0 ? termos : [produtoForm.nome.toLowerCase()],
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
          toast.success('Produto atualizado com sucesso!');
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
          toast.success('Produto cadastrado com sucesso!');
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
                        {orc.pecas} peças • {new Date(orc.data).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-emerald-400">
                        {orc.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                          ⏰ Solicitado em: {new Date(cli.data).toLocaleString('pt-BR')}
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
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between"
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
                      <span className="font-bold text-emerald-400">
                        {prod.precoBaseUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Desconto Progressivo:</span>
                      <span
                        className={`font-semibold ${
                          prod.permiteDescontoProgressivo === false ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {prod.permiteDescontoProgressivo === false ? 'Não (Fixo)' : 'Sim (Por Volume)'}
                      </span>
                    </div>

                    {prod.variacoes && prod.variacoes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800/60">
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">Variações Cadastradas:</p>
                        <div className="space-y-1">
                          {prod.variacoes.map((v, vi) => (
                            <div key={vi} className="flex justify-between text-[11px] text-slate-300">
                              <span>• {v.termo}</span>
                              <span className="font-mono text-emerald-400">R$ {v.preco.toFixed(2)}</span>
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
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluirProduto(index)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100">
                {editingIndex !== null ? 'Editar Produto da Tabela' : 'Novo Produto para o Robô'}
              </h3>
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
                  placeholder="Ex: Camiseta Algodão 100%"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria:</label>
                  <input
                    type="text"
                    value={produtoForm.categoria}
                    onChange={(e) => setProdutoForm({ ...produtoForm, categoria: e.target.value })}
                    placeholder="Ex: Camisetas, Brindes, etc."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preço Base Unitário (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoForm.precoBaseUnitario}
                    onChange={(e) =>
                      setProdutoForm({ ...produtoForm, precoBaseUnitario: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Termos de Identificação (separados por vírgula):
                </label>
                <input
                  type="text"
                  value={termosInput}
                  onChange={(e) => setTermosInput(e.target.value)}
                  placeholder="Ex: algodao, algodão, camiseta algodao"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={produtoForm.permiteDescontoProgressivo !== false}
                    onChange={(e) =>
                      setProdutoForm({ ...produtoForm, permiteDescontoProgressivo: e.target.checked })
                    }
                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="font-semibold text-slate-200">Permitir Desconto Progressivo por Quantidade</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Desmarque para produtos com valores fixos independentes da quantidade (ex: Canecas, Wind Banners).
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Variações Específicas de Preço (uma por linha, formato: <code>Nome: Valor</code>):
                </label>
                <textarea
                  rows={3}
                  value={variacoesInput}
                  onChange={(e) => setVariacoesInput(e.target.value)}
                  placeholder={"400ml: 24.90\n500ml: 28.46\n700ml: 34.90"}
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
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
