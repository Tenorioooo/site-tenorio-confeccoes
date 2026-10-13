'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  Download,
  MessageCircle,
  ArrowLeft,
  FileText,
  Sparkles,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/pricing';

function TrackQuoteContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const shouldAutoPrint = searchParams.get('print') === 'true';

  const [code, setCode] = useState(initialCode);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [waNumber, setWaNumber] = useState('5518991795656');

  const statuses = [
    'Recebido',
    'Em análise',
    'Aguardando informações',
    'Orçamento enviado',
    'Aguardando aprovação',
    'Em produção',
    'Finalizado',
  ];

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.whatsapp_number) {
          const clean = data.whatsapp_number.replace(/\D/g, '');
          setWaNumber(clean.startsWith('55') ? clean : `55${clean}`);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      toast.error('Digite o código do orçamento.');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/quotes/${code.trim().toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        setQuote(data);

        if (shouldAutoPrint) {
          setTimeout(() => {
            window.print();
          }, 600);
        }
      } else {
        setQuote(null);
      }
    } catch (err) {
      console.error(err);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleSearch();
    }
  }, [initialCode]);

  const currentStatusIndex = quote ? statuses.indexOf(quote.status) : -1;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppContact = () => {
    if (!quote) return;
    const msg = `Olá! Gostaria de falar sobre o meu orçamento *${quote.quoteCode}* emitido no site da Tenório Confecções.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Banner Header (Hidden on print) */}
      <div className="text-center max-w-2xl mx-auto space-y-4 print:hidden">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
          CONSULTA ONLINE &amp; PROPOSTA
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
          Acompanhe seu Orçamento
        </h1>
        <p className="text-slate-300 text-base">
          Consulte o status da sua produção ou baixe a proposta comercial em PDF.
        </p>
      </div>

      {/* Search Input Box (Hidden on print) */}
      <form
        onSubmit={handleSearch}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-w-xl mx-auto print:hidden"
      >
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">
          Digite seu código de orçamento:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ex: ORC-2026-000184"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-base font-bold text-white uppercase text-center placeholder-slate-600 focus:border-blue-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition-all"
          >
            {loading ? 'BUSCANDO...' : 'CONSULTAR'}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {searched && !loading && (
        <div className="space-y-8">
          {!quote ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto print:hidden">
              <AlertCircle className="w-10 h-10 text-blue-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Orçamento não localizado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Não encontramos nenhuma solicitação com o código{' '}
                <span className="font-mono text-blue-400 font-bold">{code}</span>. Verifique a digitação ou
                entre em contato pelo WhatsApp.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
              {/* Header exclusivo para impressão */}
              <div className="hidden print:flex items-center justify-between border-b-2 border-black pb-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-black">TENÓRIO CONFECÇÕES</h2>
                  <p className="text-xs text-gray-700">Andradina - SP • Atendimento para todo o Brasil</p>
                  <p className="text-xs text-gray-700">WhatsApp: +55 (18) 99179-5656 • tenorioconfeccoes.of@gmail.com</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase text-gray-600 block">PROPOSTA COMERCIAL</span>
                  <span className="text-xl font-mono font-black text-black">{quote.quoteCode}</span>
                  <p className="text-xs text-gray-600">
                    Emissão: {new Date(quote.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Action Toolbar on Screen */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6 print:hidden">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Código do Orçamento</span>
                  <h3 className="font-mono text-2xl font-black text-blue-400 tracking-wider">
                    {quote.quoteCode}
                  </h3>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl border border-slate-700 text-xs transition-all shadow-md active:scale-95"
                  >
                    <Printer className="w-4 h-4 text-blue-400" />
                    <span>Imprimir / Salvar PDF</span>
                  </button>

                  <button
                    onClick={handleWhatsAppContact}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-white/20" />
                    <span>Falar no WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Customer & Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs print:bg-gray-50 print:border-gray-200 print:text-black">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 block">Cliente:</span>
                  <p className="font-bold text-white text-sm print:text-black">{quote.customerName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 block">WhatsApp:</span>
                  <p className="font-semibold text-slate-200 print:text-black">{quote.whatsapp}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 block">Localidade:</span>
                  <p className="font-semibold text-slate-200 print:text-black">
                    {quote.city || 'Não informada'}{quote.state ? ` - ${quote.state}` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 block">Prazo Desejado:</span>
                  <p className="font-semibold text-slate-200 print:text-black">{quote.desiredDate || 'A combinar'}</p>
                </div>
              </div>

              {/* Status Timeline (Hidden on Print) */}
              <div className="space-y-4 print:hidden">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Status Atual da Produção:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {statuses.map((st, idx) => {
                    const isPast = currentStatusIndex > idx;
                    const isCurrent = currentStatusIndex === idx;

                    return (
                      <div
                        key={st}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/10'
                            : isPast
                            ? 'bg-slate-950 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {isPast || isCurrent ? (
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                isCurrent ? 'text-blue-400 animate-pulse' : 'text-emerald-400'
                              }`}
                            />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          <span className="text-[10px] font-extrabold uppercase">Etapa {idx + 1}</span>
                        </div>
                        <p className="font-bold text-xs leading-snug">{st}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3 border-t border-slate-800 pt-6 text-xs print:border-gray-300">
                <h4 className="font-bold text-white text-sm print:text-black">
                  Itens e Especificações Solicitadas:
                </h4>

                <div className="border border-slate-800 rounded-2xl overflow-hidden print:border-gray-300">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 print:bg-gray-100 print:text-black print:border-gray-300">
                      <tr>
                        <th className="py-3 px-4">Item / Produto</th>
                        <th className="py-3 px-4">Estampa / Arte</th>
                        <th className="py-3 px-4">Tamanhos / Grade</th>
                        <th className="py-3 px-4 text-right">Qtd</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 print:divide-gray-200">
                      {quote.items?.map((item: any, idx: number) => {
                        const sizesText = item.sizes && item.sizes.length > 0
                          ? item.sizes.map((s: any) => `${s.size}: ${s.quantity}`).join(', ')
                          : 'Tamanho único';

                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-950/40 print:hover:bg-transparent">
                            <td className="py-3 px-4 font-bold text-white print:text-black">
                              {item.productName}
                              {item.notes && (
                                <p className="text-[10px] text-slate-400 print:text-gray-600 font-normal mt-0.5">
                                  Obs: {item.notes}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-300 print:text-gray-700">
                              {item.printCode ? (
                                <span className="font-mono text-blue-400 print:text-black font-semibold">
                                  {item.printCode} {item.printName ? `(${item.printName})` : ''}
                                </span>
                              ) : item.hasCustomArt ? (
                                <span className="text-emerald-400 print:text-black font-semibold">
                                  Arte Própria Enviada
                                </span>
                              ) : (
                                <span className="text-slate-500 print:text-gray-500">Sem estampa</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-300 print:text-gray-700 font-mono text-[11px]">
                              {sizesText}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-blue-400 print:text-black text-sm">
                              {item.quantity} un
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {quote.estimatedTotal && quote.estimatedTotal > 0 && (
                  <div className="flex justify-end pt-3">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-right print:border-gray-300 print:bg-gray-50">
                      <span className="text-[11px] text-slate-400 print:text-gray-600 block">Total Estimado:</span>
                      <span className="text-lg font-black text-emerald-400 print:text-black">
                        {formatCurrency(quote.estimatedTotal)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Observações Gerais */}
              {quote.notes && (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs space-y-1 print:bg-gray-50 print:border-gray-200">
                  <span className="font-bold text-slate-300 print:text-black block">Observações do Cliente:</span>
                  <p className="text-slate-400 print:text-gray-700 leading-relaxed">{quote.notes}</p>
                </div>
              )}

              {/* Rodapé Comercial exclusivo para Impressão */}
              <div className="hidden print:block pt-8 border-t border-gray-300 text-xs text-gray-700 space-y-4">
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="border-t border-gray-400 pt-2 text-center">
                    <p className="font-bold">TENÓRIO CONFECÇÕES</p>
                    <p className="text-[10px]">Departamento Comercial</p>
                  </div>
                  <div className="border-t border-gray-400 pt-2 text-center">
                    <p className="font-bold">{quote.customerName}</p>
                    <p className="text-[10px]">De acordo do Cliente</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 text-center pt-2">
                  Proposta gerada através do sistema online oficial da Tenório Confecções (www.tenorioconfeccoes.shop).
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackQuotePage() {
  return (
    <div className="py-16 bg-slate-950 text-white min-h-screen">
      <Suspense fallback={<div className="py-20 text-center text-slate-400">Carregando...</div>}>
        <TrackQuoteContent />
      </Suspense>
    </div>
  );
}
