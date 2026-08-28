'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function FloatingWhatsApp() {
  const handleClick = () => {
    trackEvent('click_whatsapp', { source: 'floating_button' });
    const text = encodeURIComponent('Olá! Gostaria de falar com o atendimento da Tenório Confecções.');
    window.open(`https://wa.me/5581999999999?text=${text}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Falar no WhatsApp"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:p-3.5 rounded-full shadow-2xl shadow-emerald-500/40 flex items-center gap-2 sm:gap-3 transition-all hover:scale-110 active:scale-95 group pulse-glow"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white/20" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs sm:text-sm whitespace-nowrap pr-1 sm:pr-2">
        Falar no WhatsApp
      </span>
    </button>
  );
}
