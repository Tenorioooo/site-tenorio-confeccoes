'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Palette, Plus, Trash2, Edit2, X, CheckCircle2, Upload, ImageIcon, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import TagSelector from '../../../components/TagSelector';


export default function AdminPrintsPage() {
  const [prints, setPrints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [tags, setTags] = useState('["Verão", "Praia"]');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchPrints() {
    setLoading(true);
    try {
      const res = await fetch('/api/prints');
      if (res.ok) {
        setPrints(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrints();
    // Load available categories dynamically
    fetch('/api/prints/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setAvailableCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setCode(`EST-0${prints.length + 11}`);
    setName('');
    setSelectedCategories([]);
    setTags('["Novo", "Exclusivo"]');
    setImageUrl('');
    setShowUrlInput(false);
    setActive(true);
    setFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (pr: any) => {
    setEditingId(pr.id);
    setSelectedCategories(pr.categories?.map((pc: any) => pc.category.name) || []);
    setCode(pr.code);
    setName(pr.name);
    setTags(pr.tags);
    setImageUrl(pr.imageUrl);
    setShowUrlInput(false);
    setActive(pr.active);
    setFeatured(pr.featured);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'prints');

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok && data.url) {
        setImageUrl(data.url);
        toast.success('Imagem da estampa enviada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao enviar imagem.');
      }
    } catch (err) {
      toast.error('Erro de conexão ao enviar arquivo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      code,
      name,
      tags,
      imageUrl,
      active,
      featured,
      categories: selectedCategories,
    };

    try {
      const res = await fetch(editingId ? `/api/prints/${editingId}` : '/api/prints', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editingId ? 'Estampa atualizada!' : 'Nova estampa cadastrada!');
        setModalOpen(false);
        fetchPrints();
      }
    } catch (e) {
      toast.error('Erro ao salvar estampa.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta estampa?')) return;
    try {
      const res = await fetch(`/api/prints/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Estampa excluída!');
        fetchPrints();
      }
    } catch (e) {
      toast.error('Erro ao excluir estampa.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">Gestão de Estampas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre os códigos (EST-XXX) e imagens de estampas do catálogo.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg transition-all text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>NOVA ESTAMPA</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-4">Código</th>
                <th className="p-4">Nome da Estampa</th>
                <th className="p-4">Categorias</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {prints.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-400 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden relative shrink-0">
                      <img src={pr.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span>{pr.code}</span>
                  </td>
                  <td className="p-4 font-bold text-white">{pr.name}</td>
                  <td className="p-4 text-slate-400">
                    {pr.categories?.map((c: any) => c.category.name).join(', ') || '-'}
                  </td>
                  <td className="p-4">
                    {pr.active ? (
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        Ativa
                      </span>
                    ) : (
                      <span className="text-slate-500 font-bold bg-slate-800 px-2.5 py-1 rounded-full">
                        Inativa
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(pr)}
                      className="p-2 text-slate-400 hover:text-blue-400 rounded-lg bg-slate-950 border border-slate-800"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pr.id)}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg bg-slate-950 border border-slate-800"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-6 shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-xl text-white">
                {editingId ? 'Editar Estampa' : 'Cadastrar Nova Estampa'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Código (ex: EST-001) *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Nome da Estampa *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold block">Categorias</label>
                  <a
                    href="/admin/estampas/categorias"
                    target="_blank"
                    className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    + Gerenciar categorias
                  </a>
                </div>
                                {/* Tag selector for categories */}
                <TagSelector
                  options={availableCategories}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                />
              </div>

              {/* Print Image Upload Area */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold block">Foto / Arte da Estampa</label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-slate-400 hover:text-blue-400 inline-flex items-center gap-1 transition-colors"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showUrlInput ? 'Ocultar Link' : '+ Inserir Link URL'}</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.svg"
                  className="hidden"
                  id="print-photo-upload"
                  onChange={handleFileUpload}
                />

                {imageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-3 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Foto pronta para a estampa
                      </p>
                      <p className="text-[11px] text-slate-400 truncate font-mono">{imageUrl}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label
                        htmlFor="print-photo-upload"
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold p-2 rounded-xl cursor-pointer transition-colors"
                        title="Trocar imagem"
                      >
                        <Upload className="w-4 h-4" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-xl transition-colors"
                        title="Remover imagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="print-photo-upload"
                    className={`border-2 border-dashed border-slate-800 hover:border-blue-400/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all ${
                      uploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2 text-blue-400 font-bold py-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Enviando estampa...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-white block">Clique para escolher imagem do computador</span>
                          <span className="text-[10px] text-slate-500">Formatos aceitos: JPG, PNG, WEBP, SVG (até 15MB)</span>
                        </div>
                      </>
                    )}
                  </label>
                )}

                {/* Optional URL input toggle */}
                {showUrlInput && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-200">
                    <input
                      type="text"
                      placeholder="https://exemplo.com/estampa.png"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg transition-all text-xs"
              >
                SALVAR ESTAMPA
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
