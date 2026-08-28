'use client';

import React from 'react';
import Image from 'next/image';
import { PrintData } from './PrintCard';
import { X, Scale, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PrintCompareModalProps {
  prints: PrintData[];
  onClose: () => void;
  onSelectPrint: (print: PrintData) => void;
}

export function PrintCompareModal({ prints, onClose, onSelectPrint }: PrintCompareModalProps) {
  if (!prints || prints.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-white">Comparação de Estampas</h2>
              <p className="text-xs text-slate-400">
                Visualização lado a lado de {prints.length} estampa(s) selecionada(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-side Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto pr-2">
          {prints.map((p) => {
            let tags: string[] = [];
            try {
              tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || [];
            } catch (e) {
              tags = [];
            }

            return (
              <div
                key={p.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                    <span className="absolute top-2 left-2 bg-blue-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded shadow">
                      {p.code}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-base">{p.name}</h4>
                    {p.categories?.map((c, idx) => (
                      <p key={idx} className="text-xs text-blue-400 mt-0.5">{c.category.name}</p>
                    ))}
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectPrint(p)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>USAR NO ORÇAMENTO</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
