'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function FloatingWhatsApp() {
  const [waNumber, setWaNumber] = useState('5518991795656');
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

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

    // Exibe balãozinho convidativo após 4 segundos se o usuário não fechou antes
    const timer = setTimeout(() => {
      try {
        const dismissed = sessionStorage.getItem('wa_bubble_dismissed');
        if (!dismissed) {
          setShowBubble(true);
        }
      } catch (e) {
        setShowBubble(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    trackEvent('click_whatsapp', { source: 'floating_button' });
    const text = encodeURIComponent('Olá! Gostaria de falar com o atendimento da Tenório Confecções sobre um orçamento.');
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
  };

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBubble(false);
    setBubbleDismissed(true);
    try {
      sessionStorage.setItem('wa_bubble_dismissed', 'true');
    } catch (err) {}
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Balão de engajamento ativo */}
      {showBubble && !bubbleDismissed && (
        <div
          onClick={handleClick}
          className="cursor-pointer max-w-[280px] sm:max-w-xs bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 text-white p-3.5 rounded-2xl shadow-2xl relative animate-in fade-in slide-in-from-bottom-3 duration-300 hover:border-emerald-400/60 transition-all group"
        >
          <button
            onClick={handleDismissBubble}
            aria-label="Fechar mensagem"
            className="absolute -top-2 -left-2 w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center border border-slate-700 shadow text-[10px]"
          >
            <X className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-400 tracking-wide uppercase">
              Atendimento Online
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-snug">
            Dúvidas sobre modelos, tecidos ou prazos? <span className="text-emerald-300 font-semibold underline decoration-emerald-500/40">Fale conosco no WhatsApp</span>!
          </p>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
            <span className="flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Resposta em minutos
            </span>
            <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Conversar &rarr;
            </span>
          </div>
        </div>
      )}

      {/* Botão de WhatsApp */}
      <button
        onClick={handleClick}
        aria-label="Falar no WhatsApp"
        className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:p-3.5 rounded-full shadow-2xl shadow-emerald-500/40 flex items-center gap-2 sm:gap-3 transition-all hover:scale-110 active:scale-95 group pulse-glow"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white/20" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs sm:text-sm whitespace-nowrap pr-1 sm:pr-2">
          Falar no WhatsApp
        </span>
      </button>
    </div>
  );
}
