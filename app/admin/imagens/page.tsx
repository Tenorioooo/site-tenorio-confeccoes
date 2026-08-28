'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { 
  ImageIcon, 
  Upload, 
  RefreshCw, 
  Save, 
  RotateCcw, 
  Link as LinkIcon, 
  CheckCircle2, 
  Sparkles,
  Search,
  Tag,
  FileText,
  Clock,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Award,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageSlot {
  key: string;
  tagKey?: string;
  defaultTag?: string;
  descKey?: string;
  defaultDesc?: string;
  title: string;
  category: 'categories' | 'banners';
  description: string;
  defaultUrl: string;
  aspectRatio: string;
  recommendedSize: string;
}

const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&auto=format&fit=crop&q=80',
];

const CATEGORY_AND_BANNER_SLOTS: ImageSlot[] = [
  // Capas de Categorias
  {
    key: 'img_cat_camisetas',
    tagKey: 'tag_cat_camisetas',
    defaultTag: 'Mais Pedido',
    descKey: 'desc_cat_camisetas',
    defaultDesc: 'Algodão penteado, dry fit e poliéster. Para festas, formaturas e eventos.',
    title: 'Capa da Categoria: Camisetas',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  {
    key: 'img_cat_moletons',
    tagKey: 'tag_cat_moletons',
    defaultTag: 'Inverno & Turmas',
    descKey: 'desc_cat_moletons',
    defaultDesc: 'Canguru, careca e flanelado de alta gramatura para turmas e equipes.',
    title: 'Capa da Categoria: Moletons',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  {
    key: 'img_cat_canecas',
    tagKey: 'tag_cat_canecas',
    defaultTag: 'Brindes Premium',
    descKey: 'desc_cat_canecas',
    defaultDesc: 'Porcelana AAA 325ml. Brindes corporativos e presentes especiais.',
    title: 'Capa da Categoria: Canecas',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  {
    key: 'img_cat_abadas',
    tagKey: 'tag_cat_abadas',
    defaultTag: 'Alta Vibração',
    descKey: 'desc_cat_abadas',
    defaultDesc: 'Sublimação total para blocos, carnaval, festas e micaretas.',
    title: 'Capa da Categoria: Abadás',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  {
    key: 'img_cat_bandeiras',
    tagKey: 'tag_cat_bandeiras',
    defaultTag: 'Divulgação',
    descKey: 'desc_cat_bandeiras',
    defaultDesc: 'Estampadas em poliéster lavável com ilhós. Torcidas e fachadas.',
    title: 'Capa da Categoria: Bandeiras',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  {
    key: 'img_cat_windbanner',
    tagKey: 'tag_cat_windbanner',
    defaultTag: 'Visibilidade',
    descKey: 'desc_cat_windbanner',
    defaultDesc: 'Flag banners promocionais com haste e base para grande impacto visual.',
    title: 'Capa da Categoria: Wind Banner',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  {
    key: 'img_cat_uniformes',
    tagKey: 'tag_cat_uniformes',
    defaultTag: 'Empresarial',
    descKey: 'desc_cat_uniformes',
    defaultDesc: 'Polos, camisetas e aventais para equipes e representantes comerciais.',
    title: 'Capa da Categoria: Uniformes',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1625910513413-433a010d29a5?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  {
    key: 'img_cat_eventos',
    tagKey: 'tag_cat_eventos',
    defaultTag: 'Kits Eventos',
    descKey: 'desc_cat_eventos',
    defaultDesc: 'Kits completos para congressos, shows, feiras e campeonatos.',
    title: 'Capa da Categoria: Eventos',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  {
    key: 'img_cat_corporativo',
    tagKey: 'tag_cat_corporativo',
    defaultTag: 'Marcas',
    descKey: 'desc_cat_corporativo',
    defaultDesc: 'Brindes e vestuário institucional para fortalecer sua marca.',
    title: 'Capa da Categoria: Corporativo',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  {
    key: 'img_cat_outros',
    tagKey: 'tag_cat_outros',
    defaultTag: 'Sob Consulta',
    descKey: 'desc_cat_outros',
    defaultDesc: 'Sacochilas, aventais, tirantes e produtos sob consulta especial.',
    title: 'Capa da Categoria: Outros Personalizados',
    category: 'categories',
    description: 'Exibida na grade de categorias da Home e na listagem de produtos.',
    defaultUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '16:9 / 4:3',
    recommendedSize: '600 x 400 px',
  },
  // Banners e Seções
  {
    key: 'img_home_eventos',
    title: 'Banner Seção Festas & Eventos (Home)',
    category: 'banners',
    description: 'Foto lateral que ilustra blocos, eventos, abadás e comemorações.',
    defaultUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
    aspectRatio: '4:3 / 16:9',
    recommendedSize: '800 x 600 px',
  },
];

export default function AdminImagesPage() {
  const [imagesMap, setImagesMap] = useState<Record<string, string>>({});
  const [heroImages, setHeroImages] = useState<string[]>(DEFAULT_HERO_IMAGES);
  const [heroInterval, setHeroInterval] = useState<number>(4500);
  const [heroUrlInput, setHeroUrlInput] = useState('');
  const [showHeroUrlInput, setShowHeroUrlInput] = useState(false);
  const [previewHeroIndex, setPreviewHeroIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'hero' | 'categories' | 'banners'>('all');
  const [search, setSearch] = useState('');
  
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const heroMultiFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-cycle live preview inside admin
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, heroInterval);
    return () => clearInterval(timer);
  }, [heroImages.length, heroInterval]);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setImagesMap(data || {});

          // Parse Hero Images list
          let list: string[] = [];
          if (data?.hero_images) {
            try {
              const parsed = JSON.parse(data.hero_images);
              if (Array.isArray(parsed) && parsed.length > 0) {
                list = parsed.filter(Boolean);
              }
            } catch (e) {}
          }
          if (list.length === 0 && data?.img_hero_main) {
            list = [data.img_hero_main];
          }
          if (list.length > 0) {
            setHeroImages(list);
          }

          // Parse Hero Interval
          if (data?.hero_interval) {
            const num = parseInt(data.hero_interval, 10);
            if (!isNaN(num) && num >= 2000) {
              setHeroInterval(num);
            }
          }
        }
      } catch (e) {
        console.error('Erro ao carregar imagens:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleUrlChange = (key: string, value: string) => {
    setImagesMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetToDefault = (slot: ImageSlot) => {
    setImagesMap((prev) => {
      const next = { ...prev, [slot.key]: slot.defaultUrl };
      if (slot.tagKey && slot.defaultTag) {
        next[slot.tagKey] = slot.defaultTag;
      }
      if (slot.descKey && slot.defaultDesc) {
        next[slot.descKey] = slot.defaultDesc;
      }
      return next;
    });
    toast.info(`Imagem, selo e descrição de "${slot.title}" restaurados para o padrão.`);
  };

  // Upload for category/banner slots
  const handleFileUpload = async (slot: ImageSlot, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKey(slot.key);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'general');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImagesMap((prev) => ({ ...prev, [slot.key]: data.url }));
        toast.success(`Upload de "${slot.title}" concluído!`);
      } else {
        toast.error(data.error || 'Erro ao realizar upload da imagem.');
      }
    } catch {
      toast.error('Falha na comunicação ao enviar imagem.');
    } finally {
      setUploadingKey(null);
      if (fileInputsRef.current[slot.key]) {
        fileInputsRef.current[slot.key]!.value = '';
      }
    }
  };

  // Multi-file upload for Hero
  const handleHeroMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingHero(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'hero');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: fd,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          newUrls.push(data.url);
        }
      }

      if (newUrls.length > 0) {
        setHeroImages((prev) => [...prev, ...newUrls]);
        toast.success(`${newUrls.length} foto(s) adicionada(s) ao Carrossel do Hero!`);
      } else {
        toast.error('Nenhuma imagem pôde ser enviada.');
      }
    } catch {
      toast.error('Erro ao enviar fotos do Hero.');
    } finally {
      setUploadingHero(false);
      if (heroMultiFileInputRef.current) heroMultiFileInputRef.current.value = '';
    }
  };

  const handleAddHeroUrl = () => {
    const trimmed = heroUrlInput.trim();
    if (!trimmed) return;
    setHeroImages((prev) => [...prev, trimmed]);
    setHeroUrlInput('');
    toast.success('Imagem adicionada ao Carrossel via URL!');
  };

  const handleRemoveHeroImage = (indexToRemove: number) => {
    if (heroImages.length <= 1) {
      toast.error('O Hero deve conter pelo menos 1 imagem.');
      return;
    }
    setHeroImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    toast.info('Imagem removida do Carrossel.');
  };

  const handleMoveHeroImage = (fromIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (targetIndex < 0 || targetIndex >= heroImages.length) return;

    const list = [...heroImages];
    const temp = list[fromIndex];
    list[fromIndex] = list[targetIndex];
    list[targetIndex] = temp;
    setHeroImages(list);
  };

  const handleResetHeroToDefault = () => {
    setHeroImages([...DEFAULT_HERO_IMAGES]);
    setHeroInterval(4500);
    toast.info('Imagens e intervalo do Hero restaurados para o padrão.');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        ...imagesMap,
        hero_images: JSON.stringify(heroImages),
        hero_interval: String(heroInterval),
        img_hero_main: heroImages[0] || DEFAULT_HERO_IMAGES[0],
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Todas as fotos do Hero, capas de categorias e banners foram salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar as configurações.');
      }
    } catch {
      toast.error('Falha de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSlots = CATEGORY_AND_BANNER_SLOTS.filter((slot) => {
    const matchesTab = activeTab === 'all' || slot.category === activeTab;
    const matchesSearch =
      slot.title.toLowerCase().includes(search.toLowerCase()) ||
      slot.description.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const showHeroSection = (activeTab === 'all' || activeTab === 'hero') && (search === '' || 'hero carrossel destaque principal'.includes(search.toLowerCase()));

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Gerenciador Visual Completo</span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
            Imagens, Carrossel & Capas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Faça upload de várias imagens para o Carrossel do Hero (com transição automática), capas de categorias e banners.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-xs shrink-0"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>SALVANDO...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>SALVAR TUDO</span>
            </>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-blue-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas ({CATEGORY_AND_BANNER_SLOTS.length + 1})
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'hero'
                ? 'bg-blue-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Carrossel Hero ({heroImages.length} fotos)</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'categories'
                ? 'bg-blue-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Capas & Badges ({CATEGORY_AND_BANNER_SLOTS.filter(s => s.category === 'categories').length})
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'banners'
                ? 'bg-blue-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Banners ({CATEGORY_AND_BANNER_SLOTS.filter(s => s.category === 'banners').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por capa ou seção..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm">Carregando configurações visuais...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Dedicated HERO Multi-Image Carousel Manager Section */}
          {showHeroSection && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Destaque Principal da Home
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {heroImages.length} {heroImages.length === 1 ? 'imagem' : 'imagens'} no carrossel
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    <span>Carrossel de Imagens do Hero</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    As fotos abaixo alternam automaticamente com efeito de transição suave na página inicial.
                  </p>
                </div>

                {/* Interval and Reset Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-slate-400 font-bold">Tempo de Troca:</span>
                    <select
                      value={heroInterval}
                      onChange={(e) => setHeroInterval(parseInt(e.target.value, 10))}
                      className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                    >
                      <option value={3000} className="bg-slate-900">3 segundos (Rápido)</option>
                      <option value={4500} className="bg-slate-900">4.5 segundos (Padrão)</option>
                      <option value={6000} className="bg-slate-900">6 segundos (Moderado)</option>
                      <option value={8000} className="bg-slate-900">8 segundos (Lento)</option>
                      <option value={10000} className="bg-slate-900">10 segundos (Muito Lento)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetHeroToDefault}
                    className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
                    title="Restaurar fotos e tempo padrão"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Padrão</span>
                  </button>
                </div>
              </div>

              {/* Main Content: Thumbnails Grid + Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Manage Images List & Upload */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Fotos Cadastradas ({heroImages.length}):
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => heroMultiFileInputRef.current?.click()}
                        disabled={uploadingHero}
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                      >
                        {uploadingHero ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingHero ? 'Enviando fotos...' : '+ Fazer Upload de Fotos (Múltiplo)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowHeroUrlInput((p) => !p)}
                        className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold px-3 py-2 rounded-xl text-xs transition-colors"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>URL</span>
                      </button>

                      <input
                        ref={heroMultiFileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,.svg"
                        onChange={handleHeroMultiUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Add via URL Input */}
                  {showHeroUrlInput && (
                    <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={heroUrlInput}
                        onChange={(e) => setHeroUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddHeroUrl();
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddHeroUrl}
                        className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  )}

                  {/* Thumbnails Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {heroImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-2.5 flex flex-col space-y-2 group transition-all shadow-md"
                      >
                        {/* Order badge */}
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-slate-950/90 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-full">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Reorder and Delete Controls */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveHeroImage(idx, 'left')}
                              disabled={idx === 0}
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Mover para a esquerda"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveHeroImage(idx, 'right')}
                              disabled={idx === heroImages.length - 1}
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Mover para a direita"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveHeroImage(idx)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                            title="Remover foto do carrossel"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    💡 <strong>Dica:</strong> As fotos do Hero ficam com proporção vertical <strong>4:5 (recomendado 800 x 1000 px)</strong>. Você pode adicionar quantas fotos quiser e reordená-las com as setas.
                  </p>
                </div>

                {/* Right: Live Real-Time Preview Card */}
                <div className="lg:col-span-4 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Pré-Visualização em Tempo Real</span>
                  </span>

                  <div className="relative w-full max-w-xs aspect-[4/5] rounded-3xl bg-slate-950 border border-slate-700/60 p-3 shadow-2xl overflow-hidden group select-none">
                    {heroImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-3 rounded-2xl overflow-hidden transition-all duration-1000 ease-in-out ${
                          idx === previewHeroIndex
                            ? 'opacity-100 scale-100 z-10'
                            : 'opacity-0 scale-105 z-0 pointer-events-none'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt="Hero Live Preview"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      </div>
                    ))}

                    {/* Floating Badge Mockups */}
                    <div className="absolute top-5 left-5 z-20 bg-slate-950/85 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl flex items-center gap-2 shadow-lg">
                      <div className="p-1 bg-blue-500/20 rounded-lg text-blue-400">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">Qualidade</p>
                        <p className="text-[11px] font-bold text-white">Acabamento Premium</p>
                      </div>
                    </div>

                    <div className="absolute bottom-5 right-5 z-20 bg-slate-950/85 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl flex items-center gap-2 shadow-lg">
                      <div className="p-1 bg-emerald-500/20 rounded-lg text-emerald-400">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">Atendimento</p>
                        <p className="text-[11px] font-bold text-white">WhatsApp Rápido</p>
                      </div>
                    </div>

                    {/* Indicator dots */}
                    {heroImages.length > 1 && (
                      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1 bg-slate-950/70 backdrop-blur-md px-2 py-1 rounded-full border border-slate-700">
                        {heroImages.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${
                              i === previewHeroIndex ? 'w-4 bg-blue-400' : 'w-1 bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Categories and Banners Image Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSlots.map((slot) => {
              const currentUrl = imagesMap[slot.key] || slot.defaultUrl;
              const isUploading = uploadingKey === slot.key;
              const isCustomImage = imagesMap[slot.key] && imagesMap[slot.key] !== slot.defaultUrl;
              const isCustomTag = slot.tagKey && imagesMap[slot.tagKey] && imagesMap[slot.tagKey] !== slot.defaultTag;
              const isCustomDesc = slot.descKey && imagesMap[slot.descKey] && imagesMap[slot.descKey] !== slot.defaultDesc;
              const isCustom = isCustomImage || isCustomTag || isCustomDesc;

              return (
                <div
                  key={slot.key}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                >
                  {/* Header Information */}
                  <div className="p-5 border-b border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950 text-blue-400 border border-slate-800">
                        {slot.category === 'categories' ? 'Capa de Categoria' : 'Banner de Seção'}
                      </span>
                      {isCustom ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Personalizado
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Padrão</span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base leading-snug">{slot.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{slot.description}</p>
                  </div>

                  {/* Image Preview Box */}
                  <div className="relative h-52 w-full bg-slate-950 overflow-hidden border-b border-slate-800 flex items-center justify-center">
                    {currentUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={currentUrl}
                        alt={slot.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = slot.defaultUrl;
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-600 space-y-1">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[11px]">Sem imagem</span>
                      </div>
                    )}

                    {/* Badge Preview on Top-Right */}
                    {slot.tagKey && (
                      <span className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-blue-400 px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Tag className="w-3 h-3 text-blue-400" />
                        <span>
                          {imagesMap[slot.tagKey] !== undefined && imagesMap[slot.tagKey] !== ''
                            ? imagesMap[slot.tagKey]
                            : slot.defaultTag}
                        </span>
                      </span>
                    )}

                    <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-medium">
                      Proporção: <span className="text-white font-bold">{slot.aspectRatio}</span>
                    </div>
                  </div>

                  {/* Controls and Inputs */}
                  <div className="p-5 space-y-4">
                    {/* Badge Input for Categories */}
                    {slot.tagKey && (
                      <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-blue-400" />
                            <span>Texto do Selo / Badge:</span>
                          </label>
                          {imagesMap[slot.tagKey] && imagesMap[slot.tagKey] !== slot.defaultTag && (
                            <button
                              type="button"
                              onClick={() => handleUrlChange(slot.tagKey!, slot.defaultTag || '')}
                              className="text-[10px] text-blue-400 hover:underline font-semibold"
                            >
                              Restaurar padrão
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder={`Padrão: ${slot.defaultTag}`}
                          value={imagesMap[slot.tagKey] !== undefined ? imagesMap[slot.tagKey] : slot.defaultTag || ''}
                          onChange={(e) => handleUrlChange(slot.tagKey!, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-400 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-500">
                          Exibido no topo do card da categoria na Home.
                        </p>
                      </div>
                    )}

                    {/* Description Input for Categories */}
                    {slot.descKey && (
                      <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                            <span>Descrição da Categoria (Card):</span>
                          </label>
                          {imagesMap[slot.descKey] && imagesMap[slot.descKey] !== slot.defaultDesc && (
                            <button
                              type="button"
                              onClick={() => handleUrlChange(slot.descKey!, slot.defaultDesc || '')}
                              className="text-[10px] text-blue-400 hover:underline font-semibold"
                            >
                              Restaurar padrão
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          placeholder={`Padrão: ${slot.defaultDesc}`}
                          value={imagesMap[slot.descKey] !== undefined ? imagesMap[slot.descKey] : slot.defaultDesc || ''}
                          onChange={(e) => handleUrlChange(slot.descKey!, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-400 focus:outline-none resize-none"
                        />
                        <p className="text-[10px] text-slate-500">
                          Texto explicativo exibido abaixo do título da categoria.
                        </p>
                      </div>
                    )}

                    {/* File Upload Input Hidden */}
                    <input
                      ref={(el) => {
                        fileInputsRef.current[slot.key] = el;
                      }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.svg"
                      className="hidden"
                      id={`upload-${slot.key}`}
                      onChange={(e) => handleFileUpload(slot, e)}
                    />

                    {/* Actions Row */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`upload-${slot.key}`}
                        className={`flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all shadow-sm ${
                          isUploading
                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-400 text-slate-950'
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>ENVIANDO...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>ENVIAR CAPA</span>
                          </>
                        )}
                      </label>

                      {isCustom && (
                        <button
                          onClick={() => handleResetToDefault(slot)}
                          className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-colors"
                          title="Restaurar valores padrão"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* URL Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        <span>Ou cole a URL direta da imagem:</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={imagesMap[slot.key] || ''}
                        onChange={(e) => handleUrlChange(slot.key, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Save Bar */}
      <div className="sticky bottom-6 z-30 bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Após trocar ou enviar imagens, clique em <strong>SALVAR TUDO</strong> para aplicar no site.</span>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-xs shrink-0"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>SALVANDO...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>SALVAR TUDO</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

