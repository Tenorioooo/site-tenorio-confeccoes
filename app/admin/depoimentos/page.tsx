'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  Star,
  X,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Quote,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  name: string;
  city: string;
  text: string;
  rating: number;
  image?: string | null;
  active: boolean;
  createdAt: string;
}

const emptyForm = {
  name: '',
  city: '',
  text: '',
  rating: 5,
  image: '',
  active: true,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(emptyForm);

  async function fetchTestimonials() {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials');
      if (res.ok) {
        setTestimonials(await res.json());
      }
    } catch {
      toast.error('Erro ao carregar depoimentos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowUrlInput(false);
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      city: t.city || '',
      text: t.text,
      rating: t.rating,
      image: t.image || '',
      active: t.active,
    });
    setShowUrlInput(false);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'testimonials');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
        toast.success('Foto enviada!');
      } else {
        toast.error(data.error || 'Erro ao enviar foto.');
      }
    } catch {
      toast.error('Erro de conexao.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      toast.error('Nome e depoimento sao obrigatorios.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        city: form.city.trim(),
        text: form.text.trim(),
        rating: form.rating,
        image: form.image.trim() || null,
        active: form.active,
      };
      let res: Response;
      if (editingId) {
        res = await fetch('/api/testimonials/' + editingId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        toast.success(editingId ? 'Depoimento atualizado!' : 'Depoimento adicionado!');
        setModalOpen(false);
        fetchTestimonials();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro ao salvar.');
      }
    } catch {
      toast.error('Erro de conexao.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/testimonials/' + id, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Depoimento removido!');
        setDeletingId(null);
        fetchTestimonials();
      } else {
        toast.error('Erro ao excluir.');
      }
    } catch {
      toast.error('Erro de conexao.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (t: Testimonial) => {
    try {
      const res = await fetch('/api/testimonials/' + t.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: t.name, city: t.city, text: t.text, rating: t.rating, image: t.image, active: !t.active }),
      });
      if (res.ok) {
        toast.success(t.active ? 'Depoimento ocultado.' : 'Depoimento ativado!');
        fetchTestimonials();
      }
    } catch {
      toast.error('Erro ao alterar status.');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Depoimentos de Clientes</span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
            Gerenciar Depoimentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Adicione, edite e gerencie os depoimentos exibidos na pagina inicial.
          </p>
        </div>
        <button
          id="btn-add-testimonial"
          onClick={openNew}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Depoimento
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-7 h-7 text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Carregando depoimentos...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <Quote className="w-12 h-12 text-slate-700 mx-auto" />
          <p className="text-slate-400 font-bold">Nenhum depoimento cadastrado.</p>
          <button
            onClick={openNew}
            className="text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors"
          >
            + Adicionar primeiro depoimento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                t.active ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
              }`}
            >
              {/* Stars & Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= t.rating ? 'fill-blue-400 text-blue-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    t.active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {t.active ? 'Visível' : 'Oculto'}
                </span>
              </div>

              {/* Quote text */}
              <p className="text-slate-300 text-xs italic leading-relaxed line-clamp-4 flex-1 mb-4">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-blue-400 font-bold text-sm">{t.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-xs truncate">{t.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{t.city}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleActive(t)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      t.active
                        ? 'text-slate-400 hover:text-amber-400 bg-slate-950 border-slate-800 hover:border-amber-400/40'
                        : 'text-slate-500 hover:text-emerald-400 bg-slate-950 border-slate-800 hover:border-emerald-400/40'
                    }`}
                    title={t.active ? 'Ocultar' : 'Ativar'}
                  >
                    {t.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 bg-slate-950 border border-slate-800 hover:border-blue-400/40 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {deletingId === t.id ? (
                    <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={saving}
                        className="text-red-400 hover:text-red-300 font-extrabold text-[10px] transition-colors disabled:opacity-50"
                      >
                        Sim
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-slate-400 hover:text-white font-bold text-[10px] transition-colors"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(t.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-950 border border-slate-800 hover:border-red-400/40 rounded-lg transition-colors"
                      title="Excluir"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
              <h2 className="font-bold text-white text-lg">
                {editingId ? 'Editar Depoimento' : 'Novo Depoimento'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name + City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Eduardo M."
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Cidade / Estado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Caruaru - PE"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Testimonial text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Depoimento *
                </label>
                <textarea
                  placeholder="Ex: Excelente qualidade! As camisetas ficaram perfeitas..."
                  value={form.text}
                  onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none h-28 resize-none"
                  required
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Avaliação
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, rating: star }))}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= form.rating
                            ? 'fill-blue-400 text-blue-400'
                            : 'text-slate-700 hover:text-slate-500'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-slate-400 font-bold">{form.rating} estrela{form.rating !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Photo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Foto do Cliente (opcional)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-50"
                  >
                    {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? 'Enviando...' : 'Upload Foto'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput((p) => !p)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    URL
                  </button>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, image: '' }))}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Remover
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {showUrlInput && (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.image}
                    onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                  />
                )}
                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-slate-700"
                  />
                )}
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-white">Visível no site</p>
                  <p className="text-xs text-slate-500">Exibir este depoimento na página inicial</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.active ? 'bg-blue-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      form.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-testimonial"
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-slate-950 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Adicionar Depoimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
