'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function AdminInactivityWatcher({ onLogout }: { onLogout?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(15);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isWarningActiveRef = useRef<boolean>(false);

  useEffect(() => {
    async function loadTimeoutSetting() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data?.admin_session_timeout) {
            if (data.admin_session_timeout === 'disabled' || data.admin_session_timeout === '0') {
              setIsDisabled(true);
            } else {
              const minutes = parseInt(data.admin_session_timeout, 10);
              if (!isNaN(minutes) && minutes > 0) {
                setTimeoutMinutes(minutes);
                setIsDisabled(false);
              }
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar tempo limite de sessao:', err);
      }
    }

    if (pathname !== '/admin/login') {
      loadTimeoutSetting();
    }
  }, [pathname]);

  const handlePerformLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login?reason=inactivity');
      }
      toast.warning('Sua sessão foi encerrada por tempo de ausência.');
    } catch (e) {
      router.push('/admin/login?reason=inactivity');
    } finally {
      setLoggingOut(false);
      setShowWarningModal(false);
    }
  }, [onLogout, router]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isWarningActiveRef.current) {
      isWarningActiveRef.current = false;
      setShowWarningModal(false);
      setSecondsRemaining(60);
    }
  }, []);


  useEffect(() => {
    if (pathname === '/admin/login' || isDisabled) return;

    let throttleTimeout: NodeJS.Timeout | null = null;
    const handleUserActivity = () => {
      if (isWarningActiveRef.current) return;
      if (!throttleTimeout) {
        lastActivityRef.current = Date.now();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 3000);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [pathname, isDisabled]);


  useEffect(() => {
    if (pathname === '/admin/login' || isDisabled) {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      return;
    }

    const totalMs = timeoutMinutes * 60 * 1000;
    const warningThresholdMs = 60 * 1000;

    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const remainingMs = totalMs - elapsed;

      if (remainingMs <= 0) {
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        handlePerformLogout();
      } else if (remainingMs <= warningThresholdMs) {
        isWarningActiveRef.current = true;
        setShowWarningModal(true);
        setSecondsRemaining(Math.max(1, Math.ceil(remainingMs / 1000)));
      } else {
        if (isWarningActiveRef.current) {
          isWarningActiveRef.current = false;
          setShowWarningModal(false);
        }
      }
    }, 1000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [timeoutMinutes, isDisabled, pathname, handlePerformLogout]);

  if (pathname === '/admin/login' || !showWarningModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-33\ p-6 sm:p-8 max-w-md w-full shadow-21l space-y-6 text-center relative overflow-hidden">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 t-40 bg-amber-500/20 blur-3l| rounded-full pointer-events-none" />

        <div className="mx-auto w-16 h-16 rounded-2l bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Aviso de Inatividade</span>
          </span>
          <h3 className="font-serif font-extrabold text-2xl text-white">
            Você ainda está aí?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Por motivos de segurança, sua sessão no painel será encerrada automaticamente por ausência em:
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2l p-4 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold font-mono text-amber-400 tracking-wider">
            {String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:
            {String(secondsRemaining % 60).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            segundos restantes para encerramento
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={resetActivity}
            className="w-full flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-xs active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>CONTINUAR CONECTADO</span>
          </button>

          <button
            type="button"
            onClick={handlePerformLogout}
            disabled={loggingOut}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-red-400 hover:text-red-300 border border-slate-800 py-3.5 px-4 rounded-xl transition-colors text-xs font-bold disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? 'Saindo...' : 'Sair Agora'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
