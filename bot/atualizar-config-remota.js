const fs = require('fs');
const path = require('path');

const SITE_ROOT = 'C:\\Users\\nicol\\OneDrive\\Área de Trabalho\\Tenório Confecções\\SITE TENÓRIO CONFECÇÕES';
const CHATBOT_ROOT = 'c:\\Users\\nicol\\Downloads\\Chat Bot';

// 1. Criar app/api/admin/chatbot/config/route.ts no Next.js
const apiConfigDir = path.join(SITE_ROOT, 'app', 'api', 'admin', 'chatbot', 'config');
fs.mkdirSync(apiConfigDir, { recursive: true });

const routeConfigContent = `import { NextRequest, NextResponse } from 'next/server';
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
`;

fs.writeFileSync(path.join(apiConfigDir, 'route.ts'), routeConfigContent, 'utf-8');
console.log('✅ 1. app/api/admin/chatbot/config/route.ts criado!');

// 2. Atualizar chatbot.js com sincronização em nuvem
const chatbotJsPath = path.join(CHATBOT_ROOT, 'chatbot.js');
let chatbotCode = fs.readFileSync(chatbotJsPath, 'utf-8');

if (!chatbotCode.includes('sincronizarConfigNuvem')) {
  const syncFunction = `
// Sincronização automática de configurações com o site em produção
async function sincronizarConfigNuvem() {
  try {
    const res = await fetch("https://www.tenorioconfeccoes.shop/api/admin/chatbot/config", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.config) {
        salvarConfigNotificacoes(data.config);
      }
    }
  } catch (e) {}
}
setInterval(sincronizarConfigNuvem, 15000);
sincronizarConfigNuvem();
`;

  chatbotCode = chatbotCode.replace(
    'function salvarConfigNotificacoes(config) {',
    syncFunction + '\nfunction salvarConfigNotificacoes(config) {'
  );
  fs.writeFileSync(chatbotJsPath, chatbotCode, 'utf-8');
  console.log('✅ 2. chatbot.js atualizado com sincronização em nuvem!');
}
