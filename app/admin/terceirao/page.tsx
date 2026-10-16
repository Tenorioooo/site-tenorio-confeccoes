'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  GraduationCap,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  Layers,
  Sparkles,
  Shirt,
  Info,
  ChevronDown,
  ChevronUp,
  MoveRight,
  ListPlus,
  FileText,
  BadgePercent,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { ComboData, ComboItemDetail, ComboMaterial, DEFAULT_COMBOS } from '@/lib/terceiraoData';

export default function AdminTerceiraoPage() {
  const [combos, setCombos] = useState<ComboData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeComboId, setActiveComboId] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar combos do servidor
  useEffect(() => {
    async function loadCombos() {
      try {
        setLoading(true);
        const res = await fetch('/api/terceirao/combos');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCombos(data);
            setActiveComboId(data[0].id);
          } else {
            setCombos(DEFAULT_COMBOS);
            setActiveComboId(DEFAULT_COMBOS[0].id);
          }
        } else {
          setCombos(DEFAULT_COMBOS);
          setActiveComboId(DEFAULT_COMBOS[0].id);
        }
      } catch (e) {
        console.error('Erro ao carregar combos:', e);
        setCombos(DEFAULT_COMBOS);
        setActiveComboId(DEFAULT_COMBOS[0].id);
      } finally {
        setLoading(false);
      }
    }

    loadCombos();
  }, []);

  // Combo atualmente selecionado
  const activeCombo = combos.find((c) => c.id === activeComboId) || combos[0];
  const activeIndex = combos.findIndex((c) => c.id === activeComboId);

  // Atualizar campo no combo ativo
  const updateActiveCombo = (patch: Partial<ComboData>) => {
    if (activeIndex === -1) return;
    setCombos((prev) => {
      const copy = [...prev];
      copy[activeIndex] = { ...copy[activeIndex], ...patch };
      return copy;
    });
  };

  // Salvar tudo no backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/terceirao/combos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combos),
      });

      if (res.ok) {
        toast.success('Todos os combos foram salvos com sucesso!');
      } else {
        const err = await res.json();
        toast.error('Erro ao salvar combos: ' + (err.error || 'Erro desconhecido'));
      }
    } catch (e: any) {
      toast.error('Erro de conexão ao salvar combos.');
    } finally {
      setSaving(false);
    }
  };

  // Restaurar padrões de fábrica
  const handleReset = async () => {
    if (
      !confirm(
        'Tem certeza que deseja restaurar todos os combos para a versão original de fábrica? Suas edições atuais serão substituídas.'
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/terceirao/combos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      if (res.ok) {
        const data = await res.json();
        setCombos(data.combos || DEFAULT_COMBOS);
        if (data.combos?.length) setActiveComboId(data.combos[0].id);
        toast.success('Combos restaurados para a configuração original!');
      } else {
        toast.error('Erro ao restaurar combos.');
      }
    } catch (e) {
      toast.error('Erro ao conectar com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  // Adicionar novo combo
  const handleAddCombo = () => {
    const newId = `combo-${Date.now()}`;
    const newCombo: ComboData = {
      id: newId,
      title: 'Novo Combo Terceirão',
      tag: 'Lançamento 🎓',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      accentGradient: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      glowColor: 'rgba(59, 130, 246, 0.25)',
      popular: false,
      active: true,
      image: '/images/terceirao/combo-gold.jpg',
      headline: 'Monte a Identidade dos Sonhos da Sua Turma',
      shortDesc: 'Descrição personalizada do novo combo para formandos.',
      priceEstimate: 'Condições especiais por volume de alunos',
      itemsList: ['Peça personalizada 1', 'Peça personalizada 2', 'Acessório exclusivo'],
      detailedItems: [
        {
          name: 'Peça Principal',
          badge: 'Destaque',
          description: 'Descreva os diferenciais desta peça principal.',
          specs: ['Especificação 1', 'Especificação 2'],
        },
      ],
      materials: [
        { label: 'Tecido', value: 'Algodão Nobre ou Moletom Felpado' },
        { label: 'Técnica', value: 'DTF Têxtil Ultra HD' },
      ],
      bonuses: ['Amostra Virtual 3D grátis', 'Nomes individuais inclusos'],
      whatsappText: 'Olá Tenório Confecções! Gostaria de um orçamento para o Novo Combo!',
    };

    setCombos((prev) => [...prev, newCombo]);
    setActiveComboId(newId);
    toast.success('Novo combo adicionado! Não se esqueça de salvar.');
  };

  // Duplicar combo
  const handleDuplicateCombo = (comboToDup: ComboData) => {
    const newId = `combo-${Date.now()}`;
    const duplicated: ComboData = {
      ...JSON.parse(JSON.stringify(comboToDup)),
      id: newId,
      title: `${comboToDup.title} (Cópia)`,
      popular: false,
    };
    setCombos((prev) => [...prev, duplicated]);
    setActiveComboId(newId);
    toast.success('Combo duplicado! Ajuste os detalhes e salve.');
  };

  // Excluir combo
  const handleDeleteCombo = (idToDelete: string) => {
    if (combos.length <= 1) {
      toast.error('Você não pode excluir todos os combos. O site precisa de pelo menos 1.');
      return;
    }

    if (!confirm('Deseja realmente excluir este combo?')) return;

    const remaining = combos.filter((c) => c.id !== idToDelete);
    setCombos(remaining);
    setActiveComboId(remaining[0].id);
    toast.success('Combo removido da lista.');
  };

  // Upload de Imagem do Combo
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        updateActiveCombo({ image: data.url });
        toast.success('Foto enviada com sucesso!');
      } else {
        const err = await res.json();
        toast.error('Erro no upload: ' + (err.error || 'Falha ao enviar arquivo'));
      }
    } catch (e) {
      toast.error('Erro ao conectar com servidor de upload.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Gerenciamento de DetailedItems (Peça por Peça)
  const handleAddDetailedItem = () => {
    if (!activeCombo) return;
    const newItem: ComboItemDetail = {
      name: 'Nova Peça do Kit',
      badge: 'Incluso',
      description: 'Descrição completa dos atributos e benefícios deste item.',
      specs: ['Especificação técnica inicial'],
    };
    updateActiveCombo({
      detailedItems: [...activeCombo.detailedItems, newItem],
    });
  };

  const handleUpdateDetailedItem = (index: number, patch: Partial<ComboItemDetail>) => {
    if (!activeCombo) return;
    const copy = [...activeCombo.detailedItems];
    copy[index] = { ...copy[index], ...patch };
    updateActiveCombo({ detailedItems: copy });
  };

  const handleDeleteDetailedItem = (index: number) => {
    if (!activeCombo) return;
    const copy = activeCombo.detailedItems.filter((_, i) => i !== index);
    updateActiveCombo({ detailedItems: copy });
  };

  const handleAddSpecToItem = (itemIndex: number) => {
    if (!activeCombo) return;
    const copy = [...activeCombo.detailedItems];
    copy[itemIndex].specs.push('Nova especificação');
    updateActiveCombo({ detailedItems: copy });
  };

  const handleUpdateSpecOfItem = (itemIndex: number, specIndex: number, val: string) => {
    if (!activeCombo) return;
    const copy = [...activeCombo.detailedItems];
    copy[itemIndex].specs[specIndex] = val;
    updateActiveCombo({ detailedItems: copy });
  };

  const handleDeleteSpecOfItem = (itemIndex: number, specIndex: number) => {
    if (!activeCombo) return;
    const copy = [...activeCombo.detailedItems];
    copy[itemIndex].specs = copy[itemIndex].specs.filter((_, i) => i !== specIndex);
    updateActiveCombo({ detailedItems: copy });
  };

  // Gerenciamento de Bullets Rápidos (itemsList)
  const handleAddItemBullet = () => {
    if (!activeCombo) return;
    updateActiveCombo({
      itemsList: [...activeCombo.itemsList, 'Novo item na lista de destaques'],
    });
  };

  const handleUpdateItemBullet = (index: number, val: string) => {
    if (!activeCombo) return;
    const copy = [...activeCombo.itemsList];
    copy[index] = val;
    updateActiveCombo({ itemsList: copy });
  };

  const handleDeleteItemBullet = (index: number) => {
    if (!activeCombo) return;
    const copy = activeCombo.itemsList.filter((_, i) => i !== index);
    updateActiveCombo({ itemsList: copy });
  };

  // Gerenciamento de Materiais (materials)
  const handleAddMaterial = () => {
    if (!activeCombo) return;
    updateActiveCombo({
      materials: [...activeCombo.materials, { label: 'Novo Item', value: 'Especificação do material' }],
    });
  };

  const handleUpdateMaterial = (index: number, patch: Partial<ComboMaterial>) => {
    if (!activeCombo) return;
    const copy = [...activeCombo.materials];
    copy[index] = { ...copy[index], ...patch };
    updateActiveCombo({ materials: copy });
  };

  const handleDeleteMaterial = (index: number) => {
    if (!activeCombo) return;
    const copy = activeCombo.materials.filter((_, i) => i !== index);
    updateActiveCombo({ materials: copy });
  };

  // Gerenciamento de Bônus (bonuses)
  const handleAddBonus = () => {
    if (!activeCombo) return;
    updateActiveCombo({
      bonuses: [...activeCombo.bonuses, 'Novo brinde ou vantagem exclusiva'],
    });
  };

  const handleUpdateBonus = (index: number, val: string) => {
    if (!activeCombo) return;
    const copy = [...activeCombo.bonuses];
    copy[index] = val;
    updateActiveCombo({ bonuses: copy });
  };

  const handleDeleteBonus = (index: number) => {
    if (!activeCombo) return;
    const copy = activeCombo.bonuses.filter((_, i) => i !== index);
    updateActiveCombo({ bonuses: copy });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Carregando editor de combos do Terceirão...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Combos do Terceirão</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Edite cada detalhe dos combos individualmente: textos, itens inclusos, especificações, fotos e preços.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/terceirao"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver no Site</span>
          </Link>

          <button
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-xs font-bold border border-slate-700 hover:border-rose-800/40 transition"
            title="Restaurar combos para a versão original"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Restaurar Padrão</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>SALVANDO...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SALVAR ALTERAÇÕES</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Combos Navigation Tabs & Action Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Selecione o Combo para Editar
          </h2>

          <button
            onClick={handleAddCombo}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-400/30 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Combo</span>
          </button>
        </div>

        {/* Combos Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {combos.map((combo) => {
            const isSelected = combo.id === activeComboId;
            return (
              <div
                key={combo.id}
                onClick={() => setActiveComboId(combo.id)}
                className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                    <Image
                      src={combo.image}
                      alt={combo.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                    {combo.popular && (
                      <span className="absolute top-2 right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" />
                        Mais Escolhido
                      </span>
                    )}
                    {combo.active === false && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Oculto
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold text-amber-400/80 uppercase tracking-wider block">
                      {combo.tag || 'Combo Terceirão'}
                    </span>
                    <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition">
                      {combo.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{combo.headline}</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{combo.detailedItems?.length || 0} peças detalhadas</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDuplicateCombo(combo)}
                      title="Duplicar este combo"
                      className="p-1 hover:text-white hover:bg-slate-800 rounded transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {combos.length > 1 && (
                      <button
                        onClick={() => handleDeleteCombo(combo.id)}
                        title="Excluir este combo"
                        className="p-1 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Panel for Selected Combo */}
      {activeCombo && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-10 shadow-2xl">
          {/* Active Combo Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Editando Combo:
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{activeCombo.title}</h2>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={activeCombo.active !== false}
                  onChange={(e) => updateActiveCombo({ active: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                />
                <span>Visível no Site</span>
              </label>

              <div className="w-px h-4 bg-slate-800" />

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-400">
                <input
                  type="checkbox"
                  checked={Boolean(activeCombo.popular)}
                  onChange={(e) => updateActiveCombo({ popular: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                />
                <span>Mais Escolhido (Destaque)</span>
              </label>
            </div>
          </div>

          {/* Section 1: Informações Gerais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>1. Informações Gerais & Apresentação</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Título do Combo:
                </label>
                <input
                  type="text"
                  value={activeCombo.title}
                  onChange={(e) => updateActiveCombo({ title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Combo Terceirão Gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tag / Selo do Topo:
                </label>
                <input
                  type="text"
                  value={activeCombo.tag}
                  onChange={(e) => updateActiveCombo({ tag: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Mais Pedido pelas Comissões 🏆"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Chamada Principal (Headline):
                </label>
                <input
                  type="text"
                  value={activeCombo.headline}
                  onChange={(e) => updateActiveCombo({ headline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ex: O Kit Completo & Definitivo dos Formandos"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Descrição Curta de Impacto:
                </label>
                <textarea
                  rows={3}
                  value={activeCombo.shortDesc}
                  onChange={(e) => updateActiveCombo({ shortDesc: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="Explique o propósito deste combo para a comissão..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Estimativa de Preço / Condição de Turma:
                </label>
                <input
                  type="text"
                  value={activeCombo.priceEstimate}
                  onChange={(e) => updateActiveCombo({ priceEstimate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Desconto escalonado por turma • A partir de 15 alunos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Mensagem Automática para o WhatsApp:
                </label>
                <input
                  type="text"
                  value={activeCombo.whatsappText}
                  onChange={(e) => updateActiveCombo({ whatsappText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="Olá Tenório Confecções! Gostaria de um orçamento para o..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Imagem do Combo */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>2. Foto Oficial do Combo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
                <Image
                  src={activeCombo.image}
                  alt={activeCombo.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <p className="text-xs text-slate-400">
                  Envie uma nova foto do combo (recomendado 1024x768 ou 16:9 em formato JPG/PNG/WebP) ou especifique o caminho da imagem.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Enviando foto...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Subir Imagem do Computador</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Ou digite o caminho/URL da imagem:
                  </label>
                  <input
                    type="text"
                    value={activeCombo.image}
                    onChange={(e) => updateActiveCombo({ image: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="/images/terceirao/combo-gold.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Detalhamento Peça por Peça (O ponto alto do pedido do usuário!) */}
          <div className="space-y-6 pt-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <Shirt className="w-4 h-4 text-amber-400" />
                  <span>3. Detalhamento Peça por Peça (Itens Inclusos)</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Edite individualmente cada produto dentro deste combo com descrição e especificações técnicas.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddDetailedItem}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-xl transition self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Peça ao Combo</span>
              </button>
            </div>

            <div className="space-y-4">
              {activeCombo.detailedItems.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 space-y-4 relative"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/20">
                        {itemIdx + 1}
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        {item.name || `Peça #${itemIdx + 1}`}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDetailedItem(itemIdx)}
                      className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/30 transition flex items-center gap-1"
                      title="Excluir esta peça"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Excluir Peça</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Nome da Peça:
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleUpdateDetailedItem(itemIdx, { name: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="Ex: Moletom Canguru Flanelado 320g"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Selo / Badge:
                      </label>
                      <input
                        type="text"
                        value={item.badge || ''}
                        onChange={(e) =>
                          handleUpdateDetailedItem(itemIdx, { badge: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                        placeholder="Ex: Peça Principal"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Descrição da Peça:
                      </label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          handleUpdateDetailedItem(itemIdx, { description: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        placeholder="Explique os atributos principais deste item..."
                      />
                    </div>
                  </div>

                  {/* Specs List */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Especificações Técnicas desta peça:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddSpecToItem(itemIdx)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Adicionar Especificação</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {item.specs.map((spec, specIdx) => (
                        <div key={specIdx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <input
                            type="text"
                            value={spec}
                            onChange={(e) =>
                              handleUpdateSpecOfItem(itemIdx, specIdx, e.target.value)
                            }
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                            placeholder="Ex: Capuz anatômico duplo com ilhós de metal"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteSpecOfItem(itemIdx, specIdx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remover especificação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Lista Resumida de Vantagens (Bullets da Capa) */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <ListPlus className="w-4 h-4 text-amber-400" />
                  <span>4. Lista Rápida de Destaques (Bullets)</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estes itens aparecem na lista resumida logo abaixo do título do combo.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItemBullet}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Destaque</span>
              </button>
            </div>

            <div className="space-y-2">
              {activeCombo.itemsList.map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleUpdateItemBullet(bIdx, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Ex: Moletom Canguru Flanelado 320g com capuz forrado"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteItemBullet(bIdx)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Ficha Técnica & Materiais */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <BadgePercent className="w-4 h-4 text-amber-400" />
                  <span>5. Ficha Técnica & Materiais</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pares de rótulo e especificação (ex: Tecido, Gramatura, Técnica de Estampa).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMaterial}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Material</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeCombo.materials.map((mat, mIdx) => (
                <div
                  key={mIdx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-2"
                >
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={mat.label}
                      onChange={(e) => handleUpdateMaterial(mIdx, { label: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                      placeholder="Rótulo (ex: Tecido)"
                    />
                    <input
                      type="text"
                      value={mat.value}
                      onChange={(e) => handleUpdateMaterial(mIdx, { value: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                      placeholder="Valor (ex: Algodão Penteado 30.1)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMaterial(mIdx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                    title="Excluir material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Bônus & Brindes Inclusos */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>6. Bônus & Vantagens Exclusivas da Turma</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Brindes e facilidades inclusas sem custo extra para a comissão.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddBonus}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Bônus</span>
              </button>
            </div>

            <div className="space-y-2">
              {activeCombo.bonuses.map((bonus, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={bonus}
                    onChange={(e) => handleUpdateBonus(bIdx, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Ex: Amostra Virtual 3D grátis antes da confecção"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteBonus(bIdx)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition"
                    title="Remover bônus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                As alterações serão aplicadas instantaneamente na página pública após salvar.
              </span>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-black shadow-xl shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>SALVANDO...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SALVAR TODAS AS ALTERAÇÕES</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
