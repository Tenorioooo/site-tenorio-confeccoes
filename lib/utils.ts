import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateQuoteCode(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `ORC-${year}-${randomNum}`;
}

export interface QuoteCartItem {
  id: string;
  productId?: string;
  productName: string;
  category?: string;
  productImage?: string;
  printId?: string;
  printCode?: string;
  printName?: string;
  printImage?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  pricingTiers?: string | any[];
  basePrice?: number;
  sizes: { [size: string]: number };
  customizationPositions: string[];
  hasCustomArt: boolean;
  customArtFiles?: { name: string; url: string; size: number }[];
  notes?: string;
}

export function formatWhatsAppMessage(params: {
  customerName: string;
  whatsapp: string;
  email?: string;
  city?: string;
  state?: string;
  desiredDate?: string;
  notes?: string;
  quoteCode: string;
  items: QuoteCartItem[];
  estimatedTotal?: number;
}): string {
  const { customerName, whatsapp, email, city, state, desiredDate, notes, quoteCode, items, estimatedTotal } = params;

  let text = `*SOLICITAÇÃO DE ORÇAMENTO — TENÓRIO CONFECÇÕES*\n`;
  text += `*Código do Orçamento:* ${quoteCode}\n`;
  text += `----------------------------------------\n`;
  text += `*Cliente:* ${customerName}\n`;
  text += `*WhatsApp:* ${whatsapp}\n`;
  if (email) text += `*E-mail:* ${email}\n`;
  if (city || state) text += `*Localização:* ${city || ''} - ${state || ''}\n`;
  if (desiredDate) text += `*Prazo Desejado:* ${desiredDate}\n`;
  text += `----------------------------------------\n\n`;

  text += `*ITENS DO PEDIDO (${items.length}):*\n\n`;

  let totalEstimatedSum = 0;

  items.forEach((item, idx) => {
    const itemTotal = item.totalPrice || (item.unitPrice ? item.unitPrice * item.quantity : 0);
    totalEstimatedSum += itemTotal;

    text += `*${idx + 1}. ${item.productName}*\n`;
    text += `   • Quantidade: ${item.quantity} unidades\n`;

    if (item.unitPrice && item.unitPrice > 0) {
      text += `   • Preço Estimado: R$ ${item.unitPrice.toFixed(2).replace('.', ',')} / un\n`;
      text += `   • Subtotal Item: R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`;
    }

    let sizesStr = '';
    try {
      const pTiers = typeof item.pricingTiers === 'string' ? JSON.parse(item.pricingTiers) : item.pricingTiers;
      if (pTiers && pTiers.mode === 'by_variant' && pTiers.variantTiers) {
        sizesStr = Object.entries(item.sizes || {})
          .filter(([, q]) => Number(q) > 0)
          .map(([s, q]) => {
            const vTiers = pTiers.variantTiers[s] || [];
            const matchingTier = [...vTiers]
              .sort((a: any, b: any) => a.minQty - b.minQty)
              .findLast((t: any) => Number(q) >= t.minQty && (t.maxQty === null || t.maxQty === undefined || Number(q) <= t.maxQty)) || vTiers[0];
            const vPrice = matchingTier ? ` (R$ ${Number(matchingTier.unitPrice).toFixed(2).replace('.', ',')}/un)` : '';
            return `${s}: ${q} un${vPrice}`;
          })
          .join(' | ');
      } else {
        sizesStr = Object.entries(item.sizes || {})
          .filter(([, q]) => Number(q) > 0)
          .map(([s, q]) => `${s}: ${q}`)
          .join(' | ');
      }
    } catch {
      sizesStr = Object.entries(item.sizes || {})
        .filter(([, q]) => Number(q) > 0)
        .map(([s, q]) => `${s}: ${q}`)
        .join(' | ');
    }

    if (sizesStr) {
      text += `   • Grade de Tamanhos/Variações: ${sizesStr}\n`;
    }

    if (item.printCode) {
      text += `   • Estampa: ${item.printCode} (${item.printName || 'Catálogo'})\n`;
    } else if (item.hasCustomArt) {
      text += `   • Estampa: Arte própria do cliente anexada\n`;
    }

    if (item.customizationPositions && item.customizationPositions.length > 0) {
      text += `   • Locais: ${item.customizationPositions.join(', ')}\n`;
    }

    if (item.notes) {
      text += `   • Obs do Item: ${item.notes}\n`;
    }
    text += `\n`;
  });

  const finalTotal = estimatedTotal || totalEstimatedSum;
  if (finalTotal > 0) {
    text += `----------------------------------------\n`;
    text += `💰 *VALOR ESTIMADO TOTAL: R$ ${finalTotal.toFixed(2).replace('.', ',')}*\n`;
    text += `_(Sujeito à confirmação conforme acabamentos e personalização)_\n`;
    text += `----------------------------------------\n\n`;
  }

  if (notes) {
    text += `*OBSERVAÇÕES GERAIS:* ${notes}\n\n`;
  }

  text += `Olá! Vim pelo site da Tenório Confecções e gostaria de confirmar esse orçamento.`;

  return text;
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}
