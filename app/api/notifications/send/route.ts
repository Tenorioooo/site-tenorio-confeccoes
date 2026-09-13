import { NextRequest, NextResponse } from 'next/server';
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
