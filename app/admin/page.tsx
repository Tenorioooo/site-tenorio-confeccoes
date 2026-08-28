'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Package,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Percent,
  Check
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { formatCurrency } from '@/lib/pricing';

type DateFilterType = 'today' | '7d' | '30d' | 'month' | 'all' | 'custom';

export default function AdminDashboardPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [printsCount, setPrintsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [dateFilter, setDateFilter] = useState<DateFilterType>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Chart view mode: financial (R$) vs count (Qtd)
  const [chartMetric, setChartMetric] = useState<'revenue' | 'count'>('revenue');

  async function loadData() {
    setLoading(true);
    try {
      const [qRes, pRes, prRes] = await Promise.all([
        fetch('/api/quotes'),
        fetch('/api/products'),
        fetch('/api/prints'),
      ]);

      if (qRes.ok) setQuotes(await qRes.json());
      if (pRes.ok) {
        const prods = await pRes.json();
        setProductsCount(prods.length);
      }
      if (prRes.ok) {
        const prs = await prRes.json();
        setPrintsCount(prs.length);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Helper to get helper quote total value
  const getQuoteTotal = (q: any): number => {
    if (q.estimatedTotal && Number(q.estimatedTotal) > 0) {
      return Number(q.estimatedTotal);
    }
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

  // Helper to get total pieces count in a quote
  const getQuotePieces = (q: any): number => {
    if (Array.isArray(q.items)) {
      return q.items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 0), 0);
    }
    return 0;
  };

  // Filter quotes by selected date range
  const filteredQuotes = useMemo(() => {
    const now = new Date();

    return quotes.filter((q) => {
      const qDate = new Date(q.createdAt);
      if (isNaN(qDate.getTime())) return true;

      if (dateFilter === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        return qDate >= startOfToday;
      }

      if (dateFilter === '7d') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return qDate >= sevenDaysAgo;
      }

      if (dateFilter === '30d') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return qDate >= thirtyDaysAgo;
      }

      if (dateFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        return qDate >= startOfMonth;
      }

      if (dateFilter === 'custom') {
        let matchesStart = true;
        let matchesEnd = true;
        if (customStartDate) {
          const s = new Date(customStartDate + 'T00:00:00');
          matchesStart = qDate >= s;
        }
        if (customEndDate) {
          const e = new Date(customEndDate + 'T23:59:59');
          matchesEnd = qDate <= e;
        }
        return matchesStart && matchesEnd;
      }

      return true; // 'all'
    });
  }, [quotes, dateFilter, customStartDate, customEndDate]);

  // Financial & Operational Metrics
  const totalQuotesCount = filteredQuotes.length;

  const totalRevenue = useMemo(() => {
    return filteredQuotes.reduce((sum, q) => sum + getQuoteTotal(q), 0);
  }, [filteredQuotes]);

  const productionOrFinishedQuotes = useMemo(() => {
    return filteredQuotes.filter(
      (q) => q.status === 'Em produção' || q.status === 'Finalizado' || q.status === 'Orçamento enviado'
    );
  }, [filteredQuotes]);

  const confirmedRevenue = useMemo(() => {
    return productionOrFinishedQuotes.reduce((sum, q) => sum + getQuoteTotal(q), 0);
  }, [productionOrFinishedQuotes]);

  const inAnalysisQuotes = useMemo(() => {
    return filteredQuotes.filter((q) => q.status === 'Em análise' || q.status === 'Recebido');
  }, [filteredQuotes]);

  const inProductionQuotes = useMemo(() => {
    return filteredQuotes.filter((q) => q.status === 'Em produção');
  }, [filteredQuotes]);

  const finishedQuotes = useMemo(() => {
    return filteredQuotes.filter((q) => q.status === 'Finalizado');
  }, [filteredQuotes]);

  const totalPiecesCount = useMemo(() => {
    return filteredQuotes.reduce((sum, q) => sum + getQuotePieces(q), 0);
  }, [filteredQuotes]);

  const averageTicket = totalQuotesCount > 0 ? totalRevenue / totalQuotesCount : 0;

  // Chart Data 1: Status Breakdown (Revenue vs Count)
  const statusChartData = useMemo(() => {
    const statusGroups = [
      { name: 'Recebido / Análise', statusKeys: ['Recebido', 'Em análise'], fill: '#3b82f6' },
      { name: 'Em Produção', statusKeys: ['Em produção'], fill: '#a855f7' },
      { name: 'Finalizado', statusKeys: ['Finalizado', 'Orçamento enviado'], fill: '#10b981' },
      { name: 'Cancelado', statusKeys: ['Cancelado'], fill: '#64748b' },
    ];

    return statusGroups.map((grp) => {
      const matchQuotes = filteredQuotes.filter((q) => grp.statusKeys.includes(q.status));
      const count = matchQuotes.length;
      const revenue = matchQuotes.reduce((sum, q) => sum + getQuoteTotal(q), 0);

      return {
        name: grp.name,
        count,
        revenue,
        fill: grp.fill,
      };
    });
  }, [filteredQuotes]);

  // Chart Data 2: Timeline Evolution (Grouped by Day)
  const timelineChartData = useMemo(() => {
    const mapByDay: { [dateStr: string]: { date: string; revenue: number; count: number; pieces: number } } = {};

    // Sort ascending for timeline
    const sorted = [...filteredQuotes].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach((q) => {
      const d = new Date(q.createdAt);
      const dayKey = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!mapByDay[dayKey]) {
        mapByDay[dayKey] = { date: dayKey, revenue: 0, count: 0, pieces: 0 };
      }
      mapByDay[dayKey].revenue += getQuoteTotal(q);
      mapByDay[dayKey].count += 1;
      mapByDay[dayKey].pieces += getQuotePieces(q);
    });

    const result = Object.values(mapByDay);
    return result.length > 0
      ? result
      : [{ date: 'Sem dados', revenue: 0, count: 0, pieces: 0 }];
  }, [filteredQuotes]);

  // Chart Data 3: Category / Product Distribution
  const categoryPieData = useMemo(() => {
    const catMap: { [cat: string]: number } = {};

    filteredQuotes.forEach((q) => {
      (q.items || []).forEach((it: any) => {
        const cat = it.productName?.split('(')[0]?.trim() || 'Outros';
        catMap[cat] = (catMap[cat] || 0) + (Number(it.quantity) || 1);
      });
    });

    const entries = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    entries.sort((a, b) => b.value - a.value);

    return entries.length > 0
      ? entries.slice(0, 5)
      : [
          { name: 'Camisetas', value: 45 },
          { name: 'Canecas', value: 25 },
          { name: 'Moletons', value: 15 },
          { name: 'Abadás', value: 10 },
          { name: 'Outros', value: 5 },
        ];
  }, [filteredQuotes]);

  const PIE_COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-8 pb-12">
      {/* ── TOP HEADER & DATE FILTER BAR ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Painel Financeiro & Operacional</span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-4xl text-white">
              Dashboard Geral
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Acompanhe o faturamento estimado, volume de pedidos, ticket médio e conversão em tempo real.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Date Filter Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0 mr-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Período:
            </span>

            {[
              { id: 'today', label: 'Hoje' },
              { id: '7d', label: '7 Dias' },
              { id: '30d', label: '30 Dias' },
              { id: 'month', label: 'Este Mês' },
              { id: 'all', label: 'Todo Período' },
              { id: 'custom', label: 'Personalizado' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setDateFilter(btn.id as DateFilterType)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  dateFilter === btn.id
                    ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{totalQuotesCount} orçamento(s) no filtro</span>
          </div>
        </div>

        {/* Custom Date Inputs Drawer (when 'custom' is active) */}
        {dateFilter === 'custom' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300">Data Inicial:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300">Data Final:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            {(customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="text-xs text-red-400 hover:underline font-bold"
              >
                Limpar datas
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── FINANCIAL METRICS HIGHLIGHTS (R$) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Estimated Revenue */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Receita Total Estimada
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white relative z-10">
            {formatCurrency(totalRevenue)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 relative z-10 pt-1 border-t border-slate-800/80">
            <span>Soma de todos os orçamentos</span>
            <span className="text-emerald-400 font-bold">{totalQuotesCount} pedidos</span>
          </div>
        </div>

        {/* Card 2: Confirmed / In Production Revenue */}
        <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Receita em Produção / Concluída
            </span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white relative z-10">
            {formatCurrency(confirmedRevenue)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 relative z-10 pt-1 border-t border-slate-800/80">
            <span>Produção e Concluídos</span>
            <span className="text-purple-400 font-bold">{productionOrFinishedQuotes.length} pedidos</span>
          </div>
        </div>

        {/* Card 3: Average Ticket */}
        <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Ticket Médio
            </span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white relative z-10">
            {formatCurrency(averageTicket)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 relative z-10 pt-1 border-t border-slate-800/80">
            <span>Valor médio por solicitação</span>
            <span className="text-blue-400 font-bold">Por cliente</span>
          </div>
        </div>

        {/* Card 4: Total Pieces Volume */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Volume de Peças
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white relative z-10">
            {totalPiecesCount.toLocaleString('pt-BR')} <span className="text-sm font-bold text-slate-400">un</span>
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 relative z-10 pt-1 border-t border-slate-800/80">
            <span>Peças solicitadas</span>
            <span className="text-amber-400 font-bold">{productsCount} produtos ativos</span>
          </div>
        </div>
      </div>

      {/* ── OPERATIONAL STATUS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orçamentos</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalQuotesCount}</p>
          <p className="text-[10px] text-slate-500">No período selecionado</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Em Análise</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{inAnalysisQuotes.length}</p>
          <p className="text-[10px] text-slate-500">Aguardando atendimento</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Em Produção</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{inProductionQuotes.length}</p>
          <p className="text-[10px] text-slate-500">Na linha de confecção</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Finalizados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{finishedQuotes.length}</p>
          <p className="text-[10px] text-slate-500">Concluídos com sucesso</p>
        </div>
      </div>

      {/* ── CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart 1: Revenue / Status Distribution */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base">Fluxo Financeiro por Estágio</h3>
              <p className="text-xs text-slate-400">Valores em R$ e quantidade de pedidos por status</p>
            </div>

            {/* Toggle Revenue vs Count */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMetric === 'revenue'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Receita (R$)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('count')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMetric === 'count'
                    ? 'bg-blue-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Qtd Pedidos
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) =>
                    chartMetric === 'revenue' ? `R$ ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}` : val
                  }
                />
                <Tooltip
                  formatter={(value: any) => [
                    chartMetric === 'revenue' ? formatCurrency(Number(value)) : `${value} pedidos`,
                    chartMetric === 'revenue' ? 'Receita Estimada' : 'Total de Pedidos',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                  }}
                />
                <Bar
                  dataKey={chartMetric === 'revenue' ? 'revenue' : 'count'}
                  fill={chartMetric === 'revenue' ? '#10b981' : '#3b82f6'}
                  radius={[10, 10, 0, 0]}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Product Categories Pie */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-white text-base">Produtos Mais Solicitados</h3>
            <p className="text-xs text-slate-400">Volume de peças por produto/categoria no período</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} unidades`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-800/80">
            {categoryPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="truncate max-w-[120px]">{item.name}</span>
                <span className="text-slate-500 font-bold">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TIMELINE AREA CHART ── */}
      {timelineChartData.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base">Evolução Diária de Receita</h3>
              <p className="text-xs text-slate-400">Curva de novos orçamentos ao longo dos dias</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Receita Diária</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `R$ ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Faturamento']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── RECENT QUOTES TABLE WITH REVENUE ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-white text-lg">Solicitações Recentes no Período</h3>
            <p className="text-xs text-slate-400">
              Mostrando orçamentos gerados com valores discriminados em reais (R$)
            </p>
          </div>

          <Link
            href="/admin/orcamentos"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3.5 py-2 rounded-xl transition-all"
          >
            <span>Ver Todos os Orçamentos</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-xs">Nenhum orçamento encontrado para o período selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Código</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">WhatsApp</th>
                  <th className="p-3.5">Itens / Peças</th>
                  <th className="p-3.5">Valor Estimado</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQuotes.slice(0, 8).map((q) => {
                  const val = getQuoteTotal(q);
                  const pieces = getQuotePieces(q);

                  let statusColor = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
                  if (q.status === 'Em produção') statusColor = 'bg-purple-500/10 text-purple-300 border-purple-500/20';
                  if (q.status === 'Finalizado' || q.status === 'Orçamento enviado') statusColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                  if (q.status === 'Cancelado') statusColor = 'bg-red-500/10 text-red-300 border-red-500/20';

                  return (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-3.5 font-mono font-bold text-blue-400">
                        <Link href="/admin/orcamentos" className="hover:underline">
                          {q.quoteCode}
                        </Link>
                      </td>
                      <td className="p-3.5 font-bold text-white">{q.customerName}</td>
                      <td className="p-3.5 text-slate-400">{q.whatsapp}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-200">{pieces} un</span>
                        <span className="text-[10px] text-slate-500 ml-1">({q.items?.length || 0} itens)</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-emerald-400 text-sm">
                          {val > 0 ? formatCurrency(val) : 'A calcular'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${statusColor}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
