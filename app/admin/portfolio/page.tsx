'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Pencil, 
  Search, 
  Upload, 
  RefreshCw, 
  Save, 
  X, 
  Check, 
  Link as LinkIcon, 
  ImageIcon, 
  Sparkles,
  Eye,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

const CATEGORY_SUGGESTIONS = [
  'Camisetas',
  'Moletons',
  'Canecas',
  'Abadás',
  'Bandeiras',
  'Empresas',
  'Uniformes',
  'Outros',
];

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Camisetas',
    image: '',
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
      }
    } catch {
      toast.error('Erro ao carregar portfólio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Camisetas',
      image: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      image: item.image,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'portfolio');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success('Imagem enviada com sucesso!');
      } else {
        toast.error(data.error || 'Falha ao enviar imagem.');
      }
    } catch {
      toast.error('Erro ao conectar ao servidor para envio da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Por favor, informe o título do trabalho.');
      return;
    }
    if (!formData.image.trim()) {
      toast.error('Por favor, insira ou envie uma foto do trabalho.');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        // Update
        const res = await fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            ...formData,
          }),
        });

        if (res.ok) {
          toast.success('Trabalho atualizado com sucesso!');
          closeModal();
          await fetchPortfolio();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Erro ao atualizar trabalho.');
        }
      } else {
        // Create
        const res = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          toast.success('Novo trabalho adicionado ao portfólio!');
          closeModal();
          await fetchPortfolio();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Erro ao criar trabalho.');
        }
      }
    } catch {
      toast.error('Falha de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/portfolio?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Item removido do portfólio!');
        setDeletingId(null);
        await fetchPortfolio();
      } else {
        toast.error('Erro ao excluir item.');
      }
    } catch {
      toast.error('Falha ao conectar com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  // Derive unique categories from items
  const allCategories = Array.from(
    new Set([...CATEGORY_SUGGESTIONS, ...items.map((i) => i.category)])
  ).filter(Boolean);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Galeria de Trabalhos</span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
            Portfólio de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gerencie as fotos, categorias e títulos dos trabalhos reais exibidos na página inicial para os clientes.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>NOVO TRABALHO</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({items.length})
          </button>
          {allCategories.map((cat) => {
            const count = items.filter((i) => i.category.toLowerCase() === cat.toLowerCase()).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar trabalho no portfólio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Portfolio Items */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm">Carregando portfólio...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-slate-700 mx-auto" />
          <div>
            <h3 className="text-white font-bold text-base">Nenhum trabalho encontrado</h3>
            <p className="text-xs text-slate-400 mt-1">
              {search || selectedCategory !== 'all'
                ? 'Tente remover os filtros para visualizar os outros itens.'
                : 'Comece adicionando seu primeiro trabalho ao portfólio de clientes.'}
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Trabalho</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
            >
              {/* Image Preview Box */}
              <div className="relative h-56 w-full bg-slate-950 overflow-hidden border-b border-slate-800 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Badge Overlay */}
                <span className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-blue-400 px-3 py-1 rounded-full shadow-md">
                  {item.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-2 px-3 rounded-xl border border-slate-800 transition-colors text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-400" />
                    <span>Editar</span>
                  </button>

                  {deletingId === item.id ? (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-xl px-2.5 py-1.5">
                      <span className="text-[10px] text-red-400 font-bold">Excluir?</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={saving}
                        className="text-red-400 hover:text-red-300 font-extrabold text-[11px] disabled:opacity-50"
                      >
                        Sim
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-slate-400 hover:text-white font-bold text-[11px]"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-xl transition-colors"
                      title="Excluir trabalho"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL DE ADICIONAR / EDITAR TRABALHO ─────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">
                    {editingItem ? 'Editar Trabalho do Portfólio' : 'Novo Trabalho no Portfólio'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {editingItem ? 'Modifique os dados e imagem abaixo' : 'Adicione uma nova foto real ao catálogo'}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-white bg-slate-950 rounded-xl border border-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Título / Descrição do Trabalho:</label>
                <input
                  type="text"
                  placeholder="Ex: Camisetas Algodão Penteado - Evento Tech 2025"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Categoria:</label>
                <div className="flex items-center gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none cursor-pointer"
                  >
                    {CATEGORY_SUGGESTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Ou digite outra categoria personalizada..."
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:border-blue-400 focus:outline-none mt-1.5"
                />
              </div>

              {/* Image Preview & Upload */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">Foto do Trabalho:</label>
                
                {/* Preview Box */}
                <div className="relative h-44 w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">
                  {formData.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={formData.image}
                      alt="Prévia do trabalho"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 space-y-1">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[11px]">Nenhuma foto selecionada</span>
                    </div>
                  )}
                </div>

                {/* Upload from Computer */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.svg"
                  className="hidden"
                  id="modal-portfolio-upload"
                  onChange={handleFileUpload}
                />

                <label
                  htmlFor="modal-portfolio-upload"
                  className={`w-full inline-flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all shadow-sm ${
                    uploading
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-400 text-slate-950'
                  }`}
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>ENVIANDO FOTO...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>ENVIAR FOTO DO COMPUTADOR</span>
                    </>
                  )}
                </label>

                {/* Or paste URL */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-slate-400 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    <span>Ou cole a URL direta da imagem:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-xl border border-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>SALVANDO...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingItem ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR AO PORTFÓLIO'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
