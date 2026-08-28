'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Upload, 
  ImageIcon, 
  RefreshCw, 
  Link as LinkIcon,
  Search,
  Tag,
  Palette,
  Ruler,
  MapPin,
  Clock,
  Layers,
  FileText,
  DollarSign,
  Check,
  ExternalLink,
  TrendingDown,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  parsePricingTiers, 
  parseProductPricing, 
  TIER_PRESETS, 
  formatCurrency, 
  calculateProductPrice,
  calculateDetailedProductPrice,
  type PricingTier, 
  type ProductPricingConfig 
} from '@/lib/pricing';

const CATEGORIES = [
  'Camisetas',
  'Moletons',
  'Canecas',
  'Abadás',
  'Bandeiras',
  'Wind Banner',
  'Uniformes',
  'Eventos',
  'Corporativo',
  'Outros',
];

const PRESET_SIZES_ADULT = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
const PRESET_SIZES_KIDS = ['02', '04', '06', '08', '10', '12', '14', '16'];
const PRESET_SIZES_PLUS = ['G1', 'G2', 'G3', 'G4'];
const PRESET_SIZES_UNIQUE = ['Tamanho Único'];

const PRESET_COLORS_BASIC = ['Branco', 'Preto', 'Cinza Mescla', 'Azul Marinho', 'Vermelho'];
const PRESET_COLORS_VIBRANT = ['Azul Royal', 'Verde Bandeira', 'Amarelo Ouro', 'Laranja', 'Rosa Pink', 'Roxo'];

const PRESET_POSITIONS = [
  'Frente',
  'Costas',
  'Manga Direita',
  'Manga Esquerda',
  'Nome Individual',
  'Número Individual',
  'Gola / Capuz',
  'Lateral / Barra',
  'Outro Local',
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Camisetas');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [printTechniques, setPrintTechniques] = useState('Silk Screen, Sublimação, DTF HD, Bordado');
  const [leadTime, setLeadTime] = useState('7 a 15 dias úteis');
  const [minQuantity, setMinQuantity] = useState('10 unidades');
  const [priceRange, setPriceRange] = useState('Consulte o valor por quantidade');
  const [availableSizes, setAvailableSizes] = useState<string[]>(PRESET_SIZES_ADULT);
  const [availableColors, setAvailableColors] = useState<string[]>(PRESET_COLORS_BASIC);
  const [customizationPositions, setCustomizationPositions] = useState<string[]>(PRESET_POSITIONS.slice(0, 6));
  const [images, setImages] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Inputs for adding tags
  const [newColorInput, setNewColorInput] = useState('');
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newPositionInput, setNewPositionInput] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pricing tiers state
  const [basePrice, setBasePrice] = useState(0);
  const [pricingMode, setPricingMode] = useState<'unified' | 'by_variant'>('unified');
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [variantPricingTiers, setVariantPricingTiers] = useState<{ [variant: string]: PricingTier[] }>({});
  const [activePricingVariant, setActivePricingVariant] = useState<string>('');
  const [simQty, setSimQty] = useState(50);
  const [variantSimQtys, setVariantSimQtys] = useState<{ [variant: string]: number }>({});

  // Active form section tab
  const [formTab, setFormTab] = useState<'basic' | 'specs' | 'variants' | 'images' | 'pricing'>('basic');

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setName('');
    setCategory('Camisetas');
    setDescription('');
    setDetails('');
    setPrintTechniques('Silk Screen, Sublimação, DTF HD, Bordado');
    setLeadTime('7 a 15 dias úteis');
    setMinQuantity('10 unidades');
    setPriceRange('Consulte o valor por quantidade');
    setBasePrice(0);
    setPricingMode('unified');
    setPricingTiers([]);
    setVariantPricingTiers({});
    setActivePricingVariant(PRESET_SIZES_ADULT[0] || '');
    setSimQty(50);
    setVariantSimQtys({});
    setAvailableSizes([...PRESET_SIZES_ADULT]);
    setAvailableColors([...PRESET_COLORS_BASIC]);
    setCustomizationPositions(PRESET_POSITIONS.slice(0, 6));
    setImages([]);
    setUrlInput('');
    setShowUrlInput(false);
    setActive(true);
    setFeatured(false);
    setFormTab('basic');
    setModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingId(prod.id);
    setName(prod.name || '');
    setCategory(prod.category || 'Camisetas');
    setDescription(prod.description || '');
    setDetails(prod.details || '');
    setPrintTechniques(prod.printTechniques || 'Silk Screen, Sublimação, DTF HD, Bordado');
    setLeadTime(prod.leadTime || '7 a 15 dias úteis');
    setMinQuantity(prod.minQuantity || '10 unidades');
    setPriceRange(prod.priceRange || 'Consulte o valor por quantidade');
    setBasePrice(prod.basePrice || 0);

    // Parse sizes first so we can assign activePricingVariant
    let sizes = [...PRESET_SIZES_ADULT];
    try {
      const parsed = typeof prod.availableSizes === 'string' ? JSON.parse(prod.availableSizes) : prod.availableSizes;
      if (Array.isArray(parsed) && parsed.length > 0) sizes = parsed.filter(Boolean);
    } catch (e) {}
    setAvailableSizes(sizes);

    // Parse pricing config
    const pricingConfig = parseProductPricing(prod.pricingTiers);
    setPricingMode(pricingConfig.mode);
    setPricingTiers(pricingConfig.tiers || []);
    setVariantPricingTiers(pricingConfig.variantTiers || {});
    setActivePricingVariant(sizes[0] || '');
    setSimQty(50);

    const initialSim: { [v: string]: number } = {};
    sizes.forEach((s) => { initialSim[s] = 10; });
    setVariantSimQtys(initialSim);

    // Parse colors
    let colors = [...PRESET_COLORS_BASIC];
    try {
      const parsed = typeof prod.availableColors === 'string' ? JSON.parse(prod.availableColors) : prod.availableColors;
      if (Array.isArray(parsed) && parsed.length > 0) colors = parsed.filter(Boolean);
    } catch (e) {}
    setAvailableColors(colors);

    // Parse positions
    let positions = PRESET_POSITIONS.slice(0, 6);
    try {
      const parsed = typeof prod.customizationPositions === 'string' ? JSON.parse(prod.customizationPositions) : prod.customizationPositions;
      if (Array.isArray(parsed) && parsed.length > 0) positions = parsed.filter(Boolean);
    } catch (e) {}
    setCustomizationPositions(positions);

    const existingImgs = (prod.images || []).map((img: any) => img.imageUrl);
    setImages(existingImgs);
    setUrlInput('');
    setShowUrlInput(false);
    setActive(prod.active !== undefined ? prod.active : true);
    setFeatured(prod.featured !== undefined ? prod.featured : false);
    setFormTab('basic');
    setModalOpen(true);
  };

  // Helper functions for tags
  const addColor = (color: string) => {
    const trimmed = color.trim();
    if (!trimmed) return;
    if (!availableColors.includes(trimmed)) {
      setAvailableColors((prev) => [...prev, trimmed]);
    }
    setNewColorInput('');
  };

  const removeColor = (colorToRemove: string) => {
    setAvailableColors((prev) => prev.filter((c) => c !== colorToRemove));
  };

  const addSize = (size: string) => {
    const trimmed = size.trim().toUpperCase();
    if (!trimmed) return;
    if (!availableSizes.includes(trimmed)) {
      setAvailableSizes((prev) => [...prev, trimmed]);
    }
    setNewSizeInput('');
  };

  const removeSize = (sizeToRemove: string) => {
    setAvailableSizes((prev) => prev.filter((s) => s !== sizeToRemove));
  };

  const addPosition = (pos: string) => {
    const trimmed = pos.trim();
    if (!trimmed) return;
    if (!customizationPositions.includes(trimmed)) {
      setCustomizationPositions((prev) => [...prev, trimmed]);
    }
    setNewPositionInput('');
  };

  const removePosition = (posToRemove: string) => {
    setCustomizationPositions((prev) => prev.filter((p) => p !== posToRemove));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'products');

        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          toast.error(data.error || `Erro ao enviar ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} foto(s) enviada(s) com sucesso!`);
      }
    } catch {
      toast.error('Erro de conexão ao enviar imagem.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    toast.success('Imagem adicionada via URL!');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Por favor, informe o título/nome do produto.');
      return;
    }

    if (images.length === 0) {
      toast.error('Por favor, adicione ao menos uma foto para o produto.');
      setFormTab('images');
      return;
    }

    const pricingData = pricingMode === 'by_variant'
      ? { mode: 'by_variant', variantTiers: variantPricingTiers, tiers: pricingTiers }
      : { mode: 'unified', tiers: pricingTiers };

    const payload = {
      name: name.trim(),
      category,
      description: description.trim(),
      details: details.trim(),
      printTechniques: printTechniques.trim(),
      leadTime: leadTime.trim(),
      minQuantity: minQuantity.trim(),
      priceRange: priceRange.trim(),
      basePrice: Number(basePrice) || 0,
      pricingTiers: JSON.stringify(pricingData),
      availableSizes,
      availableColors,
      customizationPositions,
      images,
      active,
      featured,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Produto atualizado com sucesso!');
          setModalOpen(false);
          fetchProducts();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Erro ao atualizar produto.');
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Novo produto cadastrado com sucesso!');
          setModalOpen(false);
          fetchProducts();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Erro ao cadastrar produto.');
        }
      }
    } catch {
      toast.error('Erro de conexão ao salvar produto.');
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${prodName}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Produto removido!');
        fetchProducts();
      } else {
        toast.error('Erro ao excluir produto.');
      }
    } catch {
      toast.error('Falha de conexão.');
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCatFilter === 'all' || prod.category === selectedCatFilter;
    const matchesSearch =
      (prod.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (prod.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (prod.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Gerenciador Completo</span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
            Catálogo de Produtos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cadastre e edite títulos, descrições, cores, tamanhos, posições, prazos, fotos e especificações técnicas de cada produto.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>NOVO PRODUTO</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCatFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCatFilter === 'all'
                ? 'bg-blue-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas Categorias ({products.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            if (count === 0 && selectedCatFilter !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCatFilter(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCatFilter === cat
                    ? 'bg-blue-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm">Carregando catálogo...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Package className="w-12 h-12 text-slate-700 mx-auto" />
          <div>
            <h3 className="text-white font-bold text-base">Nenhum produto encontrado</h3>
            <p className="text-xs text-slate-400 mt-1">
              Adicione produtos ao catálogo para que apareçam para seus clientes.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro Produto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const firstImg = prod.images?.[0]?.imageUrl || '/logo/Icon.png';
            let sizeCount = 0;
            try {
              const parsed = typeof prod.availableSizes === 'string' ? JSON.parse(prod.availableSizes) : prod.availableSizes;
              if (Array.isArray(parsed)) sizeCount = parsed.length;
            } catch (e) {}

            let colorCount = 0;
            try {
              const parsed = typeof prod.availableColors === 'string' ? JSON.parse(prod.availableColors) : prod.availableColors;
              if (Array.isArray(parsed)) colorCount = parsed.length;
            } catch (e) {}

            return (
              <div
                key={prod.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Thumbnail Box */}
                  <div className="relative h-52 w-full bg-slate-950 overflow-hidden border-b border-slate-800 flex items-center justify-center">
                    <Image
                      src={firstImg}
                      alt={prod.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-blue-400 px-3 py-1 rounded-full shadow">
                        {prod.category}
                      </span>
                      {prod.featured && (
                        <span className="bg-amber-500/90 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Sparkles className="w-3 h-3" />
                          <span>Destaque</span>
                        </span>
                      )}
                    </div>

                    {!prod.active && (
                      <span className="absolute top-3 right-3 bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                        Inativo
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {prod.description || 'Sem descrição cadastrada.'}
                      </p>
                    </div>

                    {/* Meta badges */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px] text-slate-300">
                      <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                        <Ruler className="w-3 h-3 text-blue-400" />
                        <span>{sizeCount > 0 ? `${sizeCount} tamanhos` : 'Padrão'}</span>
                      </span>
                      <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                        <Palette className="w-3 h-3 text-purple-400" />
                        <span>{colorCount > 0 ? `${colorCount} cores` : 'Padrão'}</span>
                      </span>
                      <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{prod.leadTime || '7-15 dias'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 border-t border-slate-800/60 mt-2 flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-blue-500/10 hover:border-blue-500/40 text-slate-200 hover:text-blue-400 font-bold py-2.5 px-3 rounded-xl border border-slate-800 transition-all text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Tudo</span>
                  </button>

                  <a
                    href={`/produtos/${prod.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
                    title="Ver no site"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDelete(prod.id, prod.name)}
                    className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-xl transition-colors"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL DE CADASTRO / EDIÇÃO COMPLETA ─────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Top Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base sm:text-lg">
                    {editingId ? 'Editar Produto Completo' : 'Cadastrar Novo Produto'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Preencha e personalize todos os campos abaixo
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-950 rounded-xl border border-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Section Tabs inside modal */}
            <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 bg-slate-950/50">
              <button
                type="button"
                onClick={() => setFormTab('basic')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  formTab === 'basic'
                    ? 'bg-blue-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Dados & Textos</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('specs')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  formTab === 'specs'
                    ? 'bg-blue-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. Especificações & Prazo</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('variants')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  formTab === 'variants'
                    ? 'bg-blue-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>3. Cores, Tamanhos & Locais</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('images')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  formTab === 'images'
                    ? 'bg-blue-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>4. Fotos ({images.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('pricing')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  formTab === 'pricing'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>5. Preços {pricingTiers.length > 0 ? `(${pricingTiers.length} faixas)` : ''}</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* ── ABA 1: DADOS BÁSICOS & TEXTOS ── */}
              {formTab === 'basic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Title */}
                    <div className="sm:col-span-8 space-y-1">
                      <label className="text-slate-300 font-bold block">
                        Título / Nome do Produto: <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Camiseta 100% Algodão Penteado"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-slate-300 font-bold block">
                        Categoria: <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none cursor-pointer"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Summary Description */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">
                      Descrição Resumida (exibida nos cards e topo da página):
                    </label>
                    <textarea
                      placeholder="Ex: Camiseta em malha penteada 100% algodão fio 30.1. Toque macio, excelente caimento e altíssima durabilidade. Ideal para eventos, festas, formaturas e marcas próprias."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:border-blue-400 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price Range */}
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">
                        Texto de Preço / Faixa de Valor:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Consulte valor por quantidade ou A partir de R$ 29,90"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    {/* Min Quantity */}
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">
                        Quantidade Mínima de Pedido:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 10 unidades, 20 peças, etc."
                        value={minQuantity}
                        onChange={(e) => setMinQuantity(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Status and Featured */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-white font-bold">Produto Ativo (Visível no site)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-amber-400 font-bold">Destaque na Página Inicial</span>
                    </label>
                  </div>
                </div>
              )}

              {/* ── ABA 2: ESPECIFICAÇÕES & PRODUÇÃO ── */}
              {formTab === 'specs' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Details / Technical specs */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">
                      Especificações Técnicas Detalhadas:
                    </label>
                    <textarea
                      placeholder="Ex: Gola careca reforçada, costura ombro a ombro com pesponto duplo. Malha com tratamento anti-pilling. Gramatura 165g/m²."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:border-blue-400 focus:outline-none resize-none leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500">
                      Exibido no quadro de &quot;Especificações Técnicas&quot; abaixo da galeria de fotos.
                    </p>
                  </div>

                  {/* Print techniques */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">
                      Técnicas de Impressão Disponíveis:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Silk Screen, Sublimação Total, DTF HD, Bordado Computadorizado"
                      value={printTechniques}
                      onChange={(e) => setPrintTechniques(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  {/* Lead Time */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">
                      Prazo Padrão de Confecção:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 7 a 15 dias úteis (ou consulte para urgências)"
                      value={leadTime}
                      onChange={(e) => setLeadTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ── ABA 5: TABELA DE PREÇOS ── */}
              {formTab === 'pricing' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Header */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-emerald-300 font-bold text-xs">Preços & Descontos por Quantidade</p>
                      <p className="text-emerald-400/70 text-[11px] mt-0.5">
                        Defina preços por faixas de atacado. Você pode aplicar uma tabela única para todas as variações ou preços específicos por variação/tamanho/ml.
                      </p>
                    </div>
                  </div>

                  {/* Pricing Mode Selector */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <label className="text-slate-200 font-bold block text-xs">Modo de Precificação:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPricingMode('unified')}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          pricingMode === 'unified'
                            ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <span className={`w-3 h-3 rounded-full border-2 ${pricingMode === 'unified' ? 'border-blue-400 bg-blue-500' : 'border-slate-600'}`} />
                          <span>Tabela Única (Geral)</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 pl-5">
                          Todas as cores e tamanhos compartilham a mesma tabela de faixas (ideal para camisetas e moletons).
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPricingMode('by_variant');
                          if (!activePricingVariant && availableSizes.length > 0) {
                            setActivePricingVariant(availableSizes[0]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          pricingMode === 'by_variant'
                            ? 'bg-purple-500/10 border-purple-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <span className={`w-3 h-3 rounded-full border-2 ${pricingMode === 'by_variant' ? 'border-purple-400 bg-purple-500' : 'border-slate-600'}`} />
                          <span>Preço por Variação / ML / Tamanho</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 pl-5">
                          Cada tamanho ou volume (ex: 300ml vs 500ml) tem seu próprio preço e faixas de quantidade.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* ── MODO UNIFICADO ── */}
                  {pricingMode === 'unified' && (
                    <div className="space-y-5">
                      {/* Quick Preset Loader */}
                      <div className="space-y-2">
                        <label className="text-slate-300 font-bold block text-xs">Carregar Modelo Padrão:</label>
                        <div className="flex flex-wrap gap-2">
                          {TIER_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setPricingTiers(preset.tiers as PricingTier[]);
                                toast.success(`Modelo "${preset.name}" carregado!`);
                              }}
                              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all"
                            >
                              <Zap className="w-3 h-3" />
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tier Table */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 font-bold block text-xs">Faixas de Preço (Tabela Geral):</label>
                          <button
                            type="button"
                            onClick={() =>
                              setPricingTiers((prev) => [
                                ...prev,
                                { minQty: (prev[prev.length - 1]?.maxQty ?? 9) + 1, maxQty: null, unitPrice: 0 },
                              ])
                            }
                            className="inline-flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            Adicionar Faixa
                          </button>
                        </div>

                        {pricingTiers.length === 0 ? (
                          <div className="bg-slate-950 border border-dashed border-slate-700 rounded-2xl p-6 text-center space-y-2">
                            <DollarSign className="w-8 h-8 text-slate-600 mx-auto" />
                            <p className="text-slate-500 text-xs">Nenhuma faixa configurada.</p>
                            <p className="text-slate-600 text-[11px]">Carregue um modelo acima ou clique em "Adicionar Faixa".</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                              <div className="col-span-3">Qtd Mínima</div>
                              <div className="col-span-3">Qtd Máxima</div>
                              <div className="col-span-4">Preço / un (R$)</div>
                              <div className="col-span-2"></div>
                            </div>
                            {pricingTiers.map((tier, idx) => (
                              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950 border border-slate-800 rounded-xl p-2">
                                <div className="col-span-3">
                                  <input
                                    type="number"
                                    min={1}
                                    value={tier.minQty}
                                    onChange={(e) =>
                                      setPricingTiers((prev) =>
                                        prev.map((t, i) => (i === idx ? { ...t, minQty: Number(e.target.value) } : t))
                                      )
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
                                    placeholder="10"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <input
                                    type="number"
                                    min={tier.minQty + 1}
                                    value={tier.maxQty ?? ''}
                                    onChange={(e) =>
                                      setPricingTiers((prev) =>
                                        prev.map((t, i) =>
                                          i === idx
                                            ? { ...t, maxQty: e.target.value === '' ? null : Number(e.target.value) }
                                            : t
                                        )
                                      )
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
                                    placeholder="Ilimitado"
                                  />
                                </div>
                                <div className="col-span-4">
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">R$</span>
                                    <input
                                      type="number"
                                      min={0}
                                      step="any"
                                      value={tier.unitPrice || ''}
                                      onChange={(e) =>
                                        setPricingTiers((prev) =>
                                          prev.map((t, i) =>
                                            i === idx ? { ...t, unitPrice: Number(e.target.value) } : t
                                          )
                                        )
                                      }
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-emerald-400 font-bold text-xs focus:border-emerald-400 focus:outline-none"
                                      placeholder="35,00"
                                    />
                                  </div>
                                </div>
                                <div className="col-span-2 flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => setPricingTiers((prev) => prev.filter((_, i) => i !== idx))}
                                    className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── MODO POR VARIAÇÃO / ML / TAMANHO ── */}
                  {pricingMode === 'by_variant' && (
                    <div className="space-y-5">
                      {/* Variation Selector Pills */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 font-bold block text-xs">
                            Selecione a Variação para Configurar o Preço:
                          </label>
                          <span className="text-[11px] text-slate-500">
                            {availableSizes.length} variações cadastradas
                          </span>
                        </div>

                        {availableSizes.length === 0 ? (
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-xs text-amber-400">
                            Nenhum tamanho/variação cadastrado. Volte na aba <strong>"3. Cores & Tamanhos"</strong> e adicione as variações (ex: 300ml, 500ml).
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {availableSizes.map((variant) => {
                              const tiersCount = (variantPricingTiers[variant] || []).length;
                              const isCurrent = activePricingVariant === variant;
                              return (
                                <button
                                  key={variant}
                                  type="button"
                                  onClick={() => setActivePricingVariant(variant)}
                                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border ${
                                    isCurrent
                                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 scale-105'
                                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                                  }`}
                                >
                                  <span>{variant}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isCurrent ? 'bg-purple-800 text-white' : 'bg-slate-900 text-slate-400'}`}>
                                    {tiersCount > 0 ? `${tiersCount} faixa(s)` : 'Sem preço'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Active Variant Tier Table */}
                      {activePricingVariant && (
                        <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div>
                              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                                Tabela de Preços para: <span className="text-purple-300 font-extrabold text-base">{activePricingVariant}</span>
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Configure o valor unitário e os descontos por volume desta variação específica.
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Copy to other variants button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const currentTiers = variantPricingTiers[activePricingVariant] || [];
                                  if (currentTiers.length === 0) {
                                    toast.error('Adicione faixas antes de copiar.');
                                    return;
                                  }
                                  const updated: { [v: string]: PricingTier[] } = { ...variantPricingTiers };
                                  availableSizes.forEach((s) => {
                                    updated[s] = JSON.parse(JSON.stringify(currentTiers));
                                  });
                                  setVariantPricingTiers(updated);
                                  toast.success(`Faixas de "${activePricingVariant}" copiadas para todas as variações!`);
                                }}
                                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-purple-500/20 text-purple-300 hover:text-white border border-slate-800 hover:border-purple-500/40 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                                title="Copiar esta tabela para todos os outros tamanhos/volumes"
                              >
                                <span>Copiar p/ Todas as Variações</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const current = variantPricingTiers[activePricingVariant] || [];
                                  const nextMin = (current[current.length - 1]?.maxQty ?? 0) + 1;
                                  const updated = [
                                    ...current,
                                    { minQty: nextMin > 0 ? nextMin : 1, maxQty: null, unitPrice: 0 },
                                  ];
                                  setVariantPricingTiers((prev) => ({ ...prev, [activePricingVariant]: updated }));
                                }}
                                className="inline-flex items-center gap-1 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all shadow"
                              >
                                <Plus className="w-3 h-3" />
                                Adicionar Faixa
                              </button>
                            </div>
                          </div>

                          {/* Quick Presets for this variant */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-bold">Modelos Rápidos:</span>
                            {TIER_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setVariantPricingTiers((prev) => ({
                                    ...prev,
                                    [activePricingVariant]: preset.tiers as PricingTier[],
                                  }));
                                  toast.success(`Modelo "${preset.name}" aplicado em ${activePricingVariant}!`);
                                }}
                                className="inline-flex items-center gap-1 bg-slate-900 hover:bg-purple-500/10 border border-slate-800 text-slate-400 hover:text-purple-300 font-bold px-2.5 py-1 rounded-lg text-[10px] transition-all"
                              >
                                <Zap className="w-2.5 h-2.5" />
                                {preset.name}
                              </button>
                            ))}
                          </div>

                          {/* Variant Tier rows */}
                          {(!variantPricingTiers[activePricingVariant] || variantPricingTiers[activePricingVariant].length === 0) ? (
                            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-5 text-center space-y-2">
                              <p className="text-slate-400 text-xs">Nenhum preço configurado para <strong>{activePricingVariant}</strong>.</p>
                              <p className="text-slate-500 text-[11px]">Clique em "Adicionar Faixa" ou escolha um modelo rápido acima.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                                <div className="col-span-3">Qtd Mínima</div>
                                <div className="col-span-3">Qtd Máxima</div>
                                <div className="col-span-4">Preço / un (R$)</div>
                                <div className="col-span-2"></div>
                              </div>
                              {variantPricingTiers[activePricingVariant].map((tier, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-900 border border-slate-800 rounded-xl p-2">
                                  <div className="col-span-3">
                                    <input
                                      type="number"
                                      min={1}
                                      value={tier.minQty}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setVariantPricingTiers((prev) => ({
                                          ...prev,
                                          [activePricingVariant]: prev[activePricingVariant].map((t, i) =>
                                            i === idx ? { ...t, minQty: val } : t
                                          ),
                                        }));
                                      }}
                                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-purple-400 focus:outline-none"
                                      placeholder="1"
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <input
                                      type="number"
                                      min={tier.minQty + 1}
                                      value={tier.maxQty ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? null : Number(e.target.value);
                                        setVariantPricingTiers((prev) => ({
                                          ...prev,
                                          [activePricingVariant]: prev[activePricingVariant].map((t, i) =>
                                            i === idx ? { ...t, maxQty: val } : t
                                          ),
                                        }));
                                      }}
                                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-purple-400 focus:outline-none"
                                      placeholder="Ilimitado"
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <div className="relative">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">R$</span>
                                      <input
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={tier.unitPrice || ''}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setVariantPricingTiers((prev) => ({
                                            ...prev,
                                            [activePricingVariant]: prev[activePricingVariant].map((t, i) =>
                                              i === idx ? { ...t, unitPrice: val } : t
                                            ),
                                          }));
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-purple-300 font-bold text-xs focus:border-purple-400 focus:outline-none"
                                        placeholder="28,46"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-2 flex justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVariantPricingTiers((prev) => ({
                                          ...prev,
                                          [activePricingVariant]: prev[activePricingVariant].filter((_, i) => i !== idx),
                                        }));
                                      }}
                                      className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── SIMULADOR MULTIVARIAÇÃO EM TEMPO REAL ── */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <label className="text-slate-200 font-bold text-xs">Simulador de Cálculo em Tempo Real:</label>
                    </div>

                    {pricingMode === 'unified' ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={1}
                            value={simQty}
                            onChange={(e) => setSimQty(Number(e.target.value))}
                            className="w-24 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-blue-400 focus:outline-none"
                          />
                          <span className="text-slate-400 text-xs">peças =</span>
                        </div>
                        <div className="text-right">
                          {(() => {
                            const calc = calculateProductPrice(simQty, pricingTiers, basePrice);
                            return (
                              <div className="space-y-0.5">
                                <div className="text-xs text-slate-400">
                                  {formatCurrency(calc.unitPrice)} / un
                                </div>
                                <div className="text-base font-extrabold text-emerald-400">
                                  Total: {formatCurrency(calc.total)}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-400">Digite quantidades para cada variação e confira o valor calculado:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {availableSizes.map((variant) => {
                            const qty = variantSimQtys[variant] ?? 0;
                            const vTiers = variantPricingTiers[variant] || [];
                            const calc = calculateProductPrice(qty > 0 ? qty : 1, vTiers, basePrice);
                            const subtotal = calc.unitPrice * qty;

                            return (
                              <div key={variant} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-purple-300 text-xs">{variant}</span>
                                  <span className="text-[10px] text-slate-400">{formatCurrency(calc.unitPrice)}/un</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    value={qty}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setVariantSimQtys((prev) => ({ ...prev, [variant]: val }));
                                    }}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white text-xs focus:border-purple-400 focus:outline-none"
                                    placeholder="0"
                                  />
                                  <span className="text-[11px] text-slate-400 shrink-0">un</span>
                                </div>
                                <div className="text-right text-xs font-bold text-emerald-400">
                                  = {formatCurrency(subtotal)}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Combined Simulator Total */}
                        {(() => {
                          const combined = calculateDetailedProductPrice(
                            variantSimQtys,
                            { mode: 'by_variant', variantTiers: variantPricingTiers },
                            basePrice
                          );
                          return (
                            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 mt-2">
                              <span className="text-xs font-bold text-emerald-300">
                                TOTAL SIMULADO ({combined.totalQuantity} itens):
                              </span>
                              <span className="text-lg font-extrabold text-emerald-400">
                                {formatCurrency(combined.totalPrice)}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── ABA 3: CORES, TAMANHOS & LOCAIS ── */}
              {formTab === 'variants' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Cores */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-400" />
                        <label className="text-slate-200 font-bold">Cores Disponíveis:</label>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {availableColors.length} cor(es) selecionada(s)
                      </span>
                    </div>

                    {/* Color Chips */}
                    <div className="flex flex-wrap gap-2 min-h-[36px]">
                      {availableColors.map((color) => (
                        <span
                          key={color}
                          className="inline-flex items-center gap-1.5 bg-slate-900 border border-purple-500/40 text-purple-200 px-3 py-1 rounded-xl font-bold text-xs shadow-sm"
                        >
                          <span>{color}</span>
                          <button
                            type="button"
                            onClick={() => removeColor(color)}
                            className="text-purple-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Color Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Digitar nome da cor e pressionar Enter..."
                        value={newColorInput}
                        onChange={(e) => setNewColorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addColor(newColorInput);
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addColor(newColorInput)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
                      >
                        + Adicionar Cor
                      </button>
                    </div>

                    {/* Quick Presets for Colors */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500">Presets:</span>
                      <button
                        type="button"
                        onClick={() => setAvailableColors([...PRESET_COLORS_BASIC])}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                      >
                        Cores Básicas
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailableColors([...PRESET_COLORS_BASIC, ...PRESET_COLORS_VIBRANT])}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                      >
                        Grade Completa (11 cores)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailableColors([])}
                        className="px-2 py-1 text-slate-500 hover:text-red-400 ml-auto"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {/* Tamanhos */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-blue-400" />
                        <label className="text-slate-200 font-bold">Tamanhos Disponíveis:</label>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {availableSizes.length} tamanho(s)
                      </span>
                    </div>

                    {/* Size Chips */}
                    <div className="flex flex-wrap gap-2 min-h-[36px]">
                      {availableSizes.map((size) => (
                        <span
                          key={size}
                          className="inline-flex items-center gap-1.5 bg-slate-900 border border-blue-500/40 text-blue-200 px-3 py-1 rounded-xl font-bold text-xs shadow-sm"
                        >
                          <span>{size}</span>
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="text-blue-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Size Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Ex: PP, P, M, G, GG, XGG, G1, 04, Único..."
                        value={newSizeInput}
                        onChange={(e) => setNewSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSize(newSizeInput);
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addSize(newSizeInput)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
                      >
                        + Adicionar Tamanho
                      </button>
                    </div>

                    {/* Quick Presets for Sizes */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500">Presets:</span>
                      <button
                        type="button"
                        onClick={() => setAvailableSizes([...PRESET_SIZES_ADULT])}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                      >
                        Adulto (PP ao XGG)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailableSizes([...PRESET_SIZES_KIDS])}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                      >
                        Infantil (02 ao 16)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailableSizes([...PRESET_SIZES_PLUS])}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                      >
                        Plus Size (G1 ao G4)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailableSizes([...PRESET_SIZES_UNIQUE])}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                      >
                        Tamanho Único
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailableSizes([])}
                        className="px-2 py-1 text-slate-500 hover:text-red-400 ml-auto"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {/* Locais de Personalização */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <label className="text-slate-200 font-bold">Locais de Personalização Permitidos:</label>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {customizationPositions.length} local(is)
                      </span>
                    </div>

                    {/* Position Chips */}
                    <div className="flex flex-wrap gap-2 min-h-[36px]">
                      {customizationPositions.map((pos) => (
                        <span
                          key={pos}
                          className="inline-flex items-center gap-1.5 bg-slate-900 border border-emerald-500/40 text-emerald-200 px-3 py-1 rounded-xl font-bold text-xs shadow-sm"
                        >
                          <span>{pos}</span>
                          <button
                            type="button"
                            onClick={() => removePosition(pos)}
                            className="text-emerald-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Position Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Ex: Frente, Costas, Manga, Bolso, Gola..."
                        value={newPositionInput}
                        onChange={(e) => setNewPositionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPosition(newPositionInput);
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addPosition(newPositionInput)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
                      >
                        + Adicionar Local
                      </button>
                    </div>

                    {/* Quick Presets for Positions */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500">Presets:</span>
                      <button
                        type="button"
                        onClick={() => setCustomizationPositions(['Frente', 'Costas', 'Manga Direita', 'Manga Esquerda'])}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                      >
                        Padrão Camiseta
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomizationPositions([...PRESET_POSITIONS])}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                      >
                        Todos os Locais
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomizationPositions(['Frente'])}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                      >
                        Apenas Frente
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomizationPositions([])}
                        className="px-2 py-1 text-slate-500 hover:text-red-400 ml-auto"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ABA 4: FOTOS DO PRODUTO ── */}
              {formTab === 'images' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    <label className="text-slate-300 font-bold block">
                      Galeria de Fotos: <span className="text-red-400">*</span>
                    </label>

                    {/* Upload Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,.svg"
                        className="hidden"
                        id="admin-product-file-upload"
                        onChange={handleFileUpload}
                      />

                      <label
                        htmlFor="admin-product-file-upload"
                        className={`flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold py-3 px-4 rounded-xl cursor-pointer transition-all shadow-md ${
                          uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>ENVIANDO FOTOS...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>ENVIAR FOTOS DO COMPUTADOR</span>
                          </>
                        )}
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="px-4 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-800 transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>Adicionar por URL</span>
                      </button>
                    </div>

                    {showUrlInput && (
                      <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                        <input
                          type="text"
                          placeholder="Cole a URL da foto (https://...)"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddUrl}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-xs"
                        >
                          Inserir
                        </button>
                      </div>
                    )}

                    {/* Image Previews Grid */}
                    <div className="pt-2">
                      {images.length === 0 ? (
                        <div className="h-40 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 space-y-2">
                          <ImageIcon className="w-8 h-8" />
                          <p className="text-xs">Nenhuma foto adicionada ainda.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {images.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group"
                            >
                              <Image
                                src={imgUrl}
                                alt={`Foto ${idx + 1}`}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                              {idx === 0 && (
                                <span className="absolute top-2 left-2 bg-blue-500 text-slate-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow">
                                  CAPA
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                title="Remover foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer / Submit Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  {formTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formTab === 'images') setFormTab('variants');
                        else if (formTab === 'variants') setFormTab('specs');
                        else if (formTab === 'specs') setFormTab('basic');
                      }}
                      className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-xl border border-slate-800 text-xs"
                    >
                      ← Voltar
                    </button>
                  )}
                  {formTab !== 'images' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formTab === 'basic') setFormTab('specs');
                        else if (formTab === 'specs') setFormTab('variants');
                        else if (formTab === 'variants') setFormTab('images');
                      }}
                      className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-800 text-xs"
                    >
                      Próxima Etapa →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-xl border border-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-xs transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingId ? 'SALVAR TODAS AS ALTERAÇÕES' : 'CADASTRAR PRODUTO'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
