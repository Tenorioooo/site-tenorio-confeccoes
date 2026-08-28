'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PrintCard, PrintData } from '@/components/PrintCard';
import { PrintCompareModal } from '@/components/PrintCompareModal';
import { Search, Filter, Sparkles, Scale, UploadCloud, Heart, RefreshCw } from 'lucide-react';
import { useFavorites } from '@/lib/favorites';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function StampsPage() {
  const router = useRouter();
  const [prints, setPrints] = useState<PrintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Todos']);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Compare Mode State
  const [comparingPrints, setComparingPrints] = useState<PrintData[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const { favoritePrints } = useFavorites();

  const [categories, setCategories] = useState<string[]>(['Todos']);

  useEffect(() => {
    fetch('/api/prints/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(['Todos', ...data.categories]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchPrints() {
      setLoading(true);
      try {
        const res = await fetch('/api/prints');
        if (res.ok) {
          const data = await res.json();
          setPrints(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPrints();
  }, []);

  const filteredPrints = prints.filter((pr) => {
    const matchesSearch =
      search === '' ||
      pr.code.toLowerCase().includes(search.toLowerCase()) ||
      pr.name.toLowerCase().includes(search.toLowerCase()) ||
      pr.tags.toLowerCase().includes(search.toLowerCase()) ||
      (pr.categories?.some((c: any) => c.category.name.toLowerCase().includes(search.toLowerCase())) ?? false);

    // Category filter: if 'Todos' is selected or no specific category, match all
    const matchesCategory = selectedCategories.includes('Todos') ||
      (pr.categories?.some((c: any) => selectedCategories.includes(c.category.name)) ?? false);

    const matchesFav = !onlyFavorites || favoritePrints.includes(pr.code);

    return matchesSearch && matchesCategory && matchesFav;
  });

  const handleCompareToggle = (print: PrintData) => {
    if (comparingPrints.some((p) => p.id === print.id)) {
      setComparingPrints((prev) => prev.filter((p) => p.id !== print.id));
    } else {
      if (comparingPrints.length >= 4) {
        toast.error('Você pode comparar no máximo 4 estampas simultaneamente.');
        return;
      }
      setComparingPrints((prev) => [...prev, print]);
    }
  };

  const handleSelectPrintForQuote = (print: PrintData) => {
    toast.success(`Estampa ${print.code} (${print.name}) selecionada! Redirecionando para catálogo...`);
    router.push(`/produtos?printCode=${print.code}`);
  };

  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#283353] to-[#1c253d] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
              CATÁLOGO DE ESTAMPAS & MODELOS
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
              Catálogo de Estampas
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Explore nossos modelos exclusivos com identificação por códigos (ex: EST-001). Escolha a estampa perfeita para utilizar nas suas camisetas, moletons, canecas ou abadás.
            </p>
          </div>
        </div>

        {/* Custom Art Callout Banner */}
        <div className="bg-slate-900/90 border-2 border-dashed border-blue-500/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <UploadCloud className="w-6 h-6 text-blue-400" />
              <span>Não encontrou a estampa que procura?</span>
            </h3>
            <p className="text-sm text-slate-300">
              Envie sua própria arte ou logotipo e nossa equipe avalia a possibilidade de produção imediata.
            </p>
          </div>

          <Link
            href="/orcamento?customArt=true"
            className="shrink-0 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition-all hover:scale-105"
          >
            ENVIAR MINHA ARTE
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por código (ex: EST-001), nome, tag ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Category Filter Pills & Comparison Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Categoria:
              </span>
              {categories.map((cat) => (
  <button
    key={cat}
    onClick={() => setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        // deselect
        return prev.filter(c => c !== cat);
      }
      if (cat === 'Todos') return ['Todos'];
      const filtered = prev.filter(c => c !== 'Todos');
      if (filtered.includes(cat)) {
        const next = filtered.filter(c => c !== cat);
        return next.length === 0 ? ['Todos'] : next;
      }
      return [...filtered, cat];
    })}
    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${selectedCategories.includes(cat) ? 'bg-blue-500 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'}`}
  >
    {cat}
  </button>
))}
            </div>

            <div className="flex items-center gap-3">
              {/* Favorites Toggle */}
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                  onlyFavorites
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-rose-400 border-slate-800'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : ''}`} />
                <span>Favoritas ({favoritePrints.length})</span>
              </button>

              {/* Compare Button Badge */}
              {comparingPrints.length > 0 && (
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition-all animate-pulse"
                >
                  <Scale className="w-4 h-4" />
                  <span>Comparar ({comparingPrints.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Print Cards Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Carregando estampas do catálogo...</p>
          </div>
        ) : filteredPrints.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4 max-w-md mx-auto">
            <Filter className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">Nenhuma estampa encontrada</h3>
            <p className="text-xs text-slate-400 px-6">
              Tente alterar os termos da sua pesquisa ou selecione outra categoria.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategories(['Todos']);
                setOnlyFavorites(false);
              }}
              className="inline-flex items-center gap-2 bg-blue-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredPrints.map((pr) => {
              const isComparing = comparingPrints.some((p) => p.id === pr.id);

              return (
                <PrintCard
                  key={pr.id}
                  print={pr}
                  onSelect={handleSelectPrintForQuote}
                  onCompareToggle={handleCompareToggle}
                  isComparing={isComparing}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Compare Modal */}
      {isCompareModalOpen && (
        <PrintCompareModal
          prints={comparingPrints}
          onClose={() => setIsCompareModalOpen(false)}
          onSelectPrint={(p) => {
            setIsCompareModalOpen(false);
            handleSelectPrintForQuote(p);
          }}
        />
      )}
    </div>
  );
}
