'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Search, Filter, Sparkles, Heart, RefreshCw } from 'lucide-react';
import { useFavorites } from '@/lib/favorites';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  priceRange?: string | null;
  images: { imageUrl: string }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedPurpose, setSelectedPurpose] = useState('Todos');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const { favoriteProducts } = useFavorites();

  const categories = [
    'Todos',
    'Camisetas',
    'Moletons',
    'Canecas',
    'Abadás',
    'Bandeiras',
    'Wind Banner',
    'Uniformes',
    'Outros',
  ];

  const purposes = [
    'Todos',
    'Eventos',
    'Empresas',
    'Festas',
    'Times',
    'Escolas',
    'Formaturas',
    'Igrejas',
    'Corporativo',
    'Uso pessoal',
  ];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((prod) => {
    // Search query filter
    const matchesSearch =
      search === '' ||
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.description.toLowerCase().includes(search.toLowerCase()) ||
      prod.category.toLowerCase().includes(search.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === 'Todos' ||
      prod.category.toLowerCase() === selectedCategory.toLowerCase();

    // Purpose filter
    const matchesPurpose =
      selectedPurpose === 'Todos' ||
      prod.description.toLowerCase().includes(selectedPurpose.toLowerCase()) ||
      prod.category.toLowerCase().includes(selectedPurpose.toLowerCase());

    // Favorites filter
    const matchesFav = !onlyFavorites || favoriteProducts.includes(prod.id);

    return matchesSearch && matchesCategory && matchesPurpose && matchesFav;
  });

  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Banner Header */}
        <div className="bg-gradient-to-r from-[#283353] to-[#1c253d] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
              CATÁLOGO COMPLETO
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
              Produtos Personalizados
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Explore nossa linha completa de vestuário, acessórios e produtos promocionais. Selecione o modelo desejado para configurar tamanhos e estampas.
            </p>
          </div>
        </div>

        {/* Search Bar & Filters Control Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          {/* Top Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar produtos (ex: camiseta algodão, moletom, caneca, abadá)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="space-y-3 pt-2">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Categoria:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Purpose Filter & Favorites Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Finalidade:
                </span>
                {purposes.slice(0, 6).map((purp) => (
                  <button
                    key={purp}
                    onClick={() => setSelectedPurpose(purp)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                      selectedPurpose === purp
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {purp}
                  </button>
                ))}
              </div>

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
                <span>Favoritos ({favoriteProducts.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Carregando catálogo de produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4 max-w-md mx-auto">
            <Filter className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">Nenhum produto encontrado</h3>
            <p className="text-xs text-slate-400 px-6">
              Tente alterar os termos da sua pesquisa ou ajustar os filtros selecionados.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('Todos');
                setSelectedPurpose('Todos');
                setOnlyFavorites(false);
              }}
              className="inline-flex items-center gap-2 bg-blue-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
