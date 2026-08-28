'use client';

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

interface TestimonialItem {
  id?: string;
  name: string;
  city: string;
  text: string;
  rating: number;
  image?: string | null;
  tag?: string;
  active?: boolean;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    name: 'Carlos Eduardo M.',
    city: 'Caruaru - PE',
    text: 'Excelente qualidade e atendimento. As camisetas da nossa convenção ficaram exatamente como imaginávamos, com o bordado perfeito!',
    rating: 5,
    tag: 'Empresa',
  },
  {
    name: 'Juliana Paes',
    city: 'Recife - PE',
    text: 'Pedimos abadás e wind banners para nosso bloco. Entrega no prazo correto, sublimação com cores super vivas! Atendimento rápido pelo WhatsApp.',
    rating: 5,
    tag: 'Evento / Bloco',
  },
  {
    name: 'Roberto Alencar',
    city: 'Campina Grande - PB',
    text: 'Super solícitos para ajustar nossa arte própria. As camisas polo da nossa equipe comercial ficaram impecáveis. Recomendamos sem dúvidas!',
    rating: 5,
    tag: 'Uniformes',
  },
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const res = await fetch('/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          const activeOnly = Array.isArray(data)
            ? data.filter((t: any) => t.active !== false)
            : [];
          if (activeOnly.length > 0) {
            setTestimonials(activeOnly);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar depoimentos:', err);
      }
    }
    loadTestimonials();
  }, []);

  return (
    <section className="py-20 bg-[#1c253d] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
            DEPOIMENTOS DE CLIENTES
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Quem produz com a Tenório Confecções, recomenda.
          </h2>
          <p className="text-slate-300 text-base">
            A satisfação dos nossos clientes é o nosso maior selo de qualidade.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={t.id || idx}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl relative flex flex-col justify-between hover:border-blue-400/40 transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Quote Icon & Stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-blue-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-blue-400 text-blue-400" />
                    ))}
                  </div>
                  {t.tag && (
                    <span className="text-[10px] font-bold text-blue-300 bg-blue-400/10 border border-blue-400/20 px-2.5 py-0.5 rounded-full uppercase">
                      {t.tag}
                    </span>
                  )}
                </div>

                <p className="text-slate-200 text-sm italic leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                  ) : null}
                  <div>
                    <h4 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
                      {t.name}
                    </h4>
                    {t.city && <p className="text-xs text-slate-400">{t.city}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Verificado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
