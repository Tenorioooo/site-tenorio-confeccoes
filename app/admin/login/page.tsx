'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, KeyRound, ArrowRight, Clock } from 'lucide-react';
import { toast } from 'sonner';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInactivityLogout = searchParams.get('reason') === 'inactivity';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        toast.success('Login efetuado com sucesso!');
        router.push('/admin');
      } else {
        toast.error(data?.error || 'Credenciais inválidas.');
      }
    } catch (e: any) {
      toast.error('Erro de conexão ao realizar login: ' + (e?.message || 'Falha de rede'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative">
        <div className="flex flex-col items-start gap-2">
          <div className="relative flex items-center justify-start">
            <Image
              src="/logo/LOGO2 - TENÓRIO CONFECÇÕES.png"
              alt="Tenório Confecções"
              width={64}
              height={64}
              unoptimized
              className="object-contain h-16 w-auto max-w-[200px] drop-shadow-md mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo/Icon.png';
              }}
            />
          </div>
          <h1 className="font-serif font-bold text-2xl text-white w-full text-center">Painel Administrativo</h1>
          <p className="text-xs text-slate-400 w-full text-center">Tenório Confecções — Controle de Produtos e Orçamentos</p>
        </div>

        {/* Inactivity notice */}
        {isInactivityLogout && (
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-300 leading-relaxed">
              <span className="font-bold block">Sessão encerrada por inatividade.</span>
              Você foi desconectado automaticamente por ausência no painel. Por favor, faça o login novamente.
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">E-mail de Acesso</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Senha</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg transition-all text-xs"
          >
            <span>{loading ? 'ENTRANDO...' : 'ACESSAR PAINEL ADMIN'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-[11px] text-slate-500">
            Acesso restrito para administradores autorizados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Carregando...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
