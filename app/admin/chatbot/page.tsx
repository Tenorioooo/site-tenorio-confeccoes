'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Bot,
  QrCode,
  RefreshCw,
  PowerOff,
  Plus,
  Edit3,
  Trash2,
  Tag,
  Save,
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Search,
  Check,
  X,
  Smartphone,
  Sparkles,
  Sliders,
  Layers,
  ArrowRight,
  UserCheck,
  Users,
  MessageCircle,
  ExternalLink,
  PhoneCall,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';

interface Variacao {
  nome: string;
  termos: string[];
  preco: number;
}

interface Produto {
  nome: string;
  termos: string[];
  precoBase: number;
  prazoConfeccao: string;
  quantidadeMinima?: number;
  quantidadeMinimaPorVariacao?: number;
  permiteDescontoProgressivo?: boolean;
  variacoes?: Variacao[];
}

interface FaixaDesconto {
  min: number;
  max: number;
  percentual: number;
  descricao: string;
}

interface TabelaPrecos {
  produtos: Produto[];
  precoPadrao: number;
  prazoPadrao: string;
  custoAdicionalPorLocalExtra: number;
  descontoProgressivo: FaixaDesconto[];
  informacoesPagamento: {
    forma: string;
    condicao: string;
    detalhesProducao?: string;
  };
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

interface BotStatus {
  status: 'INITIALIZING' | 'QR_READY' | 'CONNECTED' | 'DISCONNECTED';
  qrCode: string | null;
  info: {
    phone: string | null;
    name: string | null;
  };
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
}

const API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:3001';

export default function AdminChatbotPage() {
  const [activeTab, setActiveTab] = useState<'status' | 'aguardando' | 'produtos' | 'config' | 'simulador'>('status');
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [tabela, setTabela] = useState<TabelaPrecos | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchClientes, setSearchClientes] = useState('');
  const [filtroStatusCliente, setFiltroStatusCliente] = useState<'TODOS' | 'AGUARDANDO' | 'ATENDIDO'>('AGUARDANDO');

  // Modal de edição / criação
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [produtoForm, setProdutoForm] = useState<Produto>({
    nome: '',
    termos: [],
    precoBase: 39.9,
    prazoConfeccao: '15 a 20 dias úteis',
    quantidadeMinima: 1,
    permiteDescontoProgressivo: true,
    variacoes: [],
  });
  const [novoTermoInput, setNovoTermoInput] = useState('');

  // Simulador
  const [simulacaoResultado, setSimulacaoResultado] = useState<string | null>(null);
  const [simulando, setSimulando] = useState(false);

  // Buscar status
  const carregarStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/status`);
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data);
      }
    } catch (e) {}
  }, []);

  // Buscar tabela
  const carregarTabela = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tabela`);
      if (res.ok) {
        const data = await res.json();
        setTabela(data.tabela);
      }
    } catch (e) {
      toast.error('Não foi possível conectar à API do Chatbot. Certifique-se de que "node chatbot.js" está rodando na porta 3001.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarStatus();
    carregarTabela();
    const interval = setInterval(carregarStatus, 3000);
    return () => clearInterval(interval);
  }, [carregarStatus, carregarTabela]);

  // Ações WhatsApp
  const reiniciarBot = async () => {
    try {
      const res = await fetch(`${API_URL}/api/restart`, { method: 'POST' });
      if (res.ok) {
        toast.success('Reiniciando robô... Aguarde a geração do novo QR Code.');
        carregarStatus();
      }
    } catch (e) {
      toast.error('Erro ao reiniciar o robô.');
    }
  };

  const desconectarBot = async () => {
    if (!confirm('Deseja realmente desconectar a sessão do WhatsApp?')) return;
    try {
      const res = await fetch(`${API_URL}/api/logout`, { method: 'POST' });
      if (res.ok) {
        toast.success('Sessão desconectada com sucesso!');
        carregarStatus();
      }
    } catch (e) {
      toast.error('Erro ao desconectar.');
    }
  };

  // Ações de Atendimento Humano
  const concluirAtendimento = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/atendimento/${id}/concluir`, { method: 'POST' });
      if (res.ok) {
        toast.success('Atendimento marcado como concluído!');
        carregarStatus();
      }
    } catch (e) {
      toast.error('Erro ao atualizar status do atendimento.');
    }
  };

  const removerAtendimento = async (id: string) => {
    if (!confirm('Remover este registro da lista?')) return;
    try {
      const res = await fetch(`${API_URL}/api/atendimento/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Registro removido com sucesso!');
        carregarStatus();
      }
    } catch (e) {
      toast.error('Erro ao remover registro.');
    }
  };

  // Modal Produto
  const abrirNovoProduto = () => {
    setEditandoIndex(null);
    setProdutoForm({
      nome: '',
      termos: [],
      precoBase: 39.9,
      prazoConfeccao: '15 a 20 dias úteis',
      quantidadeMinima: 1,
      permiteDescontoProgressivo: true,
      variacoes: [],
    });
    setNovoTermoInput('');
    setModalAberto(true);
  };

  const abrirEditarProduto = (prod: Produto, idx: number) => {
    setEditandoIndex(idx);
    setProdutoForm(JSON.parse(JSON.stringify(prod)));
    setNovoTermoInput('');
    setModalAberto(true);
  };

  const salvarProduto = async () => {
    if (!produtoForm.nome.trim()) {
      toast.error('Informe o nome do produto.');
      return;
    }

    try {
      let res;
      if (editandoIndex === null) {
        res = await fetch(`${API_URL}/api/produtos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(produtoForm),
        });
      } else {
        res = await fetch(`${API_URL}/api/produtos/${editandoIndex}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(produtoForm),
        });
      }

      if (res.ok) {
        toast.success(editandoIndex === null ? 'Produto adicionado com sucesso!' : 'Produto atualizado com sucesso!');
        setModalAberto(false);
        carregarTabela();
      } else {
        toast.error('Erro ao salvar produto.');
      }
    } catch (e) {
      toast.error('Falha de comunicação com a API.');
    }
  };

  const excluirProduto = async (idx: number, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/produtos/${idx}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Produto excluído com sucesso!');
        carregarTabela();
      }
    } catch (e) {
      toast.error('Erro ao excluir produto.');
    }
  };

  const salvarConfiguracoes = async () => {
    if (!tabela) return;
    try {
      const res = await fetch(`${API_URL}/api/tabela`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tabela),
      });
      if (res.ok) {
        toast.success('Configurações salvas com sucesso!');
      }
    } catch (e) {
      toast.error('Erro ao salvar configurações.');
    }
  };

  const testarCalculo = async () => {
    setSimulando(true);
    try {
      const res = await fetch(`${API_URL}/api/test-calculo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: 'SIM-TESTE-2026',
          cliente: 'Cliente Teste',
          itens: [
            {
              numero: '1',
              nome: 'Camiseta Personalizada 100% Algodão',
              quantidade: 25,
              grade: 'M: 15 | G: 10',
              estampa: 'Frente e Costas',
              locais: 'Frente e Costas',
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimulacaoResultado(data.resposta);
      }
    } catch (e) {
      setSimulacaoResultado('Erro ao executar simulação.');
    } finally {
      setSimulando(false);
    }
  };

  // Filtragem
  const produtosFiltrados = (tabela?.produtos || []).filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.termos.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const clientesAguardandoLista = (botStatus?.clientesAguardando || []).filter((c) => {
    const matchBusca =
      c.nome.toLowerCase().includes(searchClientes.toLowerCase()) ||
      c.telefone.includes(searchClientes) ||
      c.motivo.toLowerCase().includes(searchClientes.toLowerCase());

    if (!matchBusca) return false;
    if (filtroStatusCliente === 'TODOS') return true;
    return c.status === filtroStatusCliente;
  });

  const totalAguardandoHumano = (botStatus?.clientesAguardando || []).filter((c) => c.status === 'AGUARDANDO').length;

  // Formatador de Telefone
  const formatarTelefone = (tel: string) => {
    const limpo = tel.replace(/\D/g, '');
    if (limpo.startsWith('55') && limpo.length >= 12) {
      const ddd = limpo.slice(2, 4);
      const numero = limpo.slice(4);
      return `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
    }
    return limpo;
  };

  // Formatador de Data/Hora
  const formatarDataHora = (dataIso: string) => {
    try {
      const d = new Date(dataIso);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' (' + d.toLocaleDateString('pt-BR') + ')';
    } catch (e) {
      return dataIso;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Central do Chat Bot WhatsApp</h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Conexão em tempo real, fila de atendimento humano, catálogo de preços e simulação de orçamentos.
              </p>
            </div>
          </div>
        </div>

        {/* Badge Status */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl self-start md:self-auto">
          <span
            className={`w-3 h-3 rounded-full ${
              botStatus?.status === 'CONNECTED'
                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse'
                : botStatus?.status === 'QR_READY'
                ? 'bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse'
                : 'bg-rose-500'
            }`}
          />
          <div className="text-xs">
            <p className="font-bold text-slate-200">
              {botStatus?.status === 'CONNECTED'
                ? 'WhatsApp Conectado'
                : botStatus?.status === 'QR_READY'
                ? 'Aguardando Leitura QR'
                : 'Desconectado / Offline'}
            </p>
            {botStatus?.info?.phone && <p className="text-slate-400 font-mono">+{botStatus.info.phone}</p>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'status'
              ? 'bg-blue-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Conexão & Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('aguardando')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'aguardando'
              ? 'bg-blue-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Atendimento Humano</span>
          {totalAguardandoHumano > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full animate-bounce">
              {totalAguardandoHumano}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('produtos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'produtos'
              ? 'bg-blue-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Tabela de Produtos (${tabela?.produtos?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'config'
              ? 'bg-blue-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Descontos Progressivos</span>
        </button>

        <button
          onClick={() => setActiveTab('simulador')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'simulador'
              ? 'bg-blue-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulador</span>
        </button>
      </div>

      {/* ABA 1: CONEXÃO & MÉTRICAS */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Conexão */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              <span>Conexão WhatsApp Web</span>
            </h2>

            {botStatus?.status === 'CONNECTED' ? (
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-300">Robô Conectado e Respondendo!</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                    As mensagens recebidas no WhatsApp e orçamentos do site estão sendo processados automaticamente.
                  </p>
                </div>
                {botStatus.info?.phone && (
                  <div className="inline-block bg-slate-950 border border-slate-800 px-4 py-1.5 rounded-full text-xs text-slate-300">
                    Telefone Conectado: <span className="font-mono text-emerald-400 font-bold">+{botStatus.info.phone}</span>
                  </div>
                )}
                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={reiniciarBot}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reiniciar Robô</span>
                  </button>
                  <button
                    onClick={desconectarBot}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <PowerOff className="w-4 h-4" />
                    <span>Desconectar Sessão</span>
                  </button>
                </div>
              </div>
            ) : botStatus?.status === 'QR_READY' && botStatus.qrCode ? (
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-6 text-center space-y-4">
                <h3 className="text-base font-bold text-amber-300">Escaneie o QR Code com seu WhatsApp</h3>
                <p className="text-slate-400 text-xs">
                  Abra o WhatsApp &gt; Dispositivos Conectados &gt; Conectar Dispositivo e aponte para a tela:
                </p>
                <div className="inline-block p-4 bg-white rounded-2xl shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={botStatus.qrCode} alt="QR Code WhatsApp" className="w-60 h-60 object-contain mx-auto" />
                </div>
                <div>
                  <button
                    onClick={reiniciarBot}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Gerar Novo QR Code</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Aguardando Conexão do Robô...</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  Certifique-se de que o comando <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400 font-mono">node chatbot.js</code> está em execução na sua máquina.
                </p>
                <button
                  onClick={reiniciarBot}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-slate-950 rounded-xl text-xs font-extrabold transition"
                >
                  🚀 Forçar Inicialização
                </button>
              </div>
            )}
          </div>

          {/* Cards Métricas */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estatísticas do Chatbot</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400">Orçamentos Feitos</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{botStatus?.stats?.totalOrcamentos || 0}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400">Total Mensagens</p>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">{botStatus?.stats?.totalMensagens || 0}</p>
                </div>
              </div>

              {/* Destaque Atendimento Humano */}
              <div
                onClick={() => setActiveTab('aguardando')}
                className="bg-amber-950/20 border border-amber-800/40 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-950/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Aguardando Atendimento</p>
                    <p className="text-lg font-bold text-amber-300">
                      {totalAguardandoHumano} {totalAguardandoHumano === 1 ? 'cliente' : 'clientes'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  Ver Fila &rarr;
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Produtos no Catálogo</p>
                  <p className="text-lg font-bold text-slate-200">{tabela?.produtos?.length || 0} produtos</p>
                </div>
                <button
                  onClick={() => setActiveTab('produtos')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1.5 rounded-lg transition font-bold"
                >
                  Ver Todos &rarr;
                </button>
              </div>
            </div>

            {/* Últimos orçamentos */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Últimos Orçamentos Gerados</h3>
              {botStatus?.ultimosOrcamentos && botStatus.ultimosOrcamentos.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {botStatus.ultimosOrcamentos.map((orc, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">{orc.cliente}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{orc.codigo} • {orc.pecas} peças</p>
                      </div>
                      <p className="font-bold text-emerald-400 font-mono">
                        R$ {Number(orc.total).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">Nenhum orçamento registrado nesta sessão ainda.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: CLIENTES AGUARDANDO ATENDIMENTO HUMANO */}
      {activeTab === 'aguardando' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Fila de Clientes Aguardando Atendimento Humano</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Clientes que solicitaram falar com atendente ou precisam de atendimento personalizado.
              </p>
            </div>

            {/* Filtros de Status */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
              <button
                onClick={() => setFiltroStatusCliente('AGUARDANDO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filtroStatusCliente === 'AGUARDANDO'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Aguardando ({totalAguardandoHumano})
              </button>
              <button
                onClick={() => setFiltroStatusCliente('ATENDIDO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filtroStatusCliente === 'ATENDIDO'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Atendidos
              </button>
              <button
                onClick={() => setFiltroStatusCliente('TODOS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filtroStatusCliente === 'TODOS'
                    ? 'bg-blue-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
            </div>
          </div>

          {/* Campo de Busca por Cliente */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filtrar por nome, telefone ou motivo..."
              value={searchClientes}
              onChange={(e) => setSearchClientes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Lista / Tabela de Clientes */}
          {clientesAguardandoLista.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-4 font-bold">Cliente</th>
                    <th className="p-4 font-bold">WhatsApp / Telefone</th>
                    <th className="p-4 font-bold">Motivo da Solicitação</th>
                    <th className="p-4 font-bold">Horário</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clientesAguardandoLista.map((cli) => {
                    const numeroLimpo = cli.telefone.replace(/\D/g, '');
                    const linkWhatsApp = `https://wa.me/${numeroLimpo}`;

                    return (
                      <tr key={cli.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                              {cli.nome.charAt(0).toUpperCase()}
                            </div>
                            <span>{cli.nome}</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-slate-300 font-bold">
                          {formatarTelefone(cli.telefone)}
                        </td>

                        <td className="p-4 text-slate-300">
                          <span className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px] text-slate-300">
                            {cli.motivo}
                          </span>
                        </td>

                        <td className="p-4 text-slate-400 text-[11px] font-mono">
                          {formatarDataHora(cli.data)}
                        </td>

                        <td className="p-4">
                          {cli.status === 'AGUARDANDO' ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] bg-amber-950 text-amber-400 border border-amber-800/40 px-2.5 py-1 rounded-full font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Aguardando
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2.5 py-1 rounded-full font-bold">
                              ✓ Atendido
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          {/* Abrir WhatsApp */}
                          <a
                            href={linkWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Abrir Chat</span>
                          </a>

                          {cli.status === 'AGUARDANDO' && (
                            <button
                              onClick={() => concluirAtendimento(cli.id)}
                              className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold transition"
                              title="Marcar como Atendido"
                            >
                              ✓ Concluir
                            </button>
                          )}

                          <button
                            onClick={() => removerAtendimento(cli.id)}
                            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition"
                            title="Remover da lista"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-300">Nenhum cliente aguardando no momento!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando algum cliente solicitar um atendente humano pelo WhatsApp (Opção 5), ele aparecerá automaticamente aqui nesta lista.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: PRODUTOS */}
      {activeTab === 'produtos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por produto ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              onClick={abrirNovoProduto}
              className="bg-blue-500 hover:bg-blue-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">Carregando catálogo...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-4 font-bold">Produto</th>
                    <th className="p-4 font-bold">Preço Base</th>
                    <th className="p-4 font-bold">Prazo de Confecção</th>
                    <th className="p-4 font-bold">Desc. Progressivo</th>
                    <th className="p-4 font-bold">Variações</th>
                    <th className="p-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {produtosFiltrados.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <p className="font-bold text-slate-200">{prod.nome}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prod.termos.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                          {prod.termos.length > 3 && (
                            <span className="text-[10px] text-slate-500">+{prod.termos.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-emerald-400">
                        R$ {Number(prod.precoBase).toFixed(2).replace('.', ',')}
                      </td>

                      <td className="p-4 text-slate-300">{prod.prazoConfeccao}</td>

                      <td className="p-4">
                        {prod.permiteDescontoProgressivo !== false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2.5 py-1 rounded-full font-bold">
                            ✓ Sim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-rose-950 text-rose-400 border border-rose-800/40 px-2.5 py-1 rounded-full font-bold">
                            ✕ Fixo
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {prod.variacoes && prod.variacoes.length > 0 ? (
                          <span className="text-[11px] bg-blue-950 text-blue-300 border border-blue-800/40 px-2.5 py-1 rounded-full font-bold">
                            {prod.variacoes.length} variações
                          </span>
                        ) : (
                          <span className="text-slate-500">Sem variações</span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => abrirEditarProduto(prod, idx)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirProduto(idx, prod.nome)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ABA 4: DESCONTOS & CONFIGURAÇÕES */}
      {activeTab === 'config' && tabela && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8 max-w-4xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Configurações Gerais de Orçamento</h2>
              <p className="text-xs text-slate-400">Ajuste os valores padrão e a tabela de desconto progressivo por quantidade.</p>
            </div>
            <button
              onClick={salvarConfiguracoes}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Preço Padrão de Fallback (R$)</label>
              <input
                type="number"
                step="0.01"
                value={tabela.precoPadrao}
                onChange={(e) => setTabela({ ...tabela, precoPadrao: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Custo por Local Extra de Estampa (R$)</label>
              <input
                type="number"
                step="0.01"
                value={tabela.custoAdicionalPorLocalExtra}
                onChange={(e) =>
                  setTabela({ ...tabela, custoAdicionalPorLocalExtra: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Prazo de Confecção Padrão</label>
              <input
                type="text"
                value={tabela.prazoPadrao}
                onChange={(e) => setTabela({ ...tabela, prazoPadrao: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Faixas */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Faixas de Desconto Progressivo por Quantidade de Peças
            </h3>

            <div className="space-y-3">
              {tabela.descontoProgressivo.map((faixa, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase">Qtd Mínima</label>
                    <input
                      type="number"
                      value={faixa.min}
                      onChange={(e) => {
                        const novo = [...tabela.descontoProgressivo];
                        novo[idx].min = parseInt(e.target.value, 10) || 0;
                        setTabela({ ...tabela, descontoProgressivo: novo });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase">Qtd Máxima</label>
                    <input
                      type="number"
                      value={faixa.max}
                      onChange={(e) => {
                        const novo = [...tabela.descontoProgressivo];
                        novo[idx].max = parseInt(e.target.value, 10) || 0;
                        setTabela({ ...tabela, descontoProgressivo: novo });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase">Desconto (%)</label>
                    <input
                      type="number"
                      value={faixa.percentual}
                      onChange={(e) => {
                        const novo = [...tabela.descontoProgressivo];
                        novo[idx].percentual = parseInt(e.target.value, 10) || 0;
                        novo[idx].descricao = `${novo[idx].percentual}% de desconto`;
                        setTabela({ ...tabela, descontoProgressivo: novo });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-emerald-400 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase">Descrição</label>
                    <input
                      type="text"
                      value={faixa.descricao}
                      onChange={(e) => {
                        const novo = [...tabela.descontoProgressivo];
                        novo[idx].descricao = e.target.value;
                        setTabela({ ...tabela, descontoProgressivo: novo });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: SIMULADOR */}
      {activeTab === 'simulador' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Simular Orçamento em Tempo Real</span>
            </h2>
            <p className="text-xs text-slate-400">
              Execute o teste abaixo para verificar exatamente como o robô calcula os valores e monta a mensagem final enviada ao cliente:
            </p>
            <button
              onClick={testarCalculo}
              disabled={simulando}
              className="w-full bg-blue-500 hover:bg-blue-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-md transition disabled:opacity-50 text-xs"
            >
              {simulando ? 'Processando...' : '🚀 Testar Cálculo com Preços Atuais'}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mensagem Gerada no WhatsApp
            </h3>
            {simulacaoResultado ? (
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto">
                {simulacaoResultado}
              </pre>
            ) : (
              <div className="text-center py-16 text-slate-600 text-xs">
                Clique no botão ao lado para executar a simulação.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO / CRIAÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">
                {editandoIndex === null ? 'Adicionar Novo Produto' : `Editar: ${produtoForm.nome}`}
              </h3>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Nome do Produto *</label>
                <input
                  type="text"
                  value={produtoForm.nome}
                  onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                  placeholder="Ex: Caneca de Alumínio Personalizada"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Preço Base Unitário (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoForm.precoBase}
                    onChange={(e) => setProdutoForm({ ...produtoForm, precoBase: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Prazo de Confecção *</label>
                  <input
                    type="text"
                    value={produtoForm.prazoConfeccao}
                    onChange={(e) => setProdutoForm({ ...produtoForm, prazoConfeccao: e.target.value })}
                    placeholder="Ex: 15 a 20 dias úteis"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Pedido Mínimo (Unidades)</label>
                  <input
                    type="number"
                    value={produtoForm.quantidadeMinima || 1}
                    onChange={(e) => setProdutoForm({ ...produtoForm, quantidadeMinima: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-1">
                  <label className="font-bold text-slate-300">Desconto Progressivo</label>
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={produtoForm.permiteDescontoProgressivo !== false}
                      onChange={(e) => setProdutoForm({ ...produtoForm, permiteDescontoProgressivo: e.target.checked })}
                      className="w-4 h-4 accent-blue-500 rounded"
                    />
                    <span className="text-[11px] text-slate-300">
                      {produtoForm.permiteDescontoProgressivo !== false ? 'Aceita desconto por volume' : 'Preço fixo (sem desconto)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Termos de Busca */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300">Palavras-chave de Reconhecimento</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novoTermoInput}
                    onChange={(e) => setNovoTermoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (novoTermoInput.trim()) {
                          setProdutoForm({
                            ...produtoForm,
                            termos: [...produtoForm.termos, novoTermoInput.trim().toLowerCase()],
                          });
                          setNovoTermoInput('');
                        }
                      }
                    }}
                    placeholder="Digite uma palavra e aperte Enter"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (novoTermoInput.trim()) {
                        setProdutoForm({
                          ...produtoForm,
                          termos: [...produtoForm.termos, novoTermoInput.trim().toLowerCase()],
                        });
                        setNovoTermoInput('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {produtoForm.termos.map((t, i) => (
                    <span key={i} className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      {t}
                      <button
                        type="button"
                        onClick={() => setProdutoForm({ ...produtoForm, termos: produtoForm.termos.filter((_, idx) => idx !== i) })}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Variações */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-200">Variações de Preço (Tamanhos/Modelos)</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const novas = produtoForm.variacoes || [];
                      setProdutoForm({
                        ...produtoForm,
                        variacoes: [...novas, { nome: 'Nova Variação', termos: ['termo'], preco: produtoForm.precoBase }],
                      });
                    }}
                    className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 px-3 py-1 rounded-lg font-bold"
                  >
                    + Adicionar Variação
                  </button>
                </div>

                {produtoForm.variacoes && produtoForm.variacoes.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {produtoForm.variacoes.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <input
                          type="text"
                          value={v.nome}
                          onChange={(e) => {
                            const novas = [...produtoForm.variacoes!];
                            novas[i].nome = e.target.value;
                            setProdutoForm({ ...produtoForm, variacoes: novas });
                          }}
                          placeholder="Ex: 500ml"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={v.preco}
                          onChange={(e) => {
                            const novas = [...produtoForm.variacoes!];
                            novas[i].preco = parseFloat(e.target.value) || 0;
                            setProdutoForm({ ...produtoForm, variacoes: novas });
                          }}
                          placeholder="Preço R$"
                          className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const novas = produtoForm.variacoes!.filter((_, idx) => idx !== i);
                            setProdutoForm({ ...produtoForm, variacoes: novas });
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">Nenhuma variação específica. Será utilizado o preço base.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarProduto}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-slate-950 rounded-xl font-extrabold shadow-md"
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
