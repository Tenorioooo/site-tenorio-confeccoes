'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function TrackQuoteContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const statuses = [
    'Recebido',
    'Em análise',
    'Aguardando informações',
    'Orçamento enviado',
    'Aguardando aprovação',
    'Em produção',
    'Finalizado',
  ];

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Banner Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
          CONSULTA ONLINE
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
          Acompanhe seu Orçamento
        </h1>
        <p className="text-slate-300 text-base">
          Digite abaixo o código identificador (ex: ORC-2026-000184) gerado ao enviar sua solicitação.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-w-xl mx-auto">
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
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-blue-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Orçamento não localizado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Não encontramos nenhuma solicitação com o código <span className="font-mono text-blue-400 font-bold">{code}</span>. Verifique a digitação ou entre em contato pelo WhatsApp.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
              {/* Quote Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Código do Orçamento</span>
                  <h3 className="font-mono text-2xl font-black text-blue-400 tracking-wider">
                    {quote.quoteCode}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Cliente</span>
                  <p className="font-bold text-white text-base">{quote.customerName}</p>
                  <p className="text-xs text-slate-400">{quote.whatsapp}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Status Atual da Solicitação:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {statuses.map((st, idx) => {
                    const isPast = currentStatusIndex > idx;
                    const isCurrent = currentStatusIndex === idx;

                    return (
                      <div
                        key={st}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/10'
                            : isPast
                            ? 'bg-slate-950 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isPast || isCurrent ? (
                            <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-blue-400 animate-pulse' : 'text-emerald-400'}`} />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-600" />
                          )}
                          <span className="text-[10px] font-extrabold uppercase">Etapa {idx + 1}</span>
                        </div>
                        <p className="font-bold text-sm leading-snug">{st}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-3 border-t border-slate-800 pt-6 text-xs">
                <h4 className="font-bold text-white text-sm">Resumo dos Itens Solicitados:</h4>
                <div className="space-y-2">
                  {quote.items?.map((item: any) => (
                    <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{item.productName}</p>
                        <p className="text-slate-400 text-[11px]">
                          {item.printCode ? `Estampa: ${item.printCode}` : item.hasCustomArt ? 'Arte Própria' : ''}
                        </p>
                      </div>
                      <span className="font-bold text-blue-400">{item.quantity} un</span>
                    </div>
                  ))}
                </div>
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
