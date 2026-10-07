import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const BOT_URL = process.env.CHATBOT_API_URL || process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://127.0.0.1:3001';

export async function GET() {
  // 1. Tenta carregar direto da API do robô
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${BOT_URL}/api/tabela`, {
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {}

  // 2. Fallback: lê direto do arquivo local tabelaPrecos.json
  try {
    const caminho = path.join(process.cwd(), 'bot', 'tabelaPrecos.json');
    if (fs.existsSync(caminho)) {
      const conteudo = fs.readFileSync(caminho, 'utf-8');
      const tabela = JSON.parse(conteudo);
      return NextResponse.json({ success: true, tabela });
    }
  } catch (e) {}

  return NextResponse.json({ success: true, tabela: { produtos: [] } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Tenta salvar no robô se estiver online
    try {
      await fetch(`${BOT_URL}/api/tabela`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {}

    // 2. Salva no arquivo local
    try {
      const caminho = path.join(process.cwd(), 'bot', 'tabelaPrecos.json');
      fs.writeFileSync(caminho, JSON.stringify(body, null, 2), 'utf-8');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Tabela de preços salva com sucesso!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
