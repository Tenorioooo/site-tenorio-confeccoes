'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuoteCart } from '@/lib/cart';
import { useFavorites } from '@/lib/favorites';
import { toast } from 'sonner';
import {
  Sparkles,
  Heart,
  Check,
  Plus,
  Minus,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  FileText,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { 
  calculateProductPrice, 
  calculateDetailedProductPrice, 
  parsePricingTiers, 
  parseProductPricing, 
  formatCurrency 
} from '@/lib/pricing';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Personalization tab state: 'catalog' vs 'custom'
  const [personalizationType, setPersonalizationType] = useState<'catalog' | 'custom'>('catalog');
  const [selectedPrintCode, setSelectedPrintCode] = useState<string>('EST-001');

  // Custom Art Upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; size: number }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Customization Positions
  const [positions, setPositions] = useState<string[]>(['Frente']);

  // Active variant tab in tier table preview
  const [activeTierVariantTab, setActiveTierVariantTab] = useState<string>('');

  // Sizes breakdown matrix — starts empty, filled after product loads
  const [sizeQuantities, setSizeQuantities] = useState<{ [size: string]: number }>({});

  // Observations
  const [notes, setNotes] = useState('');

  const { addItem } = useQuoteCart();
  const { isProductFavorite, toggleFavoriteProduct } = useFavorites();

  // Helper function to get default sizes based on category
  const getDefaultSizesForCategory = (category?: string) => {
    const nonClothing = ['Canecas', 'Bandeiras', 'Wind Banner', 'Outros'];
    if (category && nonClothing.some((c) => category.toLowerCase().includes(c.toLowerCase()))) {
      return ['Tamanho Único'];
    }
    return ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
  };

  const DEFAULT_COLORS = ['Branco', 'Preto', 'Azul Marinho', 'Cinza Mescla', 'Vermelho'];

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.images && data.images.length > 0) {
            setActiveImage(data.images[0].imageUrl);
          }

          // Parse colors with fallback
          let colors: string[] = [];
          try {
            const parsed = typeof data.availableColors === 'string' ? JSON.parse(data.availableColors) : data.availableColors;
            if (Array.isArray(parsed) && parsed.length > 0) {
              colors = parsed.filter(Boolean);
            }
          } catch (e) {
            colors = [];
          }
          if (colors.length === 0) {
            colors = DEFAULT_COLORS;
          }
          setSelectedColor(colors[0] || 'Padrão');

          // Parse sizes with fallback
          let sizes: string[] = [];
          try {
            const parsed = typeof data.availableSizes === 'string' ? JSON.parse(data.availableSizes) : data.availableSizes;
            if (Array.isArray(parsed) && parsed.length > 0) {
              sizes = parsed.filter(Boolean);
            }
          } catch (e) {
            sizes = [];
          }
          if (sizes.length === 0) {
            sizes = getDefaultSizesForCategory(data.category);
          }

          // Initialize size quantities
          const initialQtys: { [size: string]: number } = {};
          sizes.forEach((s: string) => { initialQtys[s] = 0; });
          setSizeQuantities(initialQtys);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchProduct();
      trackEvent('view_product', { slug });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 text-center bg-slate-950 text-white min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-32 text-center bg-slate-950 text-white min-h-screen flex items-center justify-center">
        <div className="space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">Produto não encontrado</h2>
          <p className="text-sm text-slate-400">O produto solicitado não existe ou foi desativado.</p>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 bg-blue-500 text-slate-950 px-6 py-3 rounded-xl font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            VOLTAR AO CATÁLOGO
          </Link>
        </div>
      </div>
    );
  }

  // Parse available colors & sizes for render
  let availableSizes: string[] = [];
  try {
    const parsed = typeof product.availableSizes === 'string' ? JSON.parse(product.availableSizes) : product.availableSizes;
    if (Array.isArray(parsed) && parsed.length > 0) {
      availableSizes = parsed.filter(Boolean);
    }
  } catch (e) {}
  if (availableSizes.length === 0) {
    availableSizes = getDefaultSizesForCategory(product.category);
  }

  let availableColors: string[] = [];
  try {
    const parsed = typeof product.availableColors === 'string' ? JSON.parse(product.availableColors) : product.availableColors;
    if (Array.isArray(parsed) && parsed.length > 0) {
      availableColors = parsed.filter(Boolean);
    }
  } catch (e) {}
  if (availableColors.length === 0) {
    availableColors = DEFAULT_COLORS;
  }

  const DEFAULT_POSITIONS_LIST = [
    'Frente',
    'Costas',
    'Manga Direita',
    'Manga Esquerda',
    'Nome Individual',
    'Número Individual',
    'Outro Local',
  ];

  let availablePositionsList = DEFAULT_POSITIONS_LIST;
  try {
    const parsed = typeof product.customizationPositions === 'string' ? JSON.parse(product.customizationPositions) : product.customizationPositions;
    if (Array.isArray(parsed) && parsed.length > 0) {
      availablePositionsList = parsed.filter(Boolean);
    }
  } catch (e) {}

  const handleSizeQtyChange = (size: string, delta: number) => {
    setSizeQuantities((prev) => {
      const current = prev[size] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [size]: updated };
    });
  };

  const handleSizeQtyInput = (size: string, val: string) => {
    const num = parseInt(val, 10);
    setSizeQuantities((prev) => ({
      ...prev,
      [size]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const totalItemQuantity = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);

  const togglePosition = (pos: string) => {
    setPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedFiles((prev) => [...prev, { name: data.originalName, url: data.url, size: data.size }]);
        toast.success('Arquivo enviado com sucesso!');
        trackEvent('upload_art', { fileName: data.originalName });
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Erro ao enviar arquivo.');
      }
    } catch (e) {
      toast.error('Erro de conexão ao fazer upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = () => {
    if (totalItemQuantity === 0) {
      toast.error('Por favor, informe a quantidade de pelo menos um tamanho/variação.');
      return;
    }

    const detailedPricing = calculateDetailedProductPrice(
      sizeQuantities,
      product.pricingTiers,
      product.basePrice || 0
    );

    addItem({
      productId: product.id,
      productName: `${product.name} (${selectedColor || 'Padrão'})`,
      category: product.category,
      productImage: activeImage || (product.images?.[0]?.imageUrl ?? ''),
      printCode: personalizationType === 'catalog' ? selectedPrintCode : undefined,
      printName: personalizationType === 'catalog' ? `Estampa ${selectedPrintCode}` : undefined,
      quantity: totalItemQuantity,
      unitPrice: detailedPricing.averageUnitPrice,
      totalPrice: detailedPricing.totalPrice,
      pricingTiers: product.pricingTiers,
      basePrice: product.basePrice || 0,
      sizes: sizeQuantities,
      customizationPositions: positions,
      hasCustomArt: personalizationType === 'custom',
      customArtFiles: personalizationType === 'custom' ? uploadedFiles : undefined,
      notes: notes || undefined,
    });

    trackEvent('add_to_quote', { productId: product.id, quantity: totalItemQuantity });
    toast.success('Produto adicionado ao seu orçamento!');
  };

  const isFav = isProductFavorite(product.id);

  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-400">
            Início
          </Link>
          <span>/</span>
          <Link href="/produtos" className="hover:text-blue-400">
            Produtos
          </Link>
          <span>/</span>
          <span className="text-blue-400 font-bold">{product.name}</span>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <Image
                src={activeImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />

              <button
                onClick={() => toggleFavoriteProduct(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border transition-all ${
                  isFav
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg'
                    : 'bg-slate-950/70 text-slate-300 border-slate-700 hover:text-rose-400'
                }`}
                title={isFav ? 'Remover dos favoritos' : 'Favoritar'}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
              </button>

              <span className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-bold text-blue-400 px-3 py-1.5 rounded-full uppercase">
                {product.category}
              </span>
            </div>

            {/* Thumbnail Gallery Row */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === img.imageUrl
                        ? 'border-blue-400 shadow-lg'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.imageUrl} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Specifications Box */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider text-blue-400">
                Especificações Técnicas
              </h4>
              <p className="leading-relaxed text-slate-300">{product.details || product.description}</p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <div>
                  <span className="text-slate-500">Técnicas de Impressão:</span>
                  <p className="font-semibold text-white mt-0.5">
                    {product.printTechniques || 'Silk Screen, Sublimação, DTF HD, Bordado'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Prazo Padrão:</span>
                  <p className="font-semibold text-white mt-0.5">
                    {product.leadTime || '7 a 15 dias úteis'}
                  </p>
                </div>
                {product.minQuantity && (
                  <div className="col-span-2 pt-2 border-t border-slate-800/60">
                    <span className="text-slate-500">Pedido Mínimo:</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">{product.minQuantity}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customizer & Configurator Form */}
          <div className="lg:col-span-6 space-y-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Header Info */}
            <div className="space-y-2 border-b border-slate-800 pb-6">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">{product.name}</h1>
              <p className="text-xs text-slate-400 leading-relaxed">{product.description}</p>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="inline-block text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  {product.priceRange || 'Consulte o valor por quantidade'}
                </span>
                {product.minQuantity && (
                  <span className="inline-block text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    Mínimo: {product.minQuantity}
                  </span>
                )}
              </div>
            </div>

            {/* Price Tier Table — Unified or By Variant */}
            {(() => {
              const pricingConfig = parseProductPricing(product.pricingTiers);
              const detailedCalc = calculateDetailedProductPrice(
                sizeQuantities,
                product.pricingTiers,
                product.basePrice || 0
              );

              if (pricingConfig.mode === 'by_variant' && pricingConfig.variantTiers) {
                const variantKeys = Object.keys(pricingConfig.variantTiers);
                if (variantKeys.length === 0) return null;

                const currentVariantKey = activeTierVariantTab && pricingConfig.variantTiers[activeTierVariantTab]
                  ? activeTierVariantTab
                  : variantKeys[0];
                const activeTiers = pricingConfig.variantTiers[currentVariantKey] || [];
                const currentVariantQty = sizeQuantities[currentVariantKey] ?? 0;
                const currentVariantCalc = calculateProductPrice(currentVariantQty > 0 ? currentVariantQty : 1, activeTiers, product.basePrice || 0);

                return (
                  <div className="space-y-3 bg-slate-950 border border-purple-500/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Tabela de Preços por Variação:
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                        Preço por {currentVariantKey}
                      </span>
                    </div>

                    {/* Variant Tabs */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {variantKeys.map((vKey) => (
                        <button
                          key={vKey}
                          type="button"
                          onClick={() => setActiveTierVariantTab(vKey)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                            currentVariantKey === vKey
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {vKey}
                        </button>
                      ))}
                    </div>

                    {/* Tiers for currently selected variant tab */}
                    <div className="grid gap-1.5">
                      {activeTiers.map((tier, i) => {
                        const isActive = currentVariantCalc.activeTier?.minQty === tier.minQty && currentVariantQty > 0;
                        const discount = i > 0 && activeTiers[0].unitPrice > 0 ? Math.round(((activeTiers[0].unitPrice - tier.unitPrice) / activeTiers[0].unitPrice) * 100) : 0;

                        return (
                          <div
                            key={i}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/20'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            <span>
                              {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} un de {currentVariantKey}
                            </span>
                            <div className="flex items-center gap-2">
                              {discount > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-slate-950/30 text-white' : 'bg-purple-500/10 text-purple-300'}`}>
                                  -{discount}%
                                </span>
                              )}
                              <span className={`text-sm ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                {formatCurrency(tier.unitPrice)}/un
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Combined Live Calc Summary */}
                    {totalItemQuantity > 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5 mt-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-bold text-slate-300">Resumo da Seleção:</span>
                          <span className="text-emerald-400 font-extrabold text-sm">
                            Total: {formatCurrency(detailedCalc.totalPrice)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800">
                          {detailedCalc.breakdown.filter((b) => b.quantity > 0).map((b) => (
                            <div key={b.variant} className="flex justify-between">
                              <span>• {b.quantity}x {b.variant} ({formatCurrency(b.unitPrice)}/un)</span>
                              <span className="text-white font-bold">{formatCurrency(b.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Unified Mode
              const tiers = pricingConfig.tiers || [];
              if (tiers.length === 0) return null;
              const pricing = calculateProductPrice(totalItemQuantity, tiers, product.basePrice || 0);

              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Preços por Quantidade:</span>
                  </div>
                  <div className="grid gap-1.5">
                    {tiers.map((tier, i) => {
                      const isActive = pricing.activeTier?.minQty === tier.minQty;
                      const discount = i > 0 && tiers[0].unitPrice > 0 ? Math.round(((tiers[0].unitPrice - tier.unitPrice) / tiers[0].unitPrice) * 100) : 0;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                            isActive && totalItemQuantity > 0
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          <span>
                            {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} peças
                          </span>
                          <div className="flex items-center gap-2">
                            {discount > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${isActive && totalItemQuantity > 0 ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                -{discount}%
                              </span>
                            )}
                            <span className={`text-sm ${isActive && totalItemQuantity > 0 ? 'text-slate-950' : 'text-white'}`}>
                              {formatCurrency(tier.unitPrice)}/un
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live calc summary */}
                  {totalItemQuantity > 0 && (
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{totalItemQuantity} peças × {formatCurrency(pricing.unitPrice)}</span>
                      </div>
                      <div className="text-sm font-extrabold text-emerald-400">
                        {formatCurrency(pricing.total)}
                      </div>
                    </div>
                  )}

                  {/* Upsell nudge */}
                  {pricing.nextTier && pricing.diffForNextTier > 0 && (
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 text-[11px] text-blue-300 font-bold">
                      <Zap className="w-3 h-3 text-blue-400 shrink-0" />
                      Adicione mais {pricing.diffForNextTier} peças e economize {pricing.potentialSavingsPercent}% por unidade!
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Step 1: Color Selection */}
            {availableColors.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  1. Escolha a Cor Base:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedColor === color
                          ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personalization Type (Catalog vs Custom Art) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                2. Escolha sua Personalização:
              </label>

              {/* Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setPersonalizationType('catalog')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    personalizationType === 'catalog'
                      ? 'bg-blue-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Estampas do Catálogo</span>
                </button>

                <button
                  onClick={() => setPersonalizationType('custom')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    personalizationType === 'custom'
                      ? 'bg-blue-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Tenho Minha Própria Arte</span>
                </button>
              </div>

              {/* Tab Content 1: Catalog Prints */}
              {personalizationType === 'catalog' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Código da Estampa Escolhida:</span>
                    <Link href="/estampas" className="text-xs text-blue-400 hover:underline">
                      Ver Catálogo de Estampas →
                    </Link>
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: EST-001, EST-002, EST-008..."
                    value={selectedPrintCode}
                    onChange={(e) => setSelectedPrintCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-bold focus:border-blue-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    Insira o código da estampa desejada. Você pode pesquisar todas as estampas no nosso catálogo.
                  </p>
                </div>
              )}

              {/* Tab Content 2: Custom Artwork Upload */}
              {personalizationType === 'custom' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">Envie sua Própria Imagem/Arte:</span>
                    <p className="text-[11px] text-slate-400">
                      Formatos aceitos: JPG, PNG, PDF, SVG, WEBP (máx. 15MB).
                    </p>
                  </div>

                  <label className="border-2 border-dashed border-slate-700 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-900/50">
                    <Upload className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-xs font-bold text-white">
                      {uploading ? 'Enviando arquivo...' : 'Clique para selecionar seu arquivo'}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.svg,.webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {/* Uploaded files list preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-300">Arquivos Anexados:</span>
                      {uploadedFiles.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate text-white font-medium">{f.name}</span>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Size Quantities Distribution */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  3. Divisão por Tamanhos:
                </label>
                <span className="text-xs font-bold text-blue-400">
                  Total: {totalItemQuantity} unidades
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableSizes.map((size) => {
                  const qty = sizeQuantities[size] ?? 0;
                  const isSelected = qty > 0;

                  // Price tag for this variant if in by_variant mode
                  const pricingConfig = parseProductPricing(product.pricingTiers);
                  let variantPriceTag = '';
                  if (pricingConfig.mode === 'by_variant' && pricingConfig.variantTiers && pricingConfig.variantTiers[size]) {
                    const vTiers = pricingConfig.variantTiers[size];
                    if (vTiers.length > 0) {
                      const activeVPrice = calculateProductPrice(qty > 0 ? qty : 1, vTiers, product.basePrice || 0);
                      variantPriceTag = `${formatCurrency(activeVPrice.unitPrice)}/un`;
                    }
                  }

                  return (
                    <div
                      key={size}
                      className={`border rounded-2xl p-3 flex flex-col justify-between gap-2 transition-all ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500/60 shadow-lg shadow-blue-500/5'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                          {size}
                        </span>
                        {variantPriceTag && (
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                            {variantPriceTag}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">Qtd:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSizeQtyChange(size, -1); }}
                            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:border-red-500/40 border border-slate-700 text-white flex items-center justify-center font-bold text-sm transition-all active:scale-90 select-none shrink-0"
                            title="Diminuir 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={qty === 0 ? '' : qty}
                            placeholder="0"
                            onChange={(e) => handleSizeQtyInput(size, e.target.value)}
                            className="w-12 h-8 text-center font-bold text-sm text-white bg-slate-900 border border-slate-800 rounded-lg focus:border-blue-400 focus:outline-none tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSizeQtyChange(size, 1); }}
                            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-blue-500/30 hover:border-blue-500/50 border border-slate-700 text-white flex items-center justify-center font-bold text-sm transition-all active:scale-90 select-none shrink-0"
                            title="Aumentar 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Customization Positions */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                4. Locais de Personalização:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availablePositionsList.map((pos) => {
                  const isChecked = positions.includes(pos);

                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => togglePosition(pos)}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                        isChecked
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{pos}</span>
                      {isChecked && <Check className="w-4 h-4 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                5. Observações Especiais para este item:
              </label>
              <textarea
                placeholder="Ex: Gostaria de nomes individuais nas costas, gola em cor contraste, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none h-20 resize-none"
              />
            </div>

            {/* CTA Button */}
            <button
              onClick={handleAddToCart}
              className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-slate-950 font-extrabold py-4 rounded-xl shadow-xl shadow-blue-500/20 text-base transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              <span>ADICIONAR AO MEU ORÇAMENTO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
