import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription, getSubscriptions, removeSubscription } from '@/lib/push-notifications';

export async function GET() {
  const subs = await getSubscriptions();
  return NextResponse.json({ count: subs.length, subscriptions: subs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription } = body;
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Subscription inválida' }, { status: 400 });
    }
    const userAgent = req.headers.get('user-agent') || 'iPhone / Dispositivo';
    await saveSubscription(subscription, userAgent);
    const subs = await getSubscriptions();
    return NextResponse.json({
      success: true,
      message: 'Dispositivo cadastrado com sucesso!',
      totalSubscribers: subs.length
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.endpoint) {
      await removeSubscription(body.endpoint);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
