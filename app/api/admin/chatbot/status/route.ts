import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const BOT_URL = process.env.CHATBOT_API_URL || process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://127.0.0.1:3001';

// Armazenamento em memória para respostas instantâneas (sem latência de banco)
let globalBotState: {
  data: any;
  lastUpdated: number;
} = {
  data: null,
  lastUpdated: 0
};

export async function GET() {
  const agora = Date.now();

  // 1. Se recebemos um Heartbeat recente do robô (últimos 25 segundos)
  if (globalBotState.data && agora - globalBotState.lastUpdated < 25000) {
    return NextResponse.json({
      ...globalBotState.data,
      onlineViaHeartbeat: true,
      lastSyncSecondsAgo: Math.round((agora - globalBotState.lastUpdated) / 1000)
    });
  }

  // 2. Tenta consultar diretamente o robô local na porta 3001 (se estiver rodando no mesmo host/servidor)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${BOT_URL}/api/status`, {
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      globalBotState = {
        data,
        lastUpdated: agora
      };
      return NextResponse.json(data);
    }
  } catch (err: any) {
    // Falha silenciosa na consulta direta
  }

  // 3. Fallback: verifica se há estado persistido no banco de dados (útil para ambientes Serverless como Vercel)
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'chatbot_live_status' }
    });

    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      const timestamp = parsed._timestamp || 0;
      if (agora - timestamp < 30000) {
        globalBotState = {
          data: parsed,
          lastUpdated: timestamp
        };
        return NextResponse.json({
          ...parsed,
          onlineViaHeartbeat: true,
          lastSyncSecondsAgo: Math.round((agora - timestamp) / 1000)
        });
      }
    }
  } catch (err) {}

  // 4. Se não houver comunicação recente, retorna desconectado
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

// POST: Recebe Heartbeat do robô WhatsApp ou dispara ações para o robô
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Se for um HEARTBEAT periódico enviado pelo robô WhatsApp (PC local -> Nuvem)
    if (body.type === 'HEARTBEAT' && body.data) {
      const agora = Date.now();
      const payloadParaSalvar = {
        ...body.data,
        _timestamp: agora
      };

      globalBotState = {
        data: payloadParaSalvar,
        lastUpdated: agora
      };

      // Persiste no banco em segundo plano (sem travar a resposta)
      try {
        await prisma.siteSetting.upsert({
          where: { key: 'chatbot_live_status' },
          update: { value: JSON.stringify(payloadParaSalvar) },
          create: { key: 'chatbot_live_status', value: JSON.stringify(payloadParaSalvar) }
        });
      } catch (e) {}

      return NextResponse.json({ success: true, message: 'Heartbeat registrado com sucesso!' });
    }

    // 2. Se for uma ação manual (restart, logout, etc.)
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
