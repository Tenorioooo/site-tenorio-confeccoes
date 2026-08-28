'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface CategoryItem {
  id: string;
  key: string;
  tagKey?: string;
  descKey?: string;
  name: string;
  description: string;
  defaultImage: string;
  href: string;
  tag: string;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'camisetas',
    key: 'img_cat_camisetas',
    tagKey: 'tag_cat_camisetas',
    descKey: 'desc_cat_camisetas',
    name: 'Camisetas',
    description: 'Algodão penteado, dry fit e poliéster. Para festas, formaturas e eventos.',
    defaultImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    href: '/produtos?category=Camisetas',
    tag: 'Mais Pedido',
  },
  {
    id: 'moletons',
    key: 'img_cat_moletons',
    tagKey: 'tag_cat_moletons',
    descKey: 'desc_cat_moletons',
    name: 'Moletons',
    description: 'Canguru, careca e flanelado de alta gramatura para turmas e equipes.',
    defaultImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    href: '/produtos?category=Moletons',
    tag: 'Inverno & Turmas',
  },
  {
    id: 'canecas',
    key: 'img_cat_canecas',
    tagKey: 'tag_cat_canecas',
    descKey: 'desc_cat_canecas',
    name: 'Canecas',
    description: 'Porcelana AAA 325ml. Brindes corporativos e presentes especiais.',
    defaultImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    href: '/produtos?category=Canecas',
    tag: 'Brindes Premium',
  },
  {
    id: 'abadas',
    key: 'img_cat_abadas',
    tagKey: 'tag_cat_abadas',
    descKey: 'desc_cat_abadas',
    name: 'Abadás',
    description: 'Sublimação total para blocos, carnaval, festas e micaretas.',
    defaultImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80',
    href: '/produtos?category=Abad%C3%A1s',
    tag: 'Alta Vibração',
  },
  {
    id: 'bandeiras',
    key: 'img_cat_bandeiras',
    tagKey: 'tag_cat_bandeiras',
    descKey: 'desc_cat_bandeiras',
    name: 'Bandeiras',
    description: 'Estampadas em poliéster lavável com ilhós. Torcidas e fachadas.',
    defaultImage: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=600&auto=format&fit=crop&q=80',
    href: '/produtos?category=Bandeiras',
    tag: 'Divulgação',
  },
  {
    id: 'windbanner',
    key: 'img_cat_windbanner',
    tagKey: 'tag_cat_windbanner',
    descKey: 'desc_cat_windbanner',
    name: 'Wind Banner',
    description: 'Flag banners promocionais com haste e base para grande impacto visual.',
    defaultImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
    href: '/produtos?category=Wind%20Banner',
    tag: 'Visibilidade',
  },
  {
    id: 'uniformes',
    key: 'img_cat_uniformes',
    tagKey: 'tag_cat_uniformes',
    descKey: 'desc_cat_uniformes',
    name: 'Uniformes',
    description: 'Polos, camisetas e aventais para equipes e representantes comerciais.',
    defaultImage: 'https://images.unsplash.com/photo-1625910513413-433a010d29a5?w=600&auto=format&fit=crop&q=80',
    href: '/produtos?category=Uniformes',
    tag: 'Empresarial',
  },
  {
    id: 'eventos',
    key: 'img_cat_eventos',
    tagKey: 'tag_cat_eventos',
    descKey: 'desc_cat_eventos',
    name: 'Eventos',
    description: 'Kits completos para congressos, shows, feiras e campeonatos.',
    defaultImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
    href: '/eventos',
    tag: 'Kits Eventos',
  },
  {
    id: 'corporativo',
    key: 'img_cat_corporativo',
    tagKey: 'tag_cat_corporativo',
    descKey: 'desc_cat_corporativo',
    name: 'Corporativo',
    description: 'Brindes e vestuário institucional para fortalecer sua marca.',
    defaultImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    href: '/empresas',
    tag: 'Marcas',
  },
  {
    id: 'outros',
    key: 'img_cat_outros',
    tagKey: 'tag_cat_outros',
    descKey: 'desc_cat_outros',
    name: 'Outros Personalizados',
    description: 'Sacochilas, aventais, tirantes e produtos sob consulta especial.',
    defaultImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    href: '/produtos?category=Outros',
    tag: 'Sob Consulta',
  },
];

export function CategoriesSection() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => { });
  }, []);

  return (
    <section className="py-20 bg-slate-900/40 text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full shadow-sm">
            EXPLORE O CATÁLOGO
          </span>
          <h2
            className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.7)',
            }}
          >
            Encontre o que você precisa
          </h2>
          <p
            className="text-slate-200 text-base font-medium max-w-2xl mx-auto"
            style={{
              textShadow: '0 1px 6px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            Selecione a categoria desejada para visualizar opções de tecidos, moldes e estampas personalizáveis.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6">
          {INITIAL_CATEGORIES.map((item) => {
            const currentImage = settings[item.key] || item.defaultImage;
            const currentTag = settings[item.tagKey || ''] || settings[`tag_${item.key}`] || item.tag;
            const currentDesc = settings[item.descKey || ''] || settings[`desc_${item.key}`] || item.description;

            return (
              <div
                key={item.id}
                className="group bg-slate-950/80 border border-slate-800 hover:border-blue-400/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Thumbnail */}
                <div className="relative h-28 sm:h-44 w-full bg-slate-800 overflow-hidden">
                  <Image
                    src={currentImage}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  {currentTag && (
                    <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[9px] sm:text-[10px] font-bold text-blue-400 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md">
                      {currentTag}
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div>
                    <h3 className="font-bold text-xs sm:text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mt-0.5 sm:mt-1 line-clamp-2 hidden sm:block">
                      {currentDesc}
                    </p>
                  </div>

                  <Link
                    href={item.href}
                    className="w-full inline-flex items-center justify-between bg-slate-900 hover:bg-blue-500 text-slate-200 hover:text-slate-950 text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-800 hover:border-blue-500 transition-all duration-200 active:scale-95"
                  >
                    <span>Ver opções</span>
                    <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
