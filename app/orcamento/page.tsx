'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuoteCart } from '@/lib/cart';
import { toast } from 'sonner';
import {
  Sparkles,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Upload,
  ArrowRight,
} from 'lucide-react';
import { formatWhatsAppMessage, buildWhatsAppUrl } from '@/lib/utils';
import { formatCurrency } from '@/lib/pricing';
import { trackEvent } from '@/lib/analytics';

export default function QuotePage() {
  const router = useRouter();
  const { items, addItem, removeItem, updateQuantity, clearCart, totalQuantity, estimatedTotalPrice } = useQuoteCart();

  // Customer Data Form
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('PE');
  const [desiredDate, setDesiredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(true);

  // Quick product add form state (if cart empty or user wants to add item right here)
  const [quickProduct, setQuickProduct] = useState('Camiseta Personalizada 100% Algodão');
  const [quickPrintCode, setQuickPrintCode] = useState('EST-001');
  const [quickQty, setQuickQty] = useState(20);

  const [submitting, setSubmitting] = useState(false);

  const handleAddQuickItem = () => {
    addItem({
      productName: quickProduct,
      printCode: quickPrintCode,
      printName: `Estampa ${quickPrintCode}`,
      quantity: quickQty,
      sizes: { M: Math.floor(quickQty / 2), G: Math.ceil(quickQty / 2) },
      customizationPositions: ['Frente'],
      hasCustomArt: false,
    });
    toast.success('Item adicionado à solicitação!');
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Adicione pelo menos um produto ao seu orçamento.');
      return;
    }

    if (!customerName.trim() || !whatsapp.trim()) {
      toast.error('Por favor, informe seu Nome e WhatsApp.');
      return;
    }

    if (!consent) {
      toast.error('É necessário autorizar o contato da Tenório Confecções.');
      return;
    }

    setSubmitting(true);
    trackEvent('start_quote', { itemsCount: items.length });

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          whatsapp,
          email: email || undefined,
          city: city || undefined,
          state: state || undefined,
          desiredDate: desiredDate || undefined,
          notes: notes || undefined,
          items,
        }),
      });

      if (res.ok) {
        const quoteData = await res.json();
        const quoteCode = quoteData.quoteCode;

        // Build WhatsApp Message String
        const messageText = formatWhatsAppMessage({
          customerName,
          whatsapp,
          email,
          city,
          state,
          desiredDate,
          notes,
          quoteCode,
          items,
          estimatedTotal: estimatedTotalPrice > 0 ? estimatedTotalPrice : undefined,
        });

        // Store encoded message for success page
        localStorage.setItem('tenorio_last_quote', JSON.stringify({ quoteCode, messageText }));

        clearCart();
        trackEvent('submit_quote', { quoteCode });
        toast.success(`Orçamento ${quoteCode} gerado com sucesso!`);

        router.push(`/orcamento/sucesso?code=${quoteCode}`);
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Erro ao gerar solicitação de orçamento.');
      }
    } catch (err) {
      toast.error('Erro de comunicação ao enviar orçamento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#283353] to-[#1c253d] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
              MONTE SEU ORÇAMENTO
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
              Solicitação de Orçamento
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Revise os produtos adicionados, informe os dados de entrega e envie sua solicitação diretamente para o nosso atendimento no WhatsApp.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitQuote} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Items Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-xl text-white">Produtos Selecionados</h2>
                    <p className="text-xs text-slate-400">
                      {totalQuantity} {totalQuantity === 1 ? 'unidade no total' : 'unidades no total'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/produtos"
                  className="text-xs font-bold text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Mais Produtos</span>
                </Link>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <p className="text-slate-400 text-sm">Seu orçamento ainda não possui produtos.</p>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-md mx-auto text-left">
                    <h4 className="font-bold text-white text-sm">Adição Rápida de Produto:</h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Produto:</label>
                        <select
                          value={quickProduct}
                          onChange={(e) => setQuickProduct(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                        >
                          <option value="Camiseta Personalizada 100% Algodão">Camiseta Personalizada 100% Algodão</option>
                          <option value="Camiseta Dry Fit Esportiva">Camiseta Dry Fit Esportiva</option>
                          <option value="Moletom Canguru Personalizado">Moletom Canguru Personalizado</option>
                          <option value="Caneca Porcelana AAA 325ml">Caneca Porcelana AAA 325ml</option>
                          <option value="Abadá Personalizado Eventos">Abadá Personalizado Eventos</option>
                          <option value="Wind Banner Publicitário">Wind Banner Publicitário</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-1">Estampa (Código):</label>
                          <input
                            type="text"
                            value={quickPrintCode}
                            onChange={(e) => setQuickPrintCode(e.target.value.toUpperCase())}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Quantidade:</label>
                          <input
                            type="number"
                            value={quickQty}
                            onChange={(e) => setQuickQty(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-bold"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddQuickItem}
                        className="w-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold py-2.5 rounded-xl shadow transition-all"
                      >
                        ADICIONAR ESTE PRODUTO
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const sizesStr = Object.entries(item.sizes || {})
                      .filter(([, q]) => q > 0)
                      .map(([s, q]) => `${s}: ${q}`)
                      .join(' | ');

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex gap-4 relative group"
                      >
                        <div className="w-16 h-16 rounded-xl bg-slate-800 shrink-0 overflow-hidden relative border border-slate-700">
                          {item.productImage || item.printImage ? (
                            <Image
                              src={item.productImage || item.printImage || ''}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                              TENÓRIO
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-6 space-y-1">
                          <h4 className="font-bold text-white text-base">{item.productName}</h4>

                          {item.printCode && (
                            <p className="text-xs text-blue-400 font-semibold">
                              Estampa: {item.printCode} ({item.printName || 'Catálogo'})
                            </p>
                          )}
                          {item.hasCustomArt && (
                            <p className="text-xs text-emerald-400 font-semibold">
                              Arte própria do cliente anexada
                            </p>
                          )}

                          {sizesStr && (
                            <p className="text-xs text-slate-400">
                              Tamanhos: <span className="text-slate-200 font-medium">{sizesStr}</span>
                            </p>
                          )}

                          {item.customizationPositions && item.customizationPositions.length > 0 && (
                            <p className="text-xs text-slate-400">
                              Locais: <span className="text-slate-200 font-medium">{item.customizationPositions.join(', ')}</span>
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-3 pt-2">
                            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 text-slate-400 hover:text-white"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-bold text-white">
                                {item.quantity} un
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-slate-400 hover:text-white"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {item.unitPrice && item.unitPrice > 0 ? (
                              <div className="text-right">
                                <div className="text-[10px] text-slate-500">{formatCurrency(item.unitPrice)}/un</div>
                                <div className="text-sm font-extrabold text-emerald-400">
                                  {formatCurrency(item.totalPrice || item.unitPrice * item.quantity)}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Financial Summary */}
            {estimatedTotalPrice > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-emerald-300 text-sm">Resumo Financeiro Estimado</h3>
                </div>
                <div className="space-y-2">
                  {items.map((item) => {
                    const itemTotal = item.totalPrice || (item.unitPrice ? item.unitPrice * item.quantity : 0);
                    if (!item.unitPrice || item.unitPrice === 0) return null;
                    return (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 truncate max-w-[60%]">{item.productName} ({item.quantity} un)</span>
                        <span className="text-white font-bold">{formatCurrency(itemTotal)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
                  <span className="text-sm font-bold text-emerald-300">TOTAL ESTIMADO:</span>
                  <span className="text-xl font-extrabold text-emerald-400">{formatCurrency(estimatedTotalPrice)}</span>
                </div>
                <p className="text-[10px] text-emerald-500/70">
                  * Estimativa baseada na tabela de preços por quantidade. Valores sujeitos a confirmação.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Customer Details & Dispatch */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl sticky top-24">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-serif font-bold text-xl text-white">Seus Dados para Contato</h3>
                <p className="text-xs text-slate-400">Preencha as informações para encaminharmos a proposta.</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">WhatsApp (DDD + Número) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: (81) 99999-9999"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">E-mail (opcional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="Ex: joao@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-slate-300 font-bold block">Cidade</label>
                    <input
                      type="text"
                      placeholder="Ex: Caruaru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">UF</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                    >
                      <option value="PE">PE</option>
                      <option value="PB">PB</option>
                      <option value="AL">AL</option>
                      <option value="CE">CE</option>
                      <option value="RN">RN</option>
                      <option value="BA">BA</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>
                </div>

                {/* Desired Date */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Quando você precisa receber o pedido?</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={desiredDate}
                      onChange={(e) => setDesiredDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Detalhes & Observações Gerais</label>
                  <textarea
                    placeholder="Ex: Preciso das camisetas para um evento no dia 15/10. Gostaria de prazo de produção express."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none h-20 resize-none"
                  />
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-2 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-[11px] text-slate-400">
                    Autorizo o contato da Tenório Confecções para tratar deste orçamento e apresentar a proposta comercial.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold py-4 rounded-xl shadow-xl shadow-emerald-500/20 text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>{submitting ? 'GERANDO ORÇAMENTO...' : 'ENVIAR ORÇAMENTO PELO WHATSAPP'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
