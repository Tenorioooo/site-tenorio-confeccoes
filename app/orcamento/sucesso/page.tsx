'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, MessageCircle, ArrowLeft, Search, CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

function SuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'ORC-2026-000184';

  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tenorio_last_quote');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messageText) {
          setMessageText(parsed.messageText);
        }
      }
    } catch (e) {}

    trackEvent('quote_completed', { code });
  }, [code]);

  const handleOpenWhatsApp = () => {
    trackEvent('click_whatsapp', { code });
    const cleanNumber = '5581999999999';
    const textToSend = messageText || `Olá! Fiz um orçamento no site da Tenório Confecções. Meu código de orçamento é ${code}.`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success(`Código ${code} copiado para a área de transferência!`);
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-4 text-center space-y-8">
      {/* Animated Check Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
          SOLICITAÇÃO RECEBIDA
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
          Orçamento enviado com sucesso! 🎉
        </h1>
        <p className="text-slate-300 text-base max-w-lg mx-auto leading-relaxed">
          Sua solicitação foi registrada no nosso sistema. Nossa equipe analisará os detalhes do produto e entrará em contato para passar os valores exatos.
        </p>
      </div>

      {/* Quote Code Display Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative max-w-md mx-auto">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
          Código Identificador do Orçamento
        </p>
        <div className="flex items-center justify-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <span className="font-mono font-black text-2xl sm:text-3xl text-blue-400 tracking-wider">
            {code}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Copiar código"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Guarde este código para acompanhar o status da produção e atendimento.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
        <button
          onClick={handleOpenWhatsApp}
          className="w-full inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 px-6 rounded-xl shadow-xl shadow-emerald-500/20 text-base transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5 fill-white/20" />
          <span>ABRIR NO WHATSAPP</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 text-xs">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-400 py-2 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR AO CATÁLOGO</span>
        </Link>
        <span className="hidden sm:inline text-slate-700">•</span>
        <Link
          href={`/acompanhar-orcamento?code=${code}`}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-400 py-2 transition-colors font-medium"
        >
          <Search className="w-4 h-4" />
          <span>ACOMPANHAR ORÇAMENTO</span>
        </Link>
      </div>
    </div>
  );
}

export default function QuoteSuccessPage() {
  return (
    <div className="py-20 bg-slate-950 text-white min-h-screen flex items-center justify-center">
      <Suspense fallback={<div className="text-slate-400 text-sm">Carregando...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
