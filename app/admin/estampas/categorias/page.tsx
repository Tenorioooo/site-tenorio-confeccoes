'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  GripVertical,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface CategoryData {
  name: string;
  count: number;
}

export default function AdminPrintCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const newInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/prints/categories');
      const data = await res.json();
      if (res.ok) {
        const list: CategoryData[] = data.categories.map((cat: string) => ({
          name: cat,
          count: data.counts?.[cat] ?? 0,
        }));
        setCategories(list);
      }
    } catch {
      toast.error('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (addingNew && newInputRef.current) {
      newInputRef.current.focus();
    }
  }, [addingNew]);

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingIndex]);

  const handleAddCategory = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await fetch('/api/prints/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Categoria "${trimmed}" adicionada!`);
        setNewName('');
        setAddingNew(false);
        await fetchCategories();
      } else {
        toast.error(data.error || 'Erro ao adicionar categoria.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  const handleRenameCategory = async (oldName: string) => {
    const trimmed = editingValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingIndex(null);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/prints/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', oldName, newName: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Categoria renomeada para "${trimmed}"!`);
        setEditingIndex(null);
        await fetchCategories();
      } else {
        toast.error(data.error || 'Erro ao renomear categoria.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/prints/categories?category=${encodeURIComponent(name)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(`Categoria "${name}" removida!`);
        setDeletingName(null);
        await fetchCategories();
      } else {
        toast.error(data.error || 'Erro ao excluir categoria.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-3">
            <Tag className="w-7 h-7 text-blue-400" />
            Categorias de Estampas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie as categorias exibidas no catálogo de estampas e no filtro do site.
          </p>
        </div>

        <button
          onClick={() => {
            setAddingNew(true);
            setEditingIndex(null);
          }}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg transition-all text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>NOVA CATEGORIA</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-300">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
        <p>
          As categorias aqui definidas aparecem como filtros na{' '}
          <span className="text-white font-bold">página de catálogo de estampas</span>. Ao renomear uma categoria, todas as
          estampas associadas são atualizadas automaticamente.
        </p>
      </div>

      {/* Category List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Add New Category Inline Form */}
        {addingNew && (
          <div className="p-4 border-b border-slate-800 bg-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-blue-400" />
              </div>
              <input
                ref={newInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory();
                  if (e.key === 'Escape') {
                    setAddingNew(false);
                    setNewName('');
                  }
                }}
                placeholder="Nome da nova categoria..."
                className="flex-1 bg-slate-950 border border-blue-500/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400 placeholder-slate-500"
              />
              <button
                onClick={handleAddCategory}
                disabled={saving || !newName.trim()}
                className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salvar
              </button>
              <button
                onClick={() => {
                  setAddingNew(false);
                  setNewName('');
                }}
                className="p-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-7 h-7 text-blue-400 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Carregando categorias...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Tag className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-slate-400 font-bold">Nenhuma categoria cadastrada.</p>
            <button
              onClick={() => setAddingNew(true)}
              className="text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors"
            >
              + Adicionar primeira categoria
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {categories.map((cat, idx) => (
              <li
                key={cat.name}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors group"
              >
                {/* Drag Handle (visual only) */}
                <GripVertical className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors shrink-0" />

                {/* Color dot */}
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500/70 shrink-0" />

                {/* Category Name or Edit Input */}
                {editingIndex === idx ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameCategory(cat.name);
                        if (e.key === 'Escape') setEditingIndex(null);
                      }}
                      className="flex-1 bg-slate-950 border border-blue-500/40 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={() => handleRenameCategory(cat.name)}
                      disabled={saving}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                      title="Salvar"
                    >
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-white truncate">{cat.name}</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        cat.count > 0
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {cat.count} {cat.count === 1 ? 'estampa' : 'estampas'}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                {editingIndex !== idx && (
                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingIndex(idx);
                        setEditingValue(cat.name);
                        setAddingNew(false);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-400 bg-slate-950 border border-slate-800 rounded-lg transition-colors"
                      title="Renomear"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {deletingName === cat.name ? (
                      <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-lg px-2.5 py-1.5">
                        <span className="text-[11px] text-red-400 font-bold whitespace-nowrap">
                          {cat.count > 0
                            ? `${cat.count} estampa(s) perderão a categoria.`
                            : 'Confirmar exclusão?'}
                        </span>
                        <button
                          onClick={() => handleDeleteCategory(cat.name)}
                          disabled={saving}
                          className="text-red-400 hover:text-red-300 font-extrabold text-[11px] transition-colors disabled:opacity-50"
                        >
                          Sim
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          onClick={() => setDeletingName(null)}
                          className="text-slate-400 hover:text-white font-bold text-[11px] transition-colors"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingName(cat.name)}
                        className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 border border-slate-800 rounded-lg transition-colors"
                        title="Excluir categoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Footer summary */}
        {!loading && categories.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-500 font-bold">
            <span>{categories.length} categoria{categories.length !== 1 ? 's' : ''} cadastrada{categories.length !== 1 ? 's' : ''}</span>
            <span>{categories.reduce((acc, c) => acc + c.count, 0)} estampas no total</span>
          </div>
        )}
      </div>
    </div>
  );
}
