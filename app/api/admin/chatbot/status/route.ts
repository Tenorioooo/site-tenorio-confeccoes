import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const BOT_URL = process.env.CHATBOT_API_URL || process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://127.0.0.1:3001';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${BOT_URL}/api/status`, {
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    // Se o robô não responder via HTTP na porta 3001
  }

  // Fallback se o robô estiver offline ou inicializando
  return NextResponse.json({
    status: 'DISCONNECTED',
    qrCode: null,
    info: { phone: null, name: 'Tenório Confecções' },
    stats: {
      totalMensagens: 0,
      totalOrcamentos: 0,
      iniciadoEm: new Date().toISOString(),
      totalProdutos: 0,
      totalAguardandoHumano: 0
    },
    ultimosOrcamentos: [],
    clientesAguardando: [],
    notificacoes: null,
    offline: true
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body?.action;

    let endpoint = '/api/status';
    if (action === 'restart') endpoint = '/api/restart';
    else if (action === 'logout') endpoint = '/api/logout';

    const res = await fetch(`${BOT_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, message: 'Falha ao comunicar com o robô' }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
