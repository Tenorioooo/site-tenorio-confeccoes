'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Award, Users, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&auto=format&fit=crop&q=80',
];

export function Hero() {
  const [heroImages, setHeroImages] = useState<string[]>(DEFAULT_HERO_IMAGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalMs, setIntervalMs] = useState(4500);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          let list: string[] = [];
          if (data.hero_images) {
            try {
              const parsed = JSON.parse(data.hero_images);
              if (Array.isArray(parsed) && parsed.length > 0) {
                list = parsed.filter(Boolean);
              }
            } catch (e) {}
          }
          if (list.length === 0 && data.img_hero_main) {
            list = [data.img_hero_main];
          }
          if (list.length > 0) {
            setHeroImages(list);
          }
          if (data.hero_interval) {
            const num = parseInt(data.hero_interval, 10);
            if (!isNaN(num) && num >= 2000) {
              setIntervalMs(num);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Automatic slide transition
  useEffect(() => {
    if (heroImages.length <= 1 || isHovered) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [heroImages.length, intervalMs, isHovered, currentIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#283353] via-[#1c253d] to-[#161d30] text-white py-10 sm:py-16 lg:py-28">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[300px] sm:h-[400px] bg-blue-500/10 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-[250px] sm:w-[400px] h-[200px] sm:h-[300px] bg-blue-500/10 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-8 text-center lg:text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-blue-400/30 text-blue-300 text-[11px] sm:text-xs font-semibold tracking-wide uppercase shadow-inner max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-spin" />
              <span className="truncate">Confecção Sob Medida • Orçamento WhatsApp</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-[1.18] sm:leading-[1.15]">
              Personalizamos suas ideias.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500">
                Produzimos seus momentos.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-slate-300 text-sm sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Camisetas, moletons, canecas, abadás, bandeiras, wind banners, uniformes e muito mais personalizados para empresas, eventos, equipes e ocasiões especiais.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center justify-center lg:justify-start gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Arte Própria ou Catálogo</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Orçamento Multi-Produtos</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Envio para Todo o Brasil</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link
                href="/orcamento"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-extrabold text-sm sm:text-base shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 group"
              >
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>MONTAR MEU ORÇAMENTO</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/produtos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-800 text-white px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base border border-slate-700 hover:border-slate-600 transition-all hover:scale-105 active:scale-95"
              >
                <span>VER CATÁLOGO</span>
              </Link>
            </div>
          </div>

          {/* Right Visual Showcase Composition / Carousel */}
          <div className="lg:col-span-5 relative flex justify-center mt-4 lg:mt-0">
            {/* Visual Container Card */}
            <div
              className="relative w-full max-w-md lg:max-w-lg aspect-[4/5] rounded-3xl bg-slate-900/80 border border-slate-700/60 p-3 sm:p-4 shadow-2xl overflow-hidden group select-none"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Stacked Images for Smooth Cross-Fade */}
              {heroImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-3 sm:inset-4 rounded-2xl overflow-hidden transition-all duration-1000 ease-in-out ${
                    idx === currentIndex
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-105 z-0 pointer-events-none'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Produtos Personalizados Tenório Confecções - Foto ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    unoptimized
                    className="object-cover rounded-2xl"
                  />
                  {/* Dark Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>
              ))}

              {/* Floating Badge 1 - Satisfaction */}
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-700 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-xl">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg sm:rounded-xl text-blue-400">
                  <Award className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Qualidade Garantida</p>
                  <p className="text-xs sm:text-sm font-bold text-white">Acabamento Premium</p>
                </div>
              </div>

              {/* Floating Badge 2 - Live Counter */}
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-700 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-xl">
                <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg sm:rounded-xl text-emerald-400">
                  <Users className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Atendimento Dedicado</p>
                  <p className="text-xs sm:text-sm font-bold text-white">WhatsApp em Minutos</p>
                </div>
              </div>

              {/* Carousel Navigation Arrows (Visible on mobile and hover on desktop) */}
              {heroImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Imagem anterior"
                    className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-slate-950/80 hover:bg-blue-500 text-white hover:text-slate-950 border border-slate-700 hover:border-blue-400 flex items-center justify-center transition-all opacity-90 lg:opacity-0 lg:group-hover:opacity-100 shadow-xl active:scale-95"
                  >
                    <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Próxima imagem"
                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-slate-950/80 hover:bg-blue-500 text-white hover:text-slate-950 border border-slate-700 hover:border-blue-400 flex items-center justify-center transition-all opacity-90 lg:opacity-0 lg:group-hover:opacity-100 shadow-xl active:scale-95"
                  >
                    <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
                  </button>

                  {/* Indicator Dots */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-20 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md border border-slate-700/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                    {heroImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentIndex
                            ? 'w-5 sm:w-6 bg-blue-400'
                            : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                        }`}
                        title={`Ir para imagem ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

