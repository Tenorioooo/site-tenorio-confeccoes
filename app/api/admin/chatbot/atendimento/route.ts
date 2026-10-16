import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const BOT_URL = process.env.CHATBOT_API_URL || process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://127.0.0.1:3001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, telefone, nome, motivo, reativarBot } = body;

    let botResponded = false;
    let botResult: any = null;

    // 1. Tenta comunicar diretamente com o robô (porta 3001)
    try {
      let endpoint = '';
      let method = 'POST';
      let payload: any = {};

      if (action === 'reativar' && id) {
        endpoint = `/api/atendimento/${id}/reativar`;
      } else if (action === 'pausar' && id) {
        endpoint = `/api/atendimento/${id}/pausar`;
      } else if (action === 'toggle' && id) {
        endpoint = `/api/atendimento/${id}/toggle-bot`;
      } else if (action === 'concluir' && id) {
        endpoint = `/api/atendimento/${id}/concluir`;
        payload = { reativarBot: reativarBot !== false };
      } else if (action === 'adicionar' && telefone) {
        endpoint = `/api/atendimento/adicionar-pausa`;
        payload = { telefone, nome, motivo, pausar: true };
      } else if (action === 'remover' && id) {
        endpoint = `/api/atendimento/${id}`;
        method = 'DELETE';
      }

      if (endpoint) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const res = await fetch(`${BOT_URL}${endpoint}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'POST' ? JSON.stringify(payload) : undefined,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          botResult = await res.json();
          botResponded = true;
        }
      }
    } catch (directErr) {
      // Robô remoto ou offline na porta 3001
    }

    // 2. Se o robô não respondeu diretamente (ex: rodando na nuvem / Vercel),
    // enfileira o comando para o próximo Heartbeat do robô
    if (!botResponded) {
      try {
        const pendingSetting = await prisma.siteSetting.findUnique({
          where: { key: 'chatbot_pending_commands' }
        });
        let queue: any[] = [];
        if (pendingSetting?.value) {
          try {
            queue = JSON.parse(pendingSetting.value);
          } catch (e) {}
        }
        queue.push({
          action,
          id,
          telefone,
          nome,
          motivo,
          reativarBot,
          timestamp: Date.now()
        });
        // Mantém no máximo 20 comandos pendentes
        if (queue.length > 20) queue = queue.slice(-20);

        await prisma.siteSetting.upsert({
          where: { key: 'chatbot_pending_commands' },
          update: { value: JSON.stringify(queue) },
          create: { key: 'chatbot_pending_commands', value: JSON.stringify(queue) }
        });
      } catch (e) {}
    }

    // 3. Atualiza estado em cache no banco para refletir instantaneamente no painel
    try {
      const statusSetting = await prisma.siteSetting.findUnique({
        where: { key: 'chatbot_live_status' }
      });
      if (statusSetting?.value) {
        const statusData = JSON.parse(statusSetting.value);
        if (Array.isArray(statusData.clientesAguardando)) {
          if (action === 'reativar' && id) {
            statusData.clientesAguardando = statusData.clientesAguardando.map((c: any) =>
              c.id === id ? { ...c, roboPausado: false, status: 'ATENDIDO', reativadoEm: new Date().toISOString() } : c
            );
          } else if (action === 'pausar' && id) {
            statusData.clientesAguardando = statusData.clientesAguardando.map((c: any) =>
              c.id === id ? { ...c, roboPausado: true, status: 'AGUARDANDO', pausadoEm: new Date().toISOString() } : c
            );
          } else if (action === 'toggle' && id) {
            statusData.clientesAguardando = statusData.clientesAguardando.map((c: any) => {
              if (c.id === id) {
                const novo = !c.roboPausado;
                return {
                  ...c,
                  roboPausado: novo,
                  status: novo ? 'AGUARDANDO' : 'ATENDIDO',
                  pausadoEm: novo ? new Date().toISOString() : c.pausadoEm,
                  reativadoEm: novo ? c.reativadoEm : new Date().toISOString()
                };
              }
              return c;
            });
          } else if (action === 'concluir' && id) {
            statusData.clientesAguardando = statusData.clientesAguardando.map((c: any) =>
              c.id === id ? { ...c, status: 'ATENDIDO', concluidoEm: new Date().toISOString(), ...(reativarBot ? { roboPausado: false } : {}) } : c
            );
          } else if (action === 'remover' && id) {
            statusData.clientesAguardando = statusData.clientesAguardando.filter((c: any) => c.id !== id);
          } else if (action === 'adicionar' && telefone) {
            const limpo = String(telefone).replace(/[^0-9]/g, '');
            statusData.clientesAguardando.unshift({
              id: 'CLI-' + Date.now(),
              nome: nome || 'Cliente Manual',
              telefone: limpo,
              motivo: motivo || 'Pausa manual via Painel',
              data: new Date().toISOString(),
              status: 'AGUARDANDO',
              roboPausado: true,
              pausadoEm: new Date().toISOString()
            });
          }

          // Recalcula contador
          if (statusData.stats) {
            statusData.stats.totalAguardandoHumano = statusData.clientesAguardando.filter((c: any) => c.status === 'AGUARDANDO' || c.roboPausado !== false).length;
          }

          await prisma.siteSetting.update({
            where: { key: 'chatbot_live_status' },
            data: { value: JSON.stringify(statusData) }
          });
        }
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: botResponded ? (botResult?.message || 'Ação executada com sucesso!') : 'Comando sincronizado com sucesso!',
      item: botResult?.item || null
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
