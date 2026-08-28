'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

const DEFAULT_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: '1',
    title: 'Camisetas Algodão Penteado - Evento Tech 2025',
    category: 'Camisetas',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Abadás Sublimados - Bloco da Alegria',
    category: 'Abadás',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'Uniformes Polos - Equipe Comercial',
    category: 'Empresas',
    image: 'https://images.unsplash.com/photo-1625910513413-433a010d29a5?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    title: 'Moletons Flanelados - Turma de Medicina',
    category: 'Moletons',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '5',
    title: 'Canecas Porcelana AAA - Brinde Corporativo',
    category: 'Canecas',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '6',
    title: 'Wind Banner Publicitário - Posto & Conveniência',
    category: 'Bandeiras',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
  },
];

export function PortfolioSection() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIO_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setPortfolioItems(data.items);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['Todos', ...Array.from(new Set(portfolioItems.map((i) => i.category))).filter(Boolean)];

  const filteredItems =
    selectedCategory === 'Todos'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section className="py-20 bg-slate-900/60 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full shadow-sm">
            PORTFÓLIO DE CLIENTES
          </span>
          <h2
            className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.7)',
            }}
          >
            Alguns trabalhos que já produzimos
          </h2>
          <p
            className="text-slate-200 text-base font-medium max-w-2xl mx-auto"
            style={{
              textShadow: '0 1px 6px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            Confira a qualidade real das estampas, tecidos e acabamentos entregues para nossos clientes.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group relative h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer shadow-lg hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <span className="self-start bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-blue-400 px-3 py-1 rounded-full uppercase shadow">
                  {item.category}
                </span>

                <div className="flex items-end justify-between">
                  <h3 className="font-bold text-white text-base leading-tight pr-4 drop-shadow">
                    {item.title}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 p-2.5 text-slate-400 hover:text-white bg-slate-950/80 rounded-full border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-[60vh] w-full bg-slate-950">
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            <div className="p-6 bg-slate-950 flex items-center justify-between border-t border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  {activeItem.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{activeItem.title}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
