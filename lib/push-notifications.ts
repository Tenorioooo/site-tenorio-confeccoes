import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

export const VAPID_PUBLIC_KEY = 'BFtl7Ov362iDtyoRhavICgBjLhkMa5k0dCyCDFZjIPKHP2brYM9nrYtmGnMD7fvJ7E-wjjS_E5bhfPFgFEY-5BU';
export const VAPID_PRIVATE_KEY = 'ltMdkhqlJ9Abh9rpDsdUyzXXEImAG4CvkIL3vJ1swkU';
export const VAPID_SUBJECT = 'mailto:contato@tenorioconfeccoes.shop';

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
