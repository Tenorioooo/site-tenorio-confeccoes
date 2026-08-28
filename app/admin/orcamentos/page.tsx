'use client';

import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Phone,
  FileText,
  Download,
  X,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Printer,
  ExternalLink,
  Tag,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Save,
  Check,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/pricing';

const DEFAULT_STATUSES = [
  { name: 'Recebido', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  { name: 'Em análise', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  { name: 'Aguardando informações', color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' },
  { name: 'Orçamento enviado', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
  { name: 'Aguardando aprovação', color: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
  { name: 'Arte aprovada', color: 'bg-teal-500/10 text-teal-300 border-teal-500/30' },
  { name: 'Em produção', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  { name: 'Pronto p/ Retirada', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  { name: 'Enviado p/ Transportadora', color: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
  { name: 'Finalizado', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  { name: 'Cancelado', color: 'bg-red-500/10 text-red-300 border-red-500/30' },
];

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Statuses list with local storage persistence
  const [statusList, setStatusList] = useState<any[]>(DEFAULT_STATUSES);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [newStatusInput, setNewStatusInput] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('purple');

  // Modals state
  const [selectedQuote, setSelectedQuote] = useState<any>(null); // View modal
  const [editModalOpen, setEditModalOpen] = useState(false); // Edit/Create modal
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [deleteConfirmQuote, setDeleteConfirmQuote] = useState<any>(null); // Delete modal

  // Edit form state
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('PE');
  const [formDesiredDate, setFormDesiredDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState('Recebido');
  const [formEstimatedTotal, setFormEstimatedTotal] = useState<number | string>('');
  const [formItems, setFormItems] = useState<any[]>([]);

  // Load custom statuses from localStorage
  useEffect(() => {
    try {
      const savedStatuses = localStorage.getItem('tenorio_quote_statuses_v2');
      if (savedStatuses) {
        setStatusList(JSON.parse(savedStatuses));
      }
    } catch (e) {
      console.error('Failed to load statuses', e);
    }
  }, []);

  const saveStatuses = (list: any[]) => {
    setStatusList(list);
    try {
      localStorage.setItem('tenorio_quote_statuses_v2', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomStatus = () => {
    const trimmed = newStatusInput.trim();
    if (!trimmed) return;
    if (statusList.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Este status já existe.');
      return;
    }

    const colorClasses: { [key: string]: string } = {
      purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      blue: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    };

    const newObj = {
      name: trimmed,
      color: colorClasses[newStatusColor] || colorClasses.purple,
    };

    const updated = [...statusList, newObj];
    saveStatuses(updated);
    setNewStatusInput('');
    toast.success(`Status "${trimmed}" criado com sucesso!`);
  };

  const handleRemoveCustomStatus = (statusName: string) => {
    const updated = statusList.filter((s) => s.name !== statusName);
    saveStatuses(updated);
    toast.success(`Status "${statusName}" removido.`);
  };

  // Helper to calculate total value of a quote
  const getQuoteTotal = (q: any): number => {
    if (q.estimatedTotal && Number(q.estimatedTotal) > 0) return Number(q.estimatedTotal);
    if (Array.isArray(q.items)) {
      return q.items.reduce((sum: number, it: any) => {
        if (it.totalPrice && Number(it.totalPrice) > 0) return sum + Number(it.totalPrice);
        const uPrice = Number(it.unitPrice) || 0;
        const qty = Number(it.quantity) || 1;
        return sum + uPrice * qty;
      }, 0);
    }
    return 0;
  };

  async function fetchQuotes() {
    setLoading(true);
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        setQuotes(await res.json());
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar orçamentos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Quick Status Change on table dropdown
  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Status alterado para "${newStatus}"!`);
        fetchQuotes();
        if (selectedQuote && selectedQuote.id === quoteId) {
          setSelectedQuote((prev: any) => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error('Erro ao atualizar status.');
      }
    } catch (e) {
      toast.error('Erro de conexão.');
    }
  };

  // Open Create New Quote Modal
  const openNewQuoteModal = () => {
    setEditingQuoteId(null);
    setFormCustomerName('');
    setFormWhatsapp('');
    setFormEmail('');
    setFormCity('');
    setFormState('PE');
    setFormDesiredDate('');
    setFormNotes('');
    setFormStatus('Recebido');
    setFormEstimatedTotal('');
    setFormItems([
      {
        productName: 'Camiseta Personalizada 100% Algodão',
        printCode: 'EST-001',
        quantity: 20,
        unitPrice: 35.0,
        totalPrice: 700.0,
        sizes: [{ size: 'M', quantity: 10 }, { size: 'G', quantity: 10 }],
      },
    ]);
    setEditModalOpen(true);
  };

  // Open Edit Quote Modal
  const openEditQuoteModal = (q: any) => {
    setEditingQuoteId(q.id);
    setFormCustomerName(q.customerName || '');
    setFormWhatsapp(q.whatsapp || '');
    setFormEmail(q.email || '');
    setFormCity(q.city || '');
    setFormState(q.state || 'PE');
    setFormDesiredDate(q.desiredDate || '');
    setFormNotes(q.notes || '');
    setFormStatus(q.status || 'Recebido');
    setFormEstimatedTotal(getQuoteTotal(q));

    // Normalize items
    const parsedItems = (q.items || []).map((it: any) => ({
      id: it.id,
      productName: it.productName || 'Produto',
      printCode: it.printCode || '',
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      totalPrice: Number(it.totalPrice) || (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
      customizationPositions: it.customizationPositions ? (typeof it.customizationPositions === 'string' ? JSON.parse(it.customizationPositions) : it.customizationPositions) : ['Frente'],
      sizes: it.sizes || [],
      hasCustomArt: it.hasCustomArt,
    }));

    setFormItems(parsedItems);
    setEditModalOpen(true);
  };

  // Duplicate Quote
  const handleDuplicateQuote = (q: any) => {
    setEditingQuoteId(null);
    setFormCustomerName(`${q.customerName} (Cópia)`);
    setFormWhatsapp(q.whatsapp || '');
    setFormEmail(q.email || '');
    setFormCity(q.city || '');
    setFormState(q.state || 'PE');
    setFormDesiredDate(q.desiredDate || '');
    setFormNotes(q.notes || '');
    setFormStatus('Recebido');
    setFormEstimatedTotal(getQuoteTotal(q));

    const parsedItems = (q.items || []).map((it: any) => ({
      productName: it.productName || 'Produto',
      printCode: it.printCode || '',
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      totalPrice: Number(it.totalPrice) || (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
      customizationPositions: it.customizationPositions ? (typeof it.customizationPositions === 'string' ? JSON.parse(it.customizationPositions) : it.customizationPositions) : ['Frente'],
      sizes: it.sizes || [],
      hasCustomArt: it.hasCustomArt,
    }));

    setFormItems(parsedItems);
    setEditModalOpen(true);
    toast.success('Dados duplicados no formulário. Revise e salve.');
  };

  // Recalculate estimated total from form items
  const recalculateFormTotal = (itemsList: any[]) => {
    const sum = itemsList.reduce((acc, it) => {
      const itTotal = Number(it.totalPrice) || (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1);
      return acc + itTotal;
    }, 0);
    setFormEstimatedTotal(sum);
  };

  // Save Edit / Create Submit
  const handleSaveQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCustomerName.trim() || !formWhatsapp.trim()) {
      toast.error('Nome do cliente e WhatsApp são obrigatórios.');
      return;
    }

    if (formItems.length === 0) {
      toast.error('Adicione pelo menos um item ao orçamento.');
      return;
    }

    const payload = {
      customerName: formCustomerName.trim(),
      whatsapp: formWhatsapp.trim(),
      email: formEmail.trim() || undefined,
      city: formCity.trim() || undefined,
      state: formState.trim() || undefined,
      desiredDate: formDesiredDate.trim() || undefined,
      notes: formNotes.trim() || undefined,
      status: formStatus,
      estimatedTotal: formEstimatedTotal !== '' ? Number(formEstimatedTotal) : undefined,
      items: formItems,
    };

    try {
      if (editingQuoteId) {
        const res = await fetch(`/api/quotes/${editingQuoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          toast.success('Orçamento atualizado com sucesso!');
          setEditModalOpen(false);
          fetchQuotes();
          if (selectedQuote && selectedQuote.id === editingQuoteId) {
            const updatedData = await res.json();
            setSelectedQuote(updatedData);
          }
        } else {
          const err = await res.json();
          toast.error(err.error || 'Erro ao atualizar orçamento.');
        }
      } else {
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          toast.success(`Orçamento ${data.quoteCode} criado com sucesso!`);
          setEditModalOpen(false);
          fetchQuotes();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Erro ao criar orçamento.');
        }
      }
    } catch {
      toast.error('Erro de conexão ao salvar orçamento.');
    }
  };

  // Delete Quote
  const handleDeleteQuote = async () => {
    if (!deleteConfirmQuote) return;

    try {
      const res = await fetch(`/api/quotes/${deleteConfirmQuote.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Orçamento ${deleteConfirmQuote.quoteCode} excluído.`);
        setDeleteConfirmQuote(null);
        if (selectedQuote && selectedQuote.id === deleteConfirmQuote.id) {
          setSelectedQuote(null);
        }
        fetchQuotes();
      } else {
        toast.error('Erro ao excluir orçamento.');
      }
    } catch {
      toast.error('Erro de conexão ao excluir.');
    }
  };

  // WhatsApp Proposal Message Generator
  const generateWhatsAppProposalLink = (q: any) => {
    const total = getQuoteTotal(q);
    let msg = `Olá, *${q.customerName}*! Tudo bem?\n\n`;
    msg += `Aqui é da equipe da *Tenório Confecções*. Segue a proposta atualizada para sua solicitação *#${q.quoteCode}*:\n\n`;

    (q.items || []).forEach((it: any, idx: number) => {
      const itTotal = it.totalPrice || (it.unitPrice ? it.unitPrice * it.quantity : 0);
      msg += `*${idx + 1}. ${it.productName}*\n`;
      msg += `   • Quantidade: ${it.quantity} un\n`;
      if (it.unitPrice && it.unitPrice > 0) {
        msg += `   • Valor: R$ ${Number(it.unitPrice).toFixed(2).replace('.', ',')}/un = R$ ${Number(itTotal).toFixed(2).replace('.', ',')}\n`;
      }
      if (it.printCode) msg += `   • Estampa: ${it.printCode}\n`;
    });

    if (total > 0) {
      msg += `\n💰 *VALOR TOTAL ESTIMADO: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
    }
    if (q.desiredDate) {
      msg += `📅 *Prazo Previsto:* ${q.desiredDate}\n`;
    }
    msg += `\nPodemos dar andamento na confecção do seu pedido? Qualquer dúvida estamos à disposição!`;

    const phone = q.whatsapp.replace(/\D/g, '');
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Filtered quotes list
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      search === '' ||
      q.quoteCode.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase()) ||
      q.whatsapp.toLowerCase().includes(search.toLowerCase()) ||
      (q.city && q.city.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Painel de Vendas & Atendimento</span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-4xl text-white">Gestão de Orçamentos</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Edite propostas, altere valores em R$, gerencie novos status e envie respostas direto para o WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Manager Button */}
          <button
            type="button"
            onClick={() => setShowStatusManager(!showStatusManager)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Tag className="w-4 h-4 text-purple-400" />
            <span>Gerenciar Status ({statusList.length})</span>
          </button>

          {/* New Quote Button */}
          <button
            type="button"
            onClick={openNewQuoteModal}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ NOVO ORÇAMENTO</span>
          </button>
        </div>
      </div>

      {/* ── STATUS MANAGER DRAWER (COLLAPSIBLE) ── */}
      {showStatusManager && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Criar & Gerenciar Status de Orçamento</h3>
            </div>
            <button
              onClick={() => setShowStatusManager(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              Fechar ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Ex: Aguardando Pagamento, Pronto p/ Envio..."
                value={newStatusInput}
                onChange={(e) => setNewStatusInput(e.target.value)}
                className="w-full sm:flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-400 focus:outline-none"
              />

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-bold">Cor:</span>
                <select
                  value={newStatusColor}
                  onChange={(e) => setNewStatusColor(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none cursor-pointer"
                >
                  <option value="purple">Roxo</option>
                  <option value="blue">Azul</option>
                  <option value="emerald">Verde</option>
                  <option value="amber">Amarelo / Laranja</option>
                  <option value="rose">Rosa / Vermelho</option>
                  <option value="cyan">Ciano</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddCustomStatus}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-all shrink-0"
                >
                  + Adicionar Status
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {statusList.map((st) => (
                <span
                  key={st.name}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${st.color || 'bg-slate-950 text-slate-300 border-slate-800'}`}
                >
                  <span>{st.name}</span>
                  {statusList.length > 3 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomStatus(st.name)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Excluir este status"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH & STATUS FILTER BAR ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por código, cliente ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-blue-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 shrink-0">Filtrar:</span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              statusFilter === 'all'
                ? 'bg-blue-500 text-slate-950 border-blue-400 shadow'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Todos ({quotes.length})
          </button>
          {statusList.map((st) => {
            const count = quotes.filter((q) => q.status === st.name).length;
            if (count === 0 && statusFilter !== st.name) return null;
            return (
              <button
                key={st.name}
                type="button"
                onClick={() => setStatusFilter(st.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  statusFilter === st.name
                    ? 'bg-blue-500 text-slate-950 border-blue-400 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {st.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN QUOTES TABLE ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs">Carregando orçamentos...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-3">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-700" />
            <p className="text-sm font-bold text-slate-400">Nenhum orçamento encontrado.</p>
            <p className="text-xs text-slate-600">Tente ajustar a busca ou crie uma nova cotação.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 min-w-[900px]">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4 rounded-tl-2xl">Código</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">Local / Prazo</th>
                  <th className="p-4">Itens</th>
                  <th className="p-4">Valor Estimado</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center rounded-tr-2xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQuotes.map((q) => {
                  const totalVal = getQuoteTotal(q);
                  const statusObj = statusList.find((s) => s.name === q.status);
                  const badgeColor = statusObj ? statusObj.color : 'bg-slate-950 text-slate-300 border-slate-800';

                  return (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-4 font-mono font-bold text-blue-400">
                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="hover:underline text-left"
                          title="Clique para ver detalhes"
                        >
                          {q.quoteCode}
                        </button>
                      </td>
                      <td className="p-4 font-bold text-white">
                        <div>{q.customerName}</div>
                        {q.email && <div className="text-[10px] text-slate-500 font-normal">{q.email}</div>}
                      </td>
                      <td className="p-4">
                        <a
                          href={`https://wa.me/55${q.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1.5"
                          title="Abrir WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{q.whatsapp}</span>
                        </a>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div>{q.city || '-'} / {q.state || '-'}</div>
                        {q.desiredDate && (
                          <div className="text-[10px] text-blue-400/80 font-bold">Prazo: {q.desiredDate}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-200">{q.items?.length || 0} produto(s)</span>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-emerald-400 text-sm">
                          {totalVal > 0 ? formatCurrency(totalVal) : 'A calcular'}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={q.status}
                          onChange={(e) => handleStatusChange(q.id, e.target.value)}
                          className={`border rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer ${badgeColor}`}
                        >
                          {statusList.map((st) => (
                            <option key={st.name} value={st.name} className="bg-slate-900 text-white font-medium">
                              {st.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* WhatsApp Proposal Button */}
                          <a
                            href={generateWhatsAppProposalLink(q)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all"
                            title="Enviar proposta formatada via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* View Details */}
                          <button
                            onClick={() => setSelectedQuote(q)}
                            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
                            title="Visualizar orçamento"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Quote */}
                          <button
                            onClick={() => openEditQuoteModal(q)}
                            className="p-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all"
                            title="Editar orçamento"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicateQuote(q)}
                            className="p-2 text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all"
                            title="Duplicar proposta"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmQuote(q)}
                            className="p-2 text-slate-500 hover:text-red-400 bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-xl transition-all"
                            title="Excluir orçamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL 1: VIEW QUOTE DETAILS ── */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Orçamento</span>
                  <h3 className="font-mono font-bold text-2xl text-blue-400">{selectedQuote.quoteCode}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl"
                  title="Imprimir"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedQuote(null)} className="text-slate-400 hover:text-white p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Customer & Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <p className="text-slate-500 font-bold uppercase tracking-wider">Cliente:</p>
                <p className="font-bold text-white text-sm">{selectedQuote.customerName}</p>
                <p className="text-emerald-400 font-medium">{selectedQuote.whatsapp}</p>
                {selectedQuote.email && <p className="text-slate-400">{selectedQuote.email}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 font-bold uppercase tracking-wider">Local & Prazo:</p>
                <p className="text-slate-200">{selectedQuote.city || '-'} - {selectedQuote.state || '-'}</p>
                <p className="text-blue-400 font-bold">Prazo: {selectedQuote.desiredDate || 'Não informado'}</p>
                <div className="pt-1">
                  <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold text-[10px]">
                    Status: {selectedQuote.status}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 font-bold uppercase tracking-wider">Valor Estimado Total:</p>
                <p className="font-extrabold text-emerald-400 text-xl">
                  {formatCurrency(getQuoteTotal(selectedQuote))}
                </p>
                <p className="text-slate-500 text-[10px]">Baseado nas faixas de quantidade</p>
              </div>
            </div>

            {/* Products Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Produtos Solicitados ({selectedQuote.items?.length || 0}):</h4>
              <div className="space-y-3">
                {selectedQuote.items?.map((item: any) => {
                  const itTotal = item.totalPrice || (item.unitPrice ? item.unitPrice * item.quantity : 0);
                  return (
                    <div key={item.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm">{item.productName}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-300">{item.quantity} unidades</span>
                          {item.unitPrice && item.unitPrice > 0 ? (
                            <span className="font-extrabold text-emerald-400">
                              {formatCurrency(itTotal)} ({formatCurrency(item.unitPrice)}/un)
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {item.printCode && (
                        <p className="text-xs text-blue-400">
                          Estampa do Catálogo: <span className="font-bold">{item.printCode}</span>
                        </p>
                      )}

                      {item.hasCustomArt && (
                        <p className="text-xs text-emerald-400 font-semibold">
                          Cliente anexou arte própria para este item
                        </p>
                      )}

                      {item.sizes && item.sizes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-slate-500 font-bold">Grade:</span>
                          {item.sizes.map((s: any) => (
                            <span key={s.id || s.size} className="bg-slate-900 px-2 py-0.5 rounded-lg text-slate-200 border border-slate-800 text-[11px] font-bold">
                              {s.size}: {s.quantity} un
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Uploaded Files */}
            {selectedQuote.files && selectedQuote.files.length > 0 && (
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <h4 className="font-bold text-white text-sm">Arquivos de Arte Enviados pelo Cliente:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedQuote.files.map((file: any) => (
                    <a
                      key={file.id}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-blue-400 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate text-white font-medium">{file.originalName}</span>
                      </div>
                      <Download className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedQuote.notes && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-500 font-bold block">Observações do Cliente:</span>
                <p className="text-slate-300 italic">{selectedQuote.notes}</p>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <a
                href={generateWhatsAppProposalLink(selectedQuote)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>RESPONDER NO WHATSAPP</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const q = selectedQuote;
                    setSelectedQuote(null);
                    openEditQuoteModal(q);
                  }}
                  className="inline-flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3.5 py-2 rounded-xl text-xs font-bold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Dados</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT / CREATE QUOTE MODAL ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                  <Edit2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-white">
                    {editingQuoteId ? 'Editar Dados do Orçamento' : 'Cadastrar Novo Orçamento Manual'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modifique dados do cliente, ajuste o valor financeiro ou renegocie itens.
                  </p>
                </div>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveQuoteSubmit} className="space-y-6 text-xs">
              {/* Customer Fields Grid */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">1. Dados do Cliente:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Nome do Cliente *</label>
                    <input
                      type="text"
                      required
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={formWhatsapp}
                      onChange={(e) => setFormWhatsapp(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">E-mail</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Cidade</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Estado</label>
                    <input
                      type="text"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-400 focus:outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Prazo Desejado</label>
                    <input
                      type="text"
                      value={formDesiredDate}
                      onChange={(e) => setFormDesiredDate(e.target.value)}
                      placeholder="Ex: 15/09/2026 ou 10 dias"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Financial Settings */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">2. Status & Valor Financeiro:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Status do Orçamento:</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-400 focus:outline-none cursor-pointer"
                    >
                      {statusList.map((st) => (
                        <option key={st.name} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-bold block">Valor Total Estimado (R$):</label>
                      <button
                        type="button"
                        onClick={() => recalculateFormTotal(formItems)}
                        className="text-[10px] text-blue-400 hover:underline font-bold"
                      >
                        Recalcular dos Itens
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={formEstimatedTotal}
                        onChange={(e) => setFormEstimatedTotal(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-emerald-400 font-extrabold focus:border-emerald-400 focus:outline-none"
                        placeholder="700.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List Editor */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">3. Itens do Orçamento:</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [
                        ...formItems,
                        {
                          productName: 'Novo Produto Personalizado',
                          printCode: '',
                          quantity: 10,
                          unitPrice: 30.0,
                          totalPrice: 300.0,
                          sizes: [{ size: 'M', quantity: 10 }],
                        },
                      ];
                      setFormItems(updated);
                      recalculateFormTotal(updated);
                    }}
                    className="inline-flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-xl font-bold text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5 space-y-1">
                          <label className="text-[11px] text-slate-400 font-bold block">Produto:</label>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => {
                              const updated = formItems.map((it, i) =>
                                i === idx ? { ...it, productName: e.target.value } : it
                              );
                              setFormItems(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-blue-400 focus:outline-none font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] text-slate-400 font-bold block">Qtd:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = Number(e.target.value);
                              const uPrice = Number(item.unitPrice) || 0;
                              const updated = formItems.map((it, i) =>
                                i === idx ? { ...it, quantity: qty, totalPrice: qty * uPrice } : it
                              );
                              setFormItems(updated);
                              recalculateFormTotal(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-blue-400 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] text-slate-400 font-bold block">Preço/un:</label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const uPrice = Number(e.target.value);
                              const qty = Number(item.quantity) || 1;
                              const updated = formItems.map((it, i) =>
                                i === idx ? { ...it, unitPrice: uPrice, totalPrice: qty * uPrice } : it
                              );
                              setFormItems(updated);
                              recalculateFormTotal(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 text-xs focus:border-emerald-400 focus:outline-none font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] text-slate-400 font-bold block">Subtotal:</label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.totalPrice}
                            onChange={(e) => {
                              const tot = Number(e.target.value);
                              const updated = formItems.map((it, i) =>
                                i === idx ? { ...it, totalPrice: tot } : it
                              );
                              setFormItems(updated);
                              recalculateFormTotal(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 text-xs focus:border-emerald-400 focus:outline-none font-bold"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-center pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formItems.filter((_, i) => i !== idx);
                              setFormItems(updated);
                              recalculateFormTotal(updated);
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-950 border border-slate-800 rounded-lg"
                            title="Remover item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Observações do Orçamento / Internas:</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Cliente solicitou entrega urgente para festa dia 20..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuoteId ? 'SALVAR ALTERAÇÕES' : 'CRIAR ORÇAMENTO'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DELETE CONFIRMATION ── */}
      {deleteConfirmQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">Excluir Orçamento?</h3>
              <p className="text-xs text-slate-400">
                Tem certeza que deseja excluir o orçamento{' '}
                <strong className="text-blue-400">{deleteConfirmQuote.quoteCode}</strong> de{' '}
                <strong className="text-white">{deleteConfirmQuote.customerName}</strong>?
              </p>
              <p className="text-[11px] text-red-400/80 pt-1">Esta ação não pode ser desfeita.</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmQuote(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteQuote}
                className="bg-red-600 hover:bg-red-500 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
