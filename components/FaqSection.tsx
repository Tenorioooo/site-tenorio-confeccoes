'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Qual é a quantidade mínima de pedido?',
      answer: 'Trabalhamos com quantidade mínima a partir de 10 unidades por modelo para camisetas e produtos de vestuário. Para canecas e brindes especiais, consulte pelo WhatsApp.',
    },
    {
      question: 'Posso enviar minha própria arte ou logotipo?',
      answer: 'Sim! Aceitamos arquivos em JPG, PNG, PDF, SVG e WEBP. Nossa equipe técnica analisa a resolução da imagem para garantir a máxima fidelidade na impressão.',
    },
    {
      question: 'Vocês criam a arte caso eu não tenha?',
      answer: 'Sim, possuímos equipe de design para auxiliar na montagem do layout e adequação da estampa ao produto escolhido.',
    },
    {
      question: 'Qual o prazo médio de produção?',
      answer: 'O prazo de produção varia entre 7 e 15 dias úteis após a aprovação da amostra virtual e confirmação do pedido, dependendo da quantidade.',
    },
    {
      question: 'Vocês realizam entregas para outras cidades e estados?',
      answer: 'Sim! Entregamos em todo o Brasil via Correios, transportadoras parceiras e frete expresso.',
    },
    {
      question: 'Posso solicitar produtos diferentes no mesmo orçamento?',
      answer: 'Com certeza! Nosso sistema permite montar um orçamento unificado contendo camisetas, moletons, canecas e abadás em uma única solicitação.',
    },
    {
      question: 'Posso escolher estampas do catálogo da Tenório?',
      answer: 'Sim! Disponibilizamos um catálogo exclusivo com estampas prontas identificadas por códigos (ex: EST-001) para facilitar seu pedido.',
    },
    {
      question: 'E se eu quiser uma estampa que não está no catálogo?',
      answer: 'Basta selecionar a opção "Tenho minha própria arte" e fazer o upload do arquivo ou imagem de referência na tela de orçamento.',
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-slate-950 text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
            TIRE SUAS DÚVIDAS
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Perguntas Frequentes (FAQ)
          </h2>
          <p className="text-slate-400 text-base">
            Esclareça rapidamente as principais dúvidas sobre pedidos, estampas e prazos.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-white hover:text-blue-400 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <div
                    className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-400 bg-slate-800' : ''
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4 animate-in slide-in-from-top duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
