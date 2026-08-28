'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Save, Upload, ImageIcon, CheckCircle2, RefreshCw, KeyRound, Eye, EyeOff, UserCog } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Favicon state
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Credentials form state
  const [credForm, setCredForm] = useState({
    currentPassword: '',
    newName: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingCred, setSavingCred] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [form, setForm] = useState({
    company_name: 'Tenório Confecções',
    whatsapp_number: '5581999999999',
    email: 'contato@tenorioconfeccoes.com.br',
    instagram: '@tenorioconfeccoes',
    address: 'Caruaru - PE | Atendemos todo o Brasil',
    business_hours: 'Seg a Sex: 08h às 18h',
    minimum_order: '10 peças',
    default_lead_time: '7 a 15 dias úteis',
    whatsapp_message_template: 'Olá! Gostaria de solicitar um orçamento na Tenório Confecções.',
    logo_url: '',
    favicon_url: '',
    admin_session_timeout: '15',
  });

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const [settingsRes, meRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/auth/me'),
        ]);
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setForm((prev) => ({ ...prev, ...data }));
          if (data.logo_url) setLogoPreview(data.logo_url);
          if (data.favicon_url) setFaviconPreview(data.favicon_url);
        }
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user?.email) setCurrentUserEmail(meData.user.email);
          if (meData.user?.name) setCredForm((p) => ({ ...p, newName: '' }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview before upload
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);

    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload/logo', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, logo_url: data.url }));
        setLogoPreview(data.url + '?t=' + Date.now()); // bust cache
        toast.success('Logo enviada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao enviar logo.');
        setLogoPreview(form.logo_url || null);
      }
    } catch {
      toast.error('Falha na comunicação com o servidor.');
      setLogoPreview(form.logo_url || null);
    } finally {
      setUploadingLogo(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setFaviconPreview(objectUrl);

    setUploadingFavicon(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload/favicon', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, favicon_url: data.url }));
        setFaviconPreview(data.url + '?t=' + Date.now());
        toast.success('Favicon atualizado com sucesso! Atualize a página com Ctrl+F5 para ver.');
      } else {
        toast.error(data.error || 'Erro ao enviar favicon.');
        setFaviconPreview(form.favicon_url || null);
      }
    } catch {
      toast.error('Falha na comunicação com o servidor.');
      setFaviconPreview(form.favicon_url || null);
    } finally {
      setUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar configurações.');
      }
    } catch {
      toast.error('Erro de comunicação.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
          Configurações da Empresa
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Altere logotipo, informações de contato, WhatsApp, prazos e horários exibidos no site.
        </p>
      </div>

      {/* ── LOGO UPLOAD CARD ────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl space-y-5">
        <div>
          <h2 className="font-bold text-white text-sm">Logotipo da Empresa</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formatos aceitos: JPG, PNG, WEBP, SVG. Tamanho máximo: 5 MB.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Preview box */}
          <div className="w-32 h-32 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {logoPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoPreview}
                alt="Logo atual"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-slate-600" />
            )}
          </div>

          <div className="space-y-3 flex-1 text-xs">
            {form.logo_url && (
              <p className="text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 break-all">
                {form.logo_url}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg"
              className="hidden"
              id="logo-upload-input"
              onChange={handleLogoUpload}
            />

            <label
              htmlFor="logo-upload-input"
              className={`inline-flex items-center gap-2 cursor-pointer ${
                uploadingLogo
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-400 text-slate-950'
              } font-extrabold px-5 py-2.5 rounded-xl shadow transition-all`}
            >
              {uploadingLogo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ENVIANDO...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{form.logo_url ? 'TROCAR LOGO' : 'ENVIAR LOGO'}</span>
                </>
              )}
            </label>

            {form.logo_url && (
              <p className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Logo personalizada ativa
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── FAVICON UPLOAD CARD ─────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-sm">Favicon do Site (Ícone da Aba do Navegador)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              O ícone quadrado ou circular exibido na aba do navegador. Aceita PNG, SVG, ICO ou JPG.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Mock Browser Tab Preview */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shrink-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Como aparece na aba:</span>
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-700 px-3.5 py-2 rounded-xl text-xs shadow-inner">
              <div className="w-5 h-5 rounded-md bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 border border-slate-800">
                {faviconPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={faviconPreview}
                    alt="Favicon"
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/favicon.svg"
                    alt="Favicon default"
                    className="w-4 h-4 object-contain"
                  />
                )}
              </div>
              <span className="text-slate-200 font-semibold text-[11px] truncate max-w-[140px]">
                {form.company_name || 'Tenório Confecções'}
              </span>
            </div>
          </div>

          <div className="space-y-3 flex-1 text-xs">
            {form.favicon_url && (
              <p className="text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 break-all">
                {form.favicon_url}
              </p>
            )}

            <input
              ref={faviconInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg,.ico"
              className="hidden"
              id="favicon-upload-input"
              onChange={handleFaviconUpload}
            />

            <label
              htmlFor="favicon-upload-input"
              className={`inline-flex items-center gap-2 cursor-pointer ${
                uploadingFavicon
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              } font-extrabold px-5 py-2.5 rounded-xl shadow transition-all`}
            >
              {uploadingFavicon ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ENVIANDO...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{form.favicon_url ? 'TROCAR FAVICON' : 'ENVIAR FAVICON PERSONALIZADO'}</span>
                </>
              )}
            </label>

            {form.favicon_url && (
              <p className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Favicon personalizado ativo
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── GENERAL SETTINGS FORM ───────────────────────────────── */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-3xl">
        <h2 className="font-bold text-white text-sm border-b border-slate-800 pb-3">
          Informações de Contato & Site
        </h2>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Nome Oficial da Empresa</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Número do WhatsApp Comercial</label>
              <input
                type="text"
                value={form.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">E-mail Principal</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Endereço / Cidade / Estado</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Horário de Funcionamento</label>
              <input
                type="text"
                placeholder="Ex: Seg a Sex: 08h às 18h | Sáb: 08h às 12h"
                value={form.business_hours}
                onChange={(e) => handleChange('business_hours', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Quantidade Mínima de Pedido</label>
              <input
                type="text"
                value={form.minimum_order}
                onChange={(e) => handleChange('minimum_order', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Prazo Padrão de Produção</label>
            <input
              type="text"
              value={form.default_lead_time}
              onChange={(e) => handleChange('default_lead_time', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Mensagem Padrão de Saudação no WhatsApp</label>
            <textarea
              value={form.whatsapp_message_template}
              onChange={(e) => handleChange('whatsapp_message_template', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white h-20 resize-none focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition-all text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}</span>
        </button>
      </form>

      {/* ── SECURITY / SESSION SECTION ───────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl max-w-3xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Segurança &amp; Sessão</h2>
            <p className="text-[11px] text-slate-400">Controle o tempo de sessão inativa no painel</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <label className="text-slate-300 font-bold block">Tempo Limite de Inatividade</label>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Após esse período sem interação, o painel exibirá um aviso de 60 segundos e então encerrará a sessão automaticamente.
          </p>
          <select
            value={form.admin_session_timeout}
            onChange={(e) => handleChange('admin_session_timeout', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
          >
            <option value="disabled">🔓 Sem limite (sessão permanente)</option>
            <option value="5">5 minutos</option>
            <option value="10">10 minutos</option>
            <option value="15">15 minutos (Padrão)</option>
            <option value="30">30 minutos</option>
            <option value="60">1 hora</option>
            <option value="120">2 horas</option>
          </select>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_session_timeout: form.admin_session_timeout }),
              });
              if (res.ok) {
                toast.success('Configuração de sessão salva!');
              } else {
                toast.error('Erro ao salvar configuração.');
              }
            } catch {
              toast.error('Falha na comunicação com o servidor.');
            } finally {
              setSaving(false);
            }
          }}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg transition-all text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'SALVANDO...' : 'SALVAR SEGURANÇA'}</span>
        </button>
      </div>
      {/* ── CREDENTIALS SECTION ───────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-3xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <UserCog className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Alterar Credenciais de Acesso</h2>
            <p className="text-[11px] text-slate-400">Atualize seu nome, e-mail ou senha do painel</p>
          </div>
        </div>

        {/* Current user info */}
        {currentUserEmail && (
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs">
            <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400">Conta atual:</span>
            <span className="text-white font-semibold">{currentUserEmail}</span>
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
              toast.error('As senhas não coincidem.');
              return;
            }
            setSavingCred(true);
            try {
              const res = await fetch('/api/auth/credentials', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  currentPassword: credForm.currentPassword,
                  newName: credForm.newName || undefined,
                  newEmail: credForm.newEmail || undefined,
                  newPassword: credForm.newPassword || undefined,
                }),
              });
              const data = await res.json();
              if (res.ok) {
                toast.success('Credenciais atualizadas com sucesso!');
                if (data.user?.email) setCurrentUserEmail(data.user.email);
                setCredForm({ currentPassword: '', newName: '', newEmail: '', newPassword: '', confirmPassword: '' });
              } else {
                toast.error(data.error || 'Erro ao atualizar credenciais.');
              }
            } catch {
              toast.error('Falha na comunicação com o servidor.');
            } finally {
              setSavingCred(false);
            }
          }}
          className="space-y-5 text-xs"
        >
          {/* Current Password — always required */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Senha Atual <span className="text-red-400">*</span></label>
            <p className="text-slate-500 text-[11px]">Necessária para confirmar qualquer alteração</p>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                value={credForm.currentPassword}
                onChange={(e) => setCredForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Digite sua senha atual"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-3 text-white focus:border-blue-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5 space-y-4">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Alterar — preencha apenas os campos que deseja modificar</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Name */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Novo Nome</label>
                <input
                  type="text"
                  value={credForm.newName}
                  onChange={(e) => setCredForm((p) => ({ ...p, newName: e.target.value }))}
                  placeholder="Deixe em branco para manter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none placeholder:text-slate-600"
                />
              </div>

              {/* New Email */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Novo E-mail</label>
                <input
                  type="email"
                  value={credForm.newEmail}
                  onChange={(e) => setCredForm((p) => ({ ...p, newEmail: e.target.value }))}
                  placeholder="Deixe em branco para manter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={credForm.newPassword}
                    onChange={(e) => setCredForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Mín. 6 caracteres"
                    minLength={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-3 text-white focus:border-blue-400 focus:outline-none placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={credForm.confirmPassword}
                    onChange={(e) => setCredForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repita a nova senha"
                    className={`w-full bg-slate-950 border rounded-xl pl-3 pr-10 py-3 text-white focus:outline-none placeholder:text-slate-600 ${
                      credForm.confirmPassword && credForm.newPassword !== credForm.confirmPassword
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-slate-800 focus:border-blue-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {credForm.confirmPassword && credForm.newPassword !== credForm.confirmPassword && (
                  <p className="text-red-400 text-[11px]">As senhas não coincidem</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingCred || !credForm.currentPassword}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{savingCred ? 'SALVANDO...' : 'SALVAR CREDENCIAIS'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
