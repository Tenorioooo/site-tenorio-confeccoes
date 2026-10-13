'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Zap,
  Info,
} from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';

export interface SimulatorProduct {
  id: string;
  name: string;
  category?: string;
  basePrice: number;
  minQty: number;
  prazo?: string;
  tiers: Array<{ minQty: number; maxQty: number | null; unitPrice: number }>;
}

// Valores OFICIAIS sincronizados com bot/tabelaPrecos.json e catálogo
const INITIAL_PRODUCTS: SimulatorProduct[] = [
  {
    id: 'algodao',
    name: 'Camiseta 100% Algodão',
    category: 'Camisetas',
    basePrice: 49.9,
    minQty: 1,
    prazo: '15 a 20 dias úteis',
    tiers: [
      { minQty: 1, maxQty: 10, unitPrice: 49.9 },
      { minQty: 11, maxQty: null, unitPrice: 45.8 },
    ],
  },
  {
    id: 'dryfit',
    name: 'Camiseta Dry-Fit Esportiva',
    category: 'Esportivo',
    basePrice: 64.9,
    minQty: 1,
    prazo: '30 a 40 dias úteis',
    tiers: [
      { minQty: 1, maxQty: 10, unitPrice: 64.9 },
      { minQty: 11, maxQty: null, unitPrice: 59.9 },
    ],
  },
  {
    id: 'polo',
    name: 'Camisa Polo Personalizada',
    category: 'Corporativo',
    basePrice: 74.9,
    minQty: 1,
    prazo: '15 a 20 dias úteis',
    tiers: [
      { minQty: 1, maxQty: 10, unitPrice: 74.9 },
      { minQty: 11, maxQty: null, unitPrice: 69.9 },
    ],
  },
  {
    id: 'moletom',
    name: 'Moletom Canguru',
    category: 'Inverno',
    basePrice: 119.9,
    minQty: 1,
    prazo: '15 a 20 dias úteis',
    tiers: [
      { minQty: 1, maxQty: 10, unitPrice: 119.9 },
      { minQty: 11, maxQty: null, unitPrice: 115.8 },
    ],
  },
  {
    id: 'caneca',
    name: 'Caneca Alumínio (300ml)',
    category: 'Brindes',
    basePrice: 28.46,
    minQty: 20,
    prazo: '20 a 25 dias úteis',
    tiers: [
      { minQty: 20, maxQty: null, unitPrice: 28.46 },
    ],
  },
  {
    id: 'abada',
    name: 'Abadá Personalizado',
    category: 'Eventos',
    basePrice: 49.8,
    minQty: 10,
    prazo: '15 a 20 dias úteis',
    tiers: [
      { minQty: 10, maxQty: null, unitPrice: 49.8 },
    ],
  },
  {
    id: 'windbanner',
    name: 'Wind Banner',
    category: 'Publicidade',
    basePrice: 129.8,
    minQty: 1,
    prazo: '7 a 12 dias úteis',
    tiers: [
      { minQty: 1, maxQty: null, unitPrice: 129.8 },
    ],
  },
];

export function QuickQuoteSimulator() {
  const [products, setProducts] = useState<SimulatorProduct[]>(INITIAL_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string>('algodao');
  const [quantity, setQuantity] = useState<number>(15);

  // Sincroniza dinamicamente com a tabela oficial de preços (/api/admin/chatbot/tabela)
  useEffect(() => {
    fetch('/api/admin/chatbot/tabela')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tabela?.produtos && Array.isArray(data.tabela.produtos) && data.tabela.produtos.length > 0) {
          const mapeados: SimulatorProduct[] = data.tabela.produtos
            .map((p: any) => {
              let tiers = Array.isArray(p.pricingTiers) && p.pricingTiers.length > 0
                ? p.pricingTiers
                : [];

              let basePrice = Number(p.precoBase) || 0;
              let minQty = Number(p.quantidadeMinima) || 1;

              // Caso variações (Caneca, Wind Banner, etc)
              if (Array.isArray(p.variacoes) && p.variacoes.length > 0 && tiers.length === 0) {
                const v1 = p.variacoes[0];
                basePrice = Number(v1.preco) || basePrice;
                const vTiers = Array.isArray(v1.pricingTiers) && v1.pricingTiers.length > 0
                  ? v1.pricingTiers
                  : (Array.isArray(v1.tiers) && v1.tiers.length > 0 ? v1.tiers : []);

                if (vTiers.length > 0) {
                  tiers = vTiers;
                  minQty = Number(p.quantidadeMinima) || Number(vTiers[0]?.minQty) || 1;
                } else {
                  const isCaneca = p.nome.toLowerCase().includes('caneca');
                  minQty = Number(p.quantidadeMinima) || (isCaneca ? 20 : 1);
                  tiers = [{ minQty, maxQty: null, unitPrice: basePrice }];
                }
              }

              if (tiers.length === 0 && basePrice > 0) {
                tiers = [{ minQty, maxQty: null, unitPrice: basePrice }];
              }

              if (basePrice === 0 && tiers.length > 0) {
                basePrice = tiers[0].unitPrice;
              }

              // Garante que o minQty seja estritamente respeitado
              minQty = Number(p.quantidadeMinima) || Number(tiers[0]?.minQty) || 1;

              return {
                id: p.nome.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: p.nome.replace(' Personalizada', '').replace(' Personalizado', ''),
                category: p.categoria || 'Geral',
                basePrice,
                minQty,
                prazo: p.prazoConfeccao,
                tiers,
              };
            })
            .filter((p: SimulatorProduct) => p.basePrice > 0);

          if (mapeados.length > 0) {
            setProducts(mapeados);
          }
        }
      })
      .catch(() => {});
  }, []);

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  // Ajusta quantidade se trocar para item com quantidade mínima maior ou para produto unitário
  const handleSelectProduct = (newId: string) => {
    setSelectedProductId(newId);
    const target = products.find((p) => p.id === newId);
    if (target) {
      if (quantity < target.minQty) {
        setQuantity(target.minQty);
      } else if (target.id.includes('windbanner') || target.name.toLowerCase().includes('wind banner')) {
        // Se a quantidade anterior for alta (ex: lote de camisetas), ajusta para 1 unidade que é o padrão de Wind Banner
        if (quantity > 10) {
          setQuantity(1);
        }
      }
    }
  };

  // Encontra faixa de preço válida correspondente à quantidade atual
  const activeTier = product.tiers.find((t) => {
    if (t.maxQty === null || t.maxQty === undefined) return quantity >= t.minQty;
    return quantity >= t.minQty && quantity <= t.maxQty;
  }) || (quantity < (product.tiers[0]?.minQty || 1) ? product.tiers[0] : product.tiers[product.tiers.length - 1]);

  const unitPrice = activeTier?.unitPrice || product.basePrice;
  const totalPrice = unitPrice * quantity;

  // Preço base inicial (primeira faixa ou basePrice oficial)
  const firstTierPrice = product.tiers[0]?.unitPrice || product.basePrice;
  const baseTotal = firstTierPrice * quantity;
  const savings = Math.max(0, baseTotal - totalPrice);
  const savingsPercent = baseTotal > 0 && savings > 0 ? Math.round((savings / baseTotal) * 100) : 0;

  // Próxima faixa de desconto
  const nextTier = product.tiers.find((t) => t.minQty > quantity && t.unitPrice < unitPrice);
  const pecasParaProximoDesconto = nextTier ? nextTier.minQty - quantity : 0;

  // Presets adaptativos baseados no tipo de produto e lote mínimo
  const isWindBanner = product.id.includes('windbanner') || product.name.toLowerCase().includes('wind banner');
  const maxSlider = isWindBanner ? 30 : 200;

  let presets: number[] = [];
  if (isWindBanner) {
    presets = [1, 2, 3, 5, 10];
  } else if (product.minQty >= 20) {
    presets = [20, 30, 50, 100, 200];
  } else if (product.minQty >= 10) {
    presets = [10, 15, 20, 30, 50, 100];
  } else {
    presets = [1, 5, 10, 15, 20, 30, 50];
  }

  return (
    <section className="py-16 bg-gradient-to-b from-[#161d30] via-slate-900 to-slate-950 text-white relative overflow-hidden border-y border-slate-800">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>TABELA DE PREÇOS OFICIAL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
            Simulador Rápido de Preços & Lotes
          </h2>

          <p className="text-slate-400 text-sm">
            Cotação transparente com valores oficiais direto de fábrica. Selecione o produto e veja o valor exato por lote:
          </p>
        </div>

        {/* Card do Simulador */}
        <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* 1. Seletor de Produto */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. Selecione o Produto:
              </label>
              {product.minQty > 1 && (
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Mínimo deste item: {product.minQty} un
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {products.slice(0, 8).map((p) => {
                const isSelected = p.id === selectedProductId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-lg shadow-blue-500/20 scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="leading-tight truncate w-full">{p.name}</span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-slate-900 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      A partir de {formatCurrency(p.tiers[p.tiers.length - 1]?.unitPrice || p.basePrice)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Controle de Quantidade */}
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
              min={product.minQty}
              max={maxSlider}
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

            {/* Alerta de próximo desconto (se houver) */}
            {nextTier && pecasParaProximoDesconto > 0 && (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
                <span>
                  💡 Adicione mais <strong>{pecasParaProximoDesconto} peças</strong> para atingir a faixa de{' '}
                  <strong>{formatCurrency(nextTier.unitPrice)}/un</strong>!
                </span>
                <button
                  onClick={() => setQuantity(nextTier.minQty)}
                  className="ml-2 px-2 py-0.5 rounded bg-blue-500 text-slate-950 font-bold text-[11px] hover:bg-blue-400"
                >
                  Ajustar para {nextTier.minQty}
                </button>
              </div>
            )}
          </div>

          {/* 3. Resultado do Cálculo Oficial */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
              <div className="sm:pr-4">
                <span className="text-[11px] text-slate-400 uppercase font-bold block">Valor Unitário</span>
                <span className="text-2xl font-black text-white">{formatCurrency(unitPrice)}</span>
                <span className="text-[11px] text-slate-500 block">
                  {quantity >= (product.tiers[1]?.minQty || 999) ? 'Preço de atacado' : 'Preço de tabela'}
                </span>
              </div>

              <div className="sm:px-4 pt-3 sm:pt-0">
                <span className="text-[11px] text-slate-400 uppercase font-bold block">Total do Lote</span>
                <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalPrice)}</span>
                <span className="text-[11px] text-slate-500 block">para {quantity} unidades</span>
              </div>

              <div className="sm:pl-4 pt-3 sm:pt-0">
                <span className="text-[11px] text-slate-400 uppercase font-bold block">Economia no Lote</span>
                {savings > 0 ? (
                  <>
                    <span className="text-2xl font-black text-amber-400">-{savingsPercent}%</span>
                    <span className="text-[11px] text-emerald-400 font-semibold block">
                      Economia de {formatCurrency(savings)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-slate-400 block pt-1">
                      {product.tiers.length > 1 ? 'Faixa Inicial' : 'Preço Fixo'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {product.tiers.length > 1
                        ? `A partir de ${product.tiers[1].minQty} un sai a ${formatCurrency(product.tiers[1].unitPrice)}`
                        : 'Melhor preço de fábrica'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Selos de Confiança e Prazo */}
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

          {/* CTA para o Orçamento Oficial */}
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
                `Olá! Fiz uma simulação no site para ${quantity} unidades de ${product.name} (valor: ${formatCurrency(
                  totalPrice
                )} | unitário: ${formatCurrency(unitPrice)}) e gostaria de fechar o pedido!`
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
