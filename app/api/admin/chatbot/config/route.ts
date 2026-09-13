import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_CONFIG = {
  adminPhone: '',
  notificarAtendimentoHumano: true,
  notificarNovoOrcamento: true,
  notificarPushWeb: true,
  siteApiUrl: 'https://www.tenorioconfeccoes.shop/api/notifications/send'
};

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'chatbot_notification_config' }
    });
    if (setting?.value) {
      return NextResponse.json({ success: true, config: JSON.parse(setting.value) });
    }
  } catch (err) {
    console.warn('Erro ao buscar config do banco:', err);
  }
  return NextResponse.json({ success: true, config: DEFAULT_CONFIG });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const configData = {
      adminPhone: body.adminPhone || '',
      notificarAtendimentoHumano: body.notificarAtendimentoHumano !== false,
      notificarNovoOrcamento: body.notificarNovoOrcamento !== false,
      notificarPushWeb: body.notificarPushWeb !== false,
      siteApiUrl: body.siteApiUrl || 'https://www.tenorioconfeccoes.shop/api/notifications/send'
    };

    await prisma.siteSetting.upsert({
      where: { key: 'chatbot_notification_config' },
      create: { key: 'chatbot_notification_config', value: JSON.stringify(configData) },
      update: { value: JSON.stringify(configData) }
    });

    return NextResponse.json({ success: true, message: 'Configurações salvas com sucesso!', config: configData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
