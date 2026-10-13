'use client';

import React, { useState } from 'react';
import { X, Ruler, HelpCircle, Check, Sparkles } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

export function SizeGuideModal({ isOpen, onClose, initialCategory }: SizeGuideModalProps) {
  const getInitialTab = () => {
    const cat = (initialCategory || '').toLowerCase();
    if (cat.includes('polo')) return 'polo';
    if (cat.includes('moletom')) return 'moletom';
    if (cat.includes('abadá') || cat.includes('abada')) return 'abada';
    if (cat.includes('caneca') || cat.includes('bandeira') || cat.includes('wind')) return 'brindes';
    return 'camiseta';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  if (!isOpen) return null;

  const sizeTables = {
    camiseta: {
      title: 'Camisetas Tradicionais (100% Algodão Penteado & Dry-Fit)',
      description: 'Modelagem unissex clássica com caimento confortável.',
      rows: [
        { size: 'PP', width: '48 cm', height: '66 cm', sleeve: '19 cm' },
        { size: 'P', width: '50 cm', height: '68 cm', sleeve: '20 cm' },
        { size: 'M', width: '53 cm', height: '71 cm', sleeve: '21 cm' },
        { size: 'G', width: '56 cm', height: '74 cm', sleeve: '22 cm' },
        { size: 'GG', width: '59 cm', height: '77 cm', sleeve: '23 cm' },
        { size: 'XGG', width: '63 cm', height: '80 cm', sleeve: '24 cm' },
      ],
    },
    polo: {
      title: 'Camisas Polo (Piquet & Dry Confort)',
      description: 'Modelagem com gola estruturada e acabamento premium para empresas.',
      rows: [
        { size: 'P', width: '51 cm', height: '69 cm', sleeve: '21 cm' },
        { size: 'M', width: '54 cm', height: '72 cm', sleeve: '22 cm' },
        { size: 'G', width: '57 cm', height: '75 cm', sleeve: '23 cm' },
        { size: 'GG', width: '60 cm', height: '78 cm', sleeve: '24 cm' },
        { size: 'XGG', width: '64 cm', height: '81 cm', sleeve: '25 cm' },
      ],
    },
    moletom: {
      title: 'Moletons Flanelados (Canguru & Careca)',
      description: 'Gramatura pesada flanelada por dentro, punhos e barra em ribana.',
      rows: [
        { size: 'P', width: '54 cm', height: '68 cm', sleeve: '60 cm' },
        { size: 'M', width: '57 cm', height: '71 cm', sleeve: '62 cm' },
        { size: 'G', width: '60 cm', height: '74 cm', sleeve: '64 cm' },
        { size: 'GG', width: '64 cm', height: '77 cm', sleeve: '66 cm' },
        { size: 'XGG', width: '68 cm', height: '80 cm', sleeve: '68 cm' },
      ],
    },
    abada: {
      title: 'Abadás Promocionais (Sublimação Total)',
      description: 'Tecido leve e respirável para eventos, festas e blocos de carnaval.',
      rows: [
        { size: 'P', width: '50 cm', height: '67 cm', sleeve: 'Regata' },
        { size: 'M', width: '53 cm', height: '70 cm', sleeve: 'Regata' },
        { size: 'G', width: '56 cm', height: '73 cm', sleeve: 'Regata' },
        { size: 'GG', width: '59 cm', height: '76 cm', sleeve: 'Regata' },
        { size: 'XGG', width: '63 cm', height: '79 cm', sleeve: 'Regata' },
      ],
    },
    brindes: {
      title: 'Canecas, Bandeiras e Wind Banners',
      description: 'Dimensões padrão de fábrica com alta durabilidade.',
      rows: [
        { size: 'Caneca Porcelana AAA', width: '8,2 cm (diâmetro)', height: '9,5 cm (325 ml)', sleeve: 'Área arte: 20x9cm' },
        { size: 'Caneca Alumínio Formando', width: '8,5 cm (diâmetro)', height: '11,5 cm (500 ml)', sleeve: 'Tirante incluso' },
        { size: 'Wind Banner Padrão', width: '70 cm (largura)', height: '2,5 m a 3,0 m (altura)', sleeve: 'Haste + Base' },
        { size: 'Bandeira Promocional', width: '1,50 m', height: '1,00 m', sleeve: 'Com ilhós/bainha' },
      ],
    },
  };

  const currentData = sizeTables[activeTab as keyof typeof sizeTables] || sizeTables.camiseta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Guia de Tamanhos &amp; Medidas</h3>
              <p className="text-xs text-slate-400">Tenório Confecções • Padrão ABNT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-3 sm:px-6 bg-slate-950/40 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'camiseta', label: 'Camisetas' },
            { id: 'polo', label: 'Polos' },
            { id: 'moletom', label: 'Moletons' },
            { id: 'abada', label: 'Abadás' },
            { id: 'brindes', label: 'Canecas / Banners' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          <div>
            <h4 className="text-sm font-bold text-white">{currentData.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{currentData.description}</p>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-inner bg-slate-950/60">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tamanho</th>
                  <th className="py-3 px-4">Largura (Tórax)</th>
                  <th className="py-3 px-4">Altura (Comprimento)</th>
                  <th className="py-3 px-4">Manga / Detalhe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {currentData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-4 font-black text-blue-400">{row.size}</td>
                    <td className="py-2.5 px-4 text-slate-200">{row.width}</td>
                    <td className="py-2.5 px-4 text-slate-200">{row.height}</td>
                    <td className="py-2.5 px-4 text-slate-400">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Como Medir Dica */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-xs space-y-2 text-slate-200">
            <div className="flex items-center gap-2 font-bold text-blue-400">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Dica de ouro para não errar no tamanho:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Pegue uma peça que você já usa e gosta do caimento. Estique-a sobre uma mesa e meça com uma régua ou fita métrica a <strong>largura (de uma axila até a outra)</strong> e a <strong>altura (do ombro mais alto até a barra)</strong>. Depois, basta comparar com a tabela acima!
            </p>
            <p className="text-[10px] text-slate-400 italic">
              *Tolerância de produção de até 1,5 cm para mais ou para menos em razão do processo de corte e costura.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all"
          >
            ENTENDI, VOLTAR AO PRODUTO
          </button>
        </div>
      </div>
    </div>
  );
}
