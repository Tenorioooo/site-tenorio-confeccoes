import webpush from 'web-push';
import { prisma } from '@/lib/db';

export const VAPID_PUBLIC_KEY = 'BFtl7Ov362iDtyoRhavICgBjLhkMa5k0dCyCDFZjIPKHP2brYM9nrYtmGnMD7fvJ7E-wjjS_E5bhfPFgFEY-5BU';
export const VAPID_PRIVATE_KEY = 'ltMdkhqlJ9Abh9rpDsdUyzXXEImAG4CvkIL3vJ1swkU';
export const VAPID_SUBJECT = 'mailto:contato@tenorioconfeccoes.shop';

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface StoredSubscription {
  id: string;
  subscription: webpush.PushSubscription;
  userAgent?: string;
  createdAt: string;
}

// Armazenamento no Banco de Dados (SiteSetting no Postgres/Neon) com fallback em memória
let memorySubscriptions: StoredSubscription[] = [];

export async function getSubscriptions(): Promise<StoredSubscription[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'push_subscriptions' }
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      memorySubscriptions = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Falha ao ler subscriptions do banco, usando memória:', err);
  }
  return memorySubscriptions;
}

export async function saveSubscription(sub: webpush.PushSubscription, userAgent?: string): Promise<boolean> {
  try {
    const list = await getSubscriptions();
    const endpoint = sub.endpoint;
    const filtered = list.filter((s) => s.subscription.endpoint !== endpoint);
    filtered.push({
      id: Date.now().toString(),
      subscription: sub,
      userAgent: userAgent || 'iPhone / Dispositivo',
      createdAt: new Date().toISOString()
    });

    memorySubscriptions = filtered;

    try {
      await prisma.siteSetting.upsert({
        where: { key: 'push_subscriptions' },
        create: { key: 'push_subscriptions', value: JSON.stringify(filtered) },
        update: { value: JSON.stringify(filtered) }
      });
    } catch (dbErr) {
      console.warn('Erro ao salvar subscription no banco (persistindo em memória):', dbErr);
    }
    return true;
  } catch (err) {
    console.error('Erro ao salvar subscription:', err);
    return false;
  }
}

export async function removeSubscription(endpoint: string): Promise<void> {
  try {
    const list = await getSubscriptions();
    const filtered = list.filter((s) => s.subscription.endpoint !== endpoint);
    memorySubscriptions = filtered;
    try {
      await prisma.siteSetting.upsert({
        where: { key: 'push_subscriptions' },
        create: { key: 'push_subscriptions', value: JSON.stringify(filtered) },
        update: { value: JSON.stringify(filtered) }
      });
    } catch (e) {}
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
  const subscriptions = await getSubscriptions();
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
          await removeSubscription(item.subscription.endpoint);
        }
        throw err;
      }
    })
  );

  const totalSent = results.filter((r) => r.status === 'fulfilled').length;
  return { success: totalSent > 0, totalSent, totalSubscribers: subscriptions.length };
}
