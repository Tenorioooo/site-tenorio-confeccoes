export interface PricingTier {
  minQty: number;
  maxQty?: number | null;
  unitPrice: number;
  label?: string;
}

export interface ProductPricingConfig {
  mode: 'unified' | 'by_variant';
  tiers?: PricingTier[];
  variantTiers?: { [variant: string]: PricingTier[] };
}

export function parsePricingTiers(input?: string | PricingTier[] | null): PricingTier[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed
        .map((tier) => ({
          minQty: Number(tier.minQty) || 0,
          maxQty: tier.maxQty !== null && tier.maxQty !== undefined && tier.maxQty !== '' ? Number(tier.maxQty) : null,
          unitPrice: Number(tier.unitPrice) || 0,
          label: tier.label || undefined,
        }))
        .filter((t) => t.minQty > 0 && t.unitPrice > 0)
        .sort((a, b) => a.minQty - b.minQty);
    }
    // If it's a full config object, extract unified tiers
    if (parsed && typeof parsed === 'object') {
      if (parsed.mode === 'unified' && Array.isArray(parsed.tiers)) {
        return parsePricingTiers(parsed.tiers);
      }
    }
  } catch (e) {
    return [];
  }
  return [];
}

export function parseProductPricing(input?: any): ProductPricingConfig {
  if (!input) {
    return { mode: 'unified', tiers: [] };
  }

  let obj = input;
  if (typeof input === 'string') {
    try {
      obj = JSON.parse(input);
    } catch {
      return { mode: 'unified', tiers: [] };
    }
  }

  if (Array.isArray(obj)) {
    return {
      mode: 'unified',
      tiers: parsePricingTiers(obj),
    };
  }

  if (obj && typeof obj === 'object') {
    if (obj.mode === 'by_variant' && obj.variantTiers && typeof obj.variantTiers === 'object') {
      const parsedVariants: { [v: string]: PricingTier[] } = {};
      for (const [vName, vTiers] of Object.entries(obj.variantTiers)) {
        parsedVariants[vName] = parsePricingTiers(vTiers as any);
      }
      return {
        mode: 'by_variant',
        variantTiers: parsedVariants,
        tiers: parsePricingTiers(obj.tiers),
      };
    }

    if (obj.mode === 'unified' || Array.isArray(obj.tiers)) {
      return {
        mode: 'unified',
        tiers: parsePricingTiers(obj.tiers),
      };
    }
  }

  return { mode: 'unified', tiers: [] };
}

export interface PriceCalculationResult {
  unitPrice: number;
  total: number;
  activeTier?: PricingTier;
  nextTier?: PricingTier;
  diffForNextTier: number;
  potentialSavingsPercent: number;
  savingsVsFirstTier: number;
  hasTiers: boolean;
}

export function calculateProductPrice(
  quantity: number,
  tiersInput?: string | PricingTier[] | null,
  basePrice: number = 0
): PriceCalculationResult {
  const tiers = parsePricingTiers(tiersInput);

  if (tiers.length === 0) {
    const unitPrice = basePrice > 0 ? basePrice : 0;
    return {
      unitPrice,
      total: unitPrice * (quantity > 0 ? quantity : 0),
      activeTier: undefined,
      nextTier: undefined,
      diffForNextTier: 0,
      potentialSavingsPercent: 0,
      savingsVsFirstTier: 0,
      hasTiers: false,
    };
  }

  // Find matching tier
  let activeTier: PricingTier | undefined = undefined;
  for (const tier of tiers) {
    if (quantity >= tier.minQty) {
      if (tier.maxQty === null || tier.maxQty === undefined || quantity <= tier.maxQty) {
        activeTier = tier;
        break;
      }
    }
  }

  // If quantity is lower than minimum tier, use first tier's price
  if (!activeTier) {
    if (quantity < tiers[0].minQty) {
      activeTier = tiers[0];
    } else {
      activeTier = tiers[tiers.length - 1];
    }
  }

  const unitPrice = activeTier.unitPrice;
  const total = unitPrice * (quantity > 0 ? quantity : 0);

  // Find next tier for upselling / savings alert
  const currentTierIndex = tiers.findIndex((t) => t.minQty === activeTier?.minQty);
  let nextTier: PricingTier | undefined = undefined;
  let diffForNextTier = 0;
  let potentialSavingsPercent = 0;

  if (currentTierIndex !== -1 && currentTierIndex < tiers.length - 1) {
    nextTier = tiers[currentTierIndex + 1];
    diffForNextTier = nextTier.minQty - quantity;
    if (diffForNextTier > 0 && unitPrice > 0) {
      potentialSavingsPercent = Math.round(((unitPrice - nextTier.unitPrice) / unitPrice) * 100);
    }
  }

  // Calculate savings vs base tier (1st tier)
  const firstTierPrice = tiers[0].unitPrice;
  const savingsVsFirstTier =
    firstTierPrice > 0 && unitPrice < firstTierPrice
      ? Math.round(((firstTierPrice - unitPrice) / firstTierPrice) * 100)
      : 0;

  return {
    unitPrice,
    total,
    activeTier,
    nextTier: diffForNextTier > 0 ? nextTier : undefined,
    diffForNextTier: diffForNextTier > 0 ? diffForNextTier : 0,
    potentialSavingsPercent,
    savingsVsFirstTier,
    hasTiers: true,
  };
}

export interface VariantItemBreakdown {
  variant: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  activeTier?: PricingTier;
  nextTier?: PricingTier;
  diffForNextTier?: number;
  potentialSavingsPercent?: number;
}

export interface DetailedPricingCalculationResult {
  isByVariant: boolean;
  totalQuantity: number;
  totalPrice: number;
  averageUnitPrice: number;
  breakdown: VariantItemBreakdown[];
  hasPricing: boolean;
}

export function calculateDetailedProductPrice(
  sizeQuantities: { [size: string]: number },
  pricingInput?: any,
  basePrice: number = 0
): DetailedPricingCalculationResult {
  const config = parseProductPricing(pricingInput);
  const totalQuantity = Object.values(sizeQuantities || {}).reduce((sum, q) => sum + (Number(q) || 0), 0);

  if (config.mode === 'by_variant' && config.variantTiers && Object.keys(config.variantTiers).length > 0) {
    let totalPrice = 0;
    const breakdown: VariantItemBreakdown[] = [];

    for (const [variant, qtyVal] of Object.entries(sizeQuantities || {})) {
      const qty = Number(qtyVal) || 0;
      const vTiers = config.variantTiers[variant] || [];
      
      // Calculate price for this variant. We use either variant qty or fallback to basePrice
      const calc = calculateProductPrice(qty > 0 ? qty : 1, vTiers, basePrice);
      const unitPrice = calc.unitPrice;
      const subtotal = unitPrice * qty;

      if (qty > 0 || vTiers.length > 0) {
        breakdown.push({
          variant,
          quantity: qty,
          unitPrice,
          subtotal,
          activeTier: calc.activeTier,
          nextTier: calc.nextTier,
          diffForNextTier: calc.diffForNextTier,
          potentialSavingsPercent: calc.potentialSavingsPercent,
        });
      }

      totalPrice += subtotal;
    }

    const hasPricing = breakdown.some((b) => b.unitPrice > 0);
    const averageUnitPrice = totalQuantity > 0 ? totalPrice / totalQuantity : 0;

    return {
      isByVariant: true,
      totalQuantity,
      totalPrice,
      averageUnitPrice,
      breakdown,
      hasPricing,
    };
  }

  // Unified mode calculation
  const unifiedTiers = config.tiers || [];
  const calc = calculateProductPrice(totalQuantity > 0 ? totalQuantity : 1, unifiedTiers, basePrice);
  const unitPrice = calc.unitPrice;
  const totalPrice = unitPrice * totalQuantity;

  const breakdown: VariantItemBreakdown[] = [];
  for (const [variant, qtyVal] of Object.entries(sizeQuantities || {})) {
    const qty = Number(qtyVal) || 0;
    if (qty > 0) {
      breakdown.push({
        variant,
        quantity: qty,
        unitPrice,
        subtotal: unitPrice * qty,
        activeTier: calc.activeTier,
        nextTier: calc.nextTier,
        diffForNextTier: calc.diffForNextTier,
        potentialSavingsPercent: calc.potentialSavingsPercent,
      });
    }
  }

  return {
    isByVariant: false,
    totalQuantity,
    totalPrice,
    averageUnitPrice: unitPrice,
    breakdown,
    hasPricing: calc.hasTiers || basePrice > 0,
  };
}

export function formatCurrency(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return 'Sob Consulta';
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const TIER_PRESETS = [
  {
    id: 'standard',
    name: 'Padrão (10 a 100+ peças)',
    tiers: [
      { minQty: 10, maxQty: 29, unitPrice: 35.0 },
      { minQty: 30, maxQty: 49, unitPrice: 30.0 },
      { minQty: 50, maxQty: 99, unitPrice: 26.0 },
      { minQty: 100, maxQty: null, unitPrice: 22.0 },
    ],
  },
  {
    id: 'wholesale',
    name: 'Atacado Alto Volume (20 a 300+ peças)',
    tiers: [
      { minQty: 20, maxQty: 49, unitPrice: 28.0 },
      { minQty: 50, maxQty: 99, unitPrice: 24.0 },
      { minQty: 100, maxQty: 299, unitPrice: 20.0 },
      { minQty: 300, maxQty: null, unitPrice: 17.0 },
    ],
  },
  {
    id: 'canecas',
    name: 'Canecas & Brindes (1 a 50+ un)',
    tiers: [
      { minQty: 1, maxQty: 10, unitPrice: 28.46 },
      { minQty: 11, maxQty: 29, unitPrice: 25.0 },
      { minQty: 30, maxQty: 49, unitPrice: 22.0 },
      { minQty: 50, maxQty: null, unitPrice: 19.5 },
    ],
  },
  {
    id: 'uniforms',
    name: 'Uniformes & Polos (10 a 100+ peças)',
    tiers: [
      { minQty: 10, maxQty: 24, unitPrice: 48.0 },
      { minQty: 25, maxQty: 49, unitPrice: 42.0 },
      { minQty: 50, maxQty: 99, unitPrice: 38.0 },
      { minQty: 100, maxQty: null, unitPrice: 34.0 },
    ],
  },
];
