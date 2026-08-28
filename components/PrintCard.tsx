'use client';

import React from 'react';
import Image from 'next/image';
import { useFavorites } from '@/lib/favorites';
import { Heart, CheckCircle, Scale, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export interface PrintData {
  id: string;
  code: string;
  name: string;
  tags: string;
  imageUrl: string;
  categories?: { category: { name: string } }[];
}

interface PrintCardProps {
  print: PrintData;
  onSelect?: (print: PrintData) => void;
  onCompareToggle?: (print: PrintData) => void;
  isComparing?: boolean;
}

export function PrintCard({ print, onSelect, onCompareToggle, isComparing }: PrintCardProps) {
  const { isPrintFavorite, toggleFavoritePrint } = useFavorites();
  const isFav = isPrintFavorite(print.code);

  let parsedTags: string[] = [];
  try {
    parsedTags = typeof print.tags === 'string' ? JSON.parse(print.tags) : print.tags || [];
  } catch (e) {
    parsedTags = [];
  }

  return (
    <div className="group bg-slate-950 border border-slate-800 hover:border-blue-400/40 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full">
      {/* Image Thumbnail */}
      <div className="relative h-36 sm:h-64 w-full bg-slate-900 overflow-hidden">
        <Image
          src={print.imageUrl}
          alt={`${print.code} - ${print.name}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={() => toggleFavoritePrint(print.code)}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2.5 rounded-full backdrop-blur-md border transition-all ${
            isFav
              ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
              : 'bg-slate-950/70 text-slate-300 border-slate-700 hover:text-rose-400 hover:bg-slate-900'
          }`}
          title={isFav ? 'Remover estampa dos favoritos' : 'Favoritar estampa'}
        >
          <Heart className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isFav ? 'fill-white' : ''}`} />
        </button>

        {/* EST Code Badge */}
        <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-blue-500 text-slate-950 font-black text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-lg tracking-wider">
          {print.code}
        </span>

        {/* Category Badges */}
        {print.categories && print.categories.length > 0 && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex flex-wrap gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
            {print.categories.slice(0, 1).map((c, idx) => (
              <span key={idx} className="text-[9px] sm:text-[10px] font-bold text-blue-400">
                {c.category.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body Information */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <h3 className="font-serif font-bold text-xs sm:text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {print.name}
          </h3>

          {/* Tags */}
          {parsedTags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {parsedTags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[9px] sm:text-[10px] bg-slate-900 text-slate-400 px-1.5 sm:px-2 py-0.5 rounded border border-slate-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 border-t border-slate-900">
          {onCompareToggle && (
            <button
              onClick={() => onCompareToggle(print)}
              className={`hidden sm:flex items-center justify-center gap-1.5 text-xs font-bold py-2 sm:py-2.5 rounded-xl border transition-all ${
                isComparing
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isComparing ? 'Comparando' : 'Comparar'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (onSelect) onSelect(print);
              else {
                toast.success(`Estampa ${print.code} selecionada! Acesse a montagem de orçamento.`);
              }
            }}
            className="w-full flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-400 text-slate-950 text-[10px] sm:text-xs font-black py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-blue-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>USAR ESTAMPA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
