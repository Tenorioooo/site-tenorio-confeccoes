'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';

interface SimulatorProduct {
  id: string;
  name: string;
  basePrice: number;
  tiers: Array<{ minQty: number; maxQty: number | null; unitPrice: number }>;
}

const PRODUCTS: SimulatorProduct[] = [
  {
    id: 'algodao',
    name: 'Camiseta 100% Algodão',
    basePrice: 49.9,
    tiers: [
      { minQty: 1, maxQty: 9, unitPrice: 49.9 },
      { minQty: 10, maxQty: 19, unitPrice: 45.8 },
      { minQty: 20, maxQty: 49, unitPrice: 39.9 },
      { minQty: 50, maxQty: 99, unitPrice: 35.0 },
      { minQty: 100, maxQty: null, unitPrice: 29.9 },
    ],
  },
  {
    id: 'dryfit',
    name: 'Camiseta Dry-Fit Esportiva',
    basePrice: 64.9,
    tiers: [
      { minQty: 1, maxQty: 9, unitPrice: 64.9 },
      { minQty: 10, maxQty: 19, unitPrice: 59.9 },
      { minQty: 20, maxQty: 49, unitPrice: 52.0 },
      { minQty: 50, maxQty: 99, unitPrice: 46.0 },
      { minQty: 100, maxQty: null, unitPrice: 39.9 },
    ],
  },
  {
    id: 'polo',
    name: 'Camisa Polo Piquet Bordada',
    basePrice: 74.9,
    tiers: [
      { minQty: 1, maxQty: 9, unitPrice: 74.9 },
      { minQty: 10, maxQty: 19, unitPrice: 69.9 },
      { minQty: 20, maxQty: 49, unitPrice: 62.0 },
      { minQty: 50, maxQty: 99, unitPrice: 55.0 },
      { minQty: 100, maxQty: null, unitPrice: 49.9 },
    ],
  },
  {
    id: 'moletom',
    name: 'Moletom Canguru Flanelado',
    basePrice: 129.9,
    tiers: [
      { minQty: 1, maxQty: 9, unitPrice: 129.9 },
      { minQty: 10, maxQty: 19, unitPrice: 119.0 },
      { minQty: 20, maxQty: 49, unitPrice: 108.0 },
      { minQty: 50, maxQty: null, unitPrice: 99.0 },
    ],
  },
  {
    id: 'caneca',
    name: 'Caneca Porcelana AAA (325ml)',
    basePrice: 34.9,
    tiers: [
      { minQty: 1, maxQty: 9, unitPrice: 34.9 },
      { minQty: 10, maxQty: 29, unitPrice: 28.0 },
      { minQty: 30, maxQty: 99, unitPrice: 22.9 },
      { minQty: 100, maxQty: null, unitPrice: 18.9 },
    ],
  },
];

export function QuickQuoteSimulator() {
  const [selectedProductId, setSelectedProductId] = useState<string>('algodao');
  const [quantity, setQuantity] = useState<number>(25);

  const product = PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0];

  // Calcula preço unitário conforme a quantidade
  const activeTier = product.tiers.find((t) => {
    if (t.maxQty === null) return quantity >= t.minQty;
    return quantity >= t.minQty && quantity <= t.maxQty;
  }) || product.tiers[0];

  const unitPrice = activeTier.unitPrice;
  const totalPrice = unitPrice * quantity;
  const baseTotal = product.basePrice * quantity;
  const savings = Math.max(0, baseTotal - totalPrice);
  const savingsPercent = baseTotal > 0 ? Math.round((savings / baseTotal) * 100) : 0;

  const presets = [10, 20, 30, 50, 100, 200];

  return (
    <section className="py-16 bg-gradient-to-b from-[#161d30] via-slate-900 to-slate-950 text-white relative overflow-hidden border-y border-slate-800">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>SIMULADOR RÁPIDO DE PREÇOS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
            Descubra o valor do seu pedido na hora
          </h2>

          <p className="text-slate-400 text-sm">
            Quanto maior o volume, menor o valor por unidade. Arraste ou clique para calcular:
          </p>
        </div>

        {/* Card do Simulador */}
        <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Seletor de Produto */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Selecione o Produto Desejado:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {PRODUCTS.map((p) => {
                const isSelected = p.id === selectedProductId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-lg shadow-blue-500/20 scale-105'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="leading-tight">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controle de Quantidade */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Quantidade de Peças:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-blue-400 font-mono">{quantity}</span>
                <span className="text-xs text-slate-400 font-bold">peças</span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={1}
              max={300}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />

            {/* Chips de Quantidade Rápida */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold mr-1">Atalhos:</span>
              {presets.map((num) => (
                <button
                  key={num}
                  onClick={() => setQuantity(num)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    quantity === num
                      ? 'bg-blue-500/20 text-blue-300 border-blue-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {num} un
                </button>
              ))}
            </div>
          </div>

          {/* Resultado do Cálculo */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
              <div className="sm:pr-4">
                <span className="text-[11px] text-slate-400 uppercase font-bold block">Valor Unitário</span>
                <span className="text-2xl font-black text-white">{formatCurrency(unitPrice)}</span>
                <span className="text-[11px] text-slate-500 block">por peça no lote</span>
              </div>

              <div className="sm:px-4 pt-3 sm:pt-0">
                <span className="text-[11px] text-slate-400 uppercase font-bold block">Total Estimado</span>
                <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalPrice)}</span>
                <span className="text-[11px] text-slate-500 block">para {quantity} unidades</span>
              </div>

              <div className="sm:pl-4 pt-3 sm:pt-0">
                <span className="text-[11px] text-slate-400 uppercase font-bold block">Economia Progressiva</span>
                {savingsPercent > 0 ? (
                  <>
                    <span className="text-2xl font-black text-amber-400">-{savingsPercent}%</span>
                    <span className="text-[11px] text-emerald-400 font-semibold block">
                      Economia de {formatCurrency(savings)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-slate-400 block pt-1">Preço Inicial</span>
                    <span className="text-[11px] text-slate-500 block">Adicione mais peças p/ desconto</span>
                  </>
                )}
              </div>
            </div>

            {/* Selos de Confiança */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-200">4.9/5</span>
                <span>• Clientes Satisfeitos</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Garantia de Qualidade
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  Envio para Todo o Brasil
                </span>
              </div>
            </div>
          </div>

          {/* CTA para o Orçamento */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href={`/orcamento`}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/20 text-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>MONTAR ORÇAMENTO COM ESTES ITENS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/5518991795656?text=${encodeURIComponent(
                `Olá! Fiz uma simulação no site para ${quantity} unidades de ${product.name} (aprox. ${formatCurrency(
                  totalPrice
                )}) e gostaria de fechar o pedido!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-2xl text-sm transition-all shadow-lg active:scale-95"
            >
              <span>FECHAR NO WHATSAPP</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
