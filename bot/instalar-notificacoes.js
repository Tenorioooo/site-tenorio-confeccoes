const fs = require('fs');
const path = require('path');

const SITE_ROOT = 'C:\\Users\\nicol\\OneDrive\\Área de Trabalho\\Tenório Confecções\\SITE TENÓRIO CONFECÇÕES';
const VAPID_PUBLIC_KEY = 'BFtl7Ov362iDtyoRhavICgBjLhkMa5k0dCyCDFZjIPKHP2brYM9nrYtmGnMD7fvJ7E-wjjS_E5bhfPFgFEY-5BU';
const VAPID_PRIVATE_KEY = 'ltMdkhqlJ9Abh9rpDsdUyzXXEImAG4CvkIL3vJ1swkU';
const VAPID_SUBJECT = 'mailto:contato@tenorioconfeccoes.shop';

// 1. Criar public/manifest.json
const manifestPath = path.join(SITE_ROOT, 'public', 'manifest.json');
const manifest = {
  name: 'Tenório Confecções - Painel Administrativo',
  short_name: 'Tenório Admin',
  description: 'Painel de controle e gestão de atendimento, pedidos e chatbot da Tenório Confecções.',
  start_url: '/admin',
  display: 'standalone',
  background_color: '#020617',
  theme_color: '#020617',
  orientation: 'portrait',
  icons: [
    {
      src: '/logo/icon.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/logo/icon.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml'
    }
  ]
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log('✅ 1. manifest.json criado');

// 2. Criar public/sw.js
const swPath = path.join(SITE_ROOT, 'public', 'sw.js');
const swContent = `// Service Worker para Notificações Web Push - Tenório Confecções
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: '🔔 Tenório Confecções',
    body: 'Você recebeu uma nova notificação.',
    icon: '/logo/icon.png',
    badge: '/logo/icon.png',
    url: '/admin/chatbot',
    tag: 'tenorio-alert-' + Date.now()
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo/icon.png',
    badge: data.badge || '/logo/icon.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/admin/chatbot'
    },
    tag: data.tag || 'general-notification',
    renotify: true,
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/admin/chatbot';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
`;
fs.writeFileSync(swPath, swContent, 'utf-8');
console.log('✅ 2. sw.js criado');

// 3. Atualizar app/layout.tsx com manifest e meta tags iOS
const layoutPath = path.join(SITE_ROOT, 'app', 'layout.tsx');
let layoutCode = fs.readFileSync(layoutPath, 'utf-8');
if (!layoutCode.includes('manifest.json')) {
  layoutCode = layoutCode.replace(
    '<link rel="apple-touch-icon" href={faviconUrl} />',
    `<link rel="apple-touch-icon" href={faviconUrl} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tenório Admin" />`
  );
  fs.writeFileSync(layoutPath, layoutCode, 'utf-8');
  console.log('✅ 3. app/layout.tsx atualizado com suporte a PWA / iOS');
}

// 4. Criar lib/push-notifications.ts
const pushLibDir = path.join(SITE_ROOT, 'lib');
const pushLibPath = path.join(pushLibDir, 'push-notifications.ts');
const pushLibContent = `import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

export const VAPID_PUBLIC_KEY = '${VAPID_PUBLIC_KEY}';
export const VAPID_PRIVATE_KEY = '${VAPID_PRIVATE_KEY}';
export const VAPID_SUBJECT = '${VAPID_SUBJECT}';

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'push-subscriptions.json');

function ensureDirExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export interface StoredSubscription {
  id: string;
  subscription: webpush.PushSubscription;
  userAgent?: string;
  createdAt: string;
}

export function getSubscriptions(): StoredSubscription[] {
  try {
    ensureDirExists(SUBSCRIPTIONS_FILE);
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Erro ao ler push-subscriptions.json:', err);
    return [];
  }
}

export function saveSubscription(sub: webpush.PushSubscription, userAgent?: string): boolean {
  try {
    const list = getSubscriptions();
    const endpoint = sub.endpoint;
    const filtered = list.filter((s) => s.subscription.endpoint !== endpoint);
    filtered.push({
      id: Date.now().toString(),
      subscription: sub,
      userAgent: userAgent || 'Desconhecido',
      createdAt: new Date().toISOString()
    });
    ensureDirExists(SUBSCRIPTIONS_FILE);
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(filtered, null, 2));
    return true;
  } catch (err) {
    console.error('Erro ao salvar subscription:', err);
    return false;
  }
}

export function removeSubscription(endpoint: string): void {
  try {
    const list = getSubscriptions();
    const filtered = list.filter((s) => s.subscription.endpoint !== endpoint);
    ensureDirExists(SUBSCRIPTIONS_FILE);
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(filtered, null, 2));
  } catch (err) {
    console.error('Erro ao remover subscription:', err);
  }
}

export async function sendPushNotification(payload: {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}) {
  const subscriptions = getSubscriptions();
  if (subscriptions.length === 0) {
    return { success: false, totalSent: 0, message: 'Nenhum dispositivo cadastrado para push' };
  }

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/admin/chatbot',
    icon: payload.icon || '/logo/icon.png',
    tag: payload.tag || 'tenorio-alert-' + Date.now()
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (item) => {
      try {
        await webpush.sendNotification(item.subscription, payloadString);
        return { success: true, endpoint: item.subscription.endpoint };
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Inscrição expirou ou foi cancelada no browser
          removeSubscription(item.subscription.endpoint);
        }
        throw err;
      }
    })
  );

  const totalSent = results.filter((r) => r.status === 'fulfilled').length;
  return { success: totalSent > 0, totalSent, totalSubscribers: subscriptions.length };
}
`;
fs.writeFileSync(pushLibPath, pushLibContent, 'utf-8');
console.log('✅ 4. lib/push-notifications.ts criado');

// 5. Criar endpoints de API no Next.js
const apiDir = path.join(SITE_ROOT, 'app', 'api', 'notifications');
fs.mkdirSync(path.join(apiDir, 'vapid-public-key'), { recursive: true });
fs.mkdirSync(path.join(apiDir, 'subscribe'), { recursive: true });
fs.mkdirSync(path.join(apiDir, 'send'), { recursive: true });
fs.mkdirSync(path.join(apiDir, 'test'), { recursive: true });

// 5.1 vapid-public-key/route.ts
fs.writeFileSync(
  path.join(apiDir, 'vapid-public-key', 'route.ts'),
  `import { NextResponse } from 'next/server';
import { VAPID_PUBLIC_KEY } from '@/lib/push-notifications';

export async function GET() {
  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY });
}
`,
  'utf-8'
);

// 5.2 subscribe/route.ts
fs.writeFileSync(
  path.join(apiDir, 'subscribe', 'route.ts'),
  `import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription, getSubscriptions, removeSubscription } from '@/lib/push-notifications';

export async function GET() {
  const subs = getSubscriptions();
  return NextResponse.json({ count: subs.length, subscriptions: subs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription } = body;
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Subscription inválida' }, { status: 400 });
    }
    const userAgent = req.headers.get('user-agent') || 'Dispositivo Desconhecido';
    saveSubscription(subscription, userAgent);
    return NextResponse.json({ success: true, message: 'Dispositivo cadastrado com sucesso!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.endpoint) {
      removeSubscription(body.endpoint);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`,
  'utf-8'
);

// 5.3 send/route.ts (usado pelo chatbot para disparar)
fs.writeFileSync(
  path.join(apiDir, 'send', 'route.ts'),
  `import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push-notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: textBody, url, icon, tag } = body;
    if (!title || !textBody) {
      return NextResponse.json({ error: 'Título e mensagem são obrigatórios' }, { status: 400 });
    }
    const result = await sendPushNotification({ title, body: textBody, url, icon, tag });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`,
  'utf-8'
);

// 5.4 test/route.ts
fs.writeFileSync(
  path.join(apiDir, 'test', 'route.ts'),
  `import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push-notifications';

export async function POST() {
  try {
    const result = await sendPushNotification({
      title: '🚨 Teste de Notificação Tenório Confecções',
      body: 'Seu iPhone 16 Pro está pronto para receber alertas de atendimento humano e vendas!',
      url: '/admin/chatbot',
      tag: 'test-notification'
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`,
  'utf-8'
);

console.log('✅ 5. Rotas de API /api/notifications criadas');
