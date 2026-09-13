import { NextResponse } from 'next/server';
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
