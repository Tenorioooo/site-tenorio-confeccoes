'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFavorites } from '@/lib/favorites';
import { useQuoteCart } from '@/lib/cart';
import { Heart, Plus, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    // Mantém category para compatibilidade, mas será derivado de categories se existir
    category: string;
    description: string;
    priceRange?: string | null;
    images: { imageUrl: string }[];
    categories?: { category: { name: string } }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { isProductFavorite, toggleFavoriteProduct } = useFavorites();
  const { addItem } = useQuoteCart();
  const isFav = isProductFavorite(product.id);

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0].imageUrl
      : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      productName: product.name,
      category: product.category,
      productImage: mainImage,
      quantity: 10,
      sizes: { M: 5, G: 5 },
      customizationPositions: ['Frente'],
      hasCustomArt: false,
    });

    trackEvent('add_to_quote', { productId: product.id, productName: product.name });
    toast.success(`${product.name} adicionado ao seu orçamento!`);
  };

  return (
    <div className="group bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between h-full">
      {/* Top Image Container */}
      <div className="relative h-36 sm:h-60 w-full bg-slate-900 overflow-hidden">
        <Link href={`/produtos/${product.slug}`}>
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        </Link>

        {/* Favorite Heart Button */}
        <button
          onClick={() => toggleFavoriteProduct(product.id)}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2.5 rounded-full backdrop-blur-md border transition-all ${
            isFav
              ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
              : 'bg-slate-950/70 text-slate-300 border-slate-700 hover:text-rose-400 hover:bg-slate-900'
          }`}
          title={isFav ? 'Remover dos favoritos' : 'Favoritar produto'}
        >
          <Heart className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isFav ? 'fill-white' : ''}`} />
        </button>

        {/* Category Badges */}
        {product.categories && product.categories.length > 0 && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex flex-wrap gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">
            {product.categories.slice(0, 1).map((c, idx) => (
              <span key={idx} className="text-[9px] sm:text-[10px] font-bold text-blue-400">
                {c.category.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <Link href={`/produtos/${product.slug}`}>
            <h3 className="font-bold text-xs sm:text-base text-white hover:text-blue-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed hidden xs:block sm:block">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            <span className="text-[9px] sm:text-[10px] bg-slate-900 text-slate-300 px-1.5 sm:px-2 py-0.5 rounded border border-slate-800">
              Personalizável
            </span>
          </div>
        </div>

        {/* Price tag note */}
        <div className="pt-1.5 sm:pt-2 border-t border-slate-900 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
            {product.priceRange || 'Sob Orçamento'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
          <Link
            href={`/produtos/${product.slug}`}
            className="flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-200 text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-800 hover:border-slate-700 transition-all active:scale-95"
          >
            <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden sm:inline">DETALHES</span>
            <span className="sm:hidden">VER</span>
          </Link>

          <button
            onClick={handleQuickAdd}
            className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-400 text-slate-950 text-[10px] sm:text-xs font-black py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>ORÇAR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
