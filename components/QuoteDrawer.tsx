'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuoteCart } from '@/lib/cart';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, Plus, Minus, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';

export function QuoteDrawer() {
  const { items, isDrawerOpen, setIsDrawerOpen, removeItem, updateQuantity, totalQuantity, clearCart, estimatedTotalPrice } =
    useQuoteCart();

  if (!isDrawerOpen) return null;

  const hasPricing = items.some((i) => i.unitPrice && i.unitPrice > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-slate-900 text-white shadow-2xl flex flex-col border-l border-slate-800">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-white">MEU ORÇAMENTO</h2>
                <p className="text-xs text-slate-400">
                  {totalQuantity} {totalQuantity === 1 ? 'peça acumulada' : 'peças acumuladas'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Seu orçamento está vazio</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Navegue pelos produtos e adicione os itens desejados para solicitar seu orçamento personalizado.
                  </p>
                </div>
                <Link
                  href="/produtos"
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 bg-blue-500 text-slate-950 px-5 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-blue-400 transition-all active:scale-95"
                >
                  VER PRODUTOS
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const sizesSummary = Object.entries(item.sizes || {})
                  .filter(([, q]) => q > 0)
                  .map(([s, q]) => `${s}:${q}`)
                  .join(', ');

                const itemTotal = item.totalPrice || (item.unitPrice ? item.unitPrice * item.quantity : 0);

                return (
                  <div
                    key={item.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex gap-3 relative group hover:border-slate-700 transition-all"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-slate-800 shrink-0 overflow-hidden relative border border-slate-700">
                      {item.productImage || item.printImage ? (
                        <Image
                          src={item.productImage || item.printImage || ''}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold">
                          TENÓRIO
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">{item.productName}</h4>
                      
                      {item.printCode && (
                        <p className="text-[11px] sm:text-xs text-blue-400 font-medium mt-0.5">
                          Estampa: {item.printCode}
                        </p>
                      )}
                      {item.hasCustomArt && (
                        <p className="text-[11px] sm:text-xs text-emerald-400 font-medium mt-0.5">
                          Arte Própria Anexada
                        </p>
                      )}

                      {sizesSummary && (
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                          Tamanhos: <span className="text-slate-300">{sizesSummary}</span>
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-slate-400 hover:text-white active:scale-95"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white">
                            {item.quantity} un
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-slate-400 hover:text-white active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item price */}
                        {item.unitPrice && item.unitPrice > 0 ? (
                          <div className="text-right">
                            <div className="text-[10px] text-slate-500">{formatCurrency(item.unitPrice)}/un</div>
                            <div className="text-xs font-extrabold text-emerald-400">{formatCurrency(itemTotal)}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                      title="Remover do orçamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 pb-6 sm:pb-6 border-t border-slate-800 bg-slate-950/90 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">Total de Peças:</span>
                <span className="font-bold text-white">{totalQuantity} unidades</span>
              </div>

              {hasPricing && estimatedTotalPrice > 0 && (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">Valor Estimado Total:</span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-400">{formatCurrency(estimatedTotalPrice)}</span>
                </div>
              )}

              {!hasPricing && (
                <p className="text-[10px] sm:text-[11px] text-slate-500">
                  Os valores finais serão calculados de acordo com quantidade, personalização e prazo.
                </p>
              )}

              <Link
                href="/orcamento"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all active:scale-98 text-xs sm:text-sm uppercase tracking-wide"
              >
                <Sparkles className="w-4 h-4" />
                <span>REVISAR E ENVIAR ORÇAMENTO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-400 py-1 transition-colors"
              >
                Limpar solicitação
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
