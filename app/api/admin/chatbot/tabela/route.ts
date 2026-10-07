import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const BOT_URL = process.env.CHATBOT_API_URL || process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://127.0.0.1:3001';

export async function GET() {
  // 1. Tenta carregar do banco de dados (persistência na nuvem)
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'chatbot_tabela_precos' }
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      if (parsed && Array.isArray(parsed.produtos) && parsed.produtos.length > 0) {
        return NextResponse.json({ success: true, tabela: parsed });
      }
    }
  } catch (e) {}

  // 2. Tenta carregar direto da API do robô local se estiver rodando
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
      if (data?.tabela && Array.isArray(data.tabela.produtos) && data.tabela.produtos.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch (e) {}

  // 3. Fallback: lê direto do arquivo local tabelaPrecos.json
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
    let tabelaCompleta = body;

    // Se o corpo tiver o formato { tabela: ... }
    if (body.tabela) {
      tabelaCompleta = body.tabela;
    }

    // 1. Salva no banco de dados para persistência total na nuvem
    try {
      await prisma.siteSetting.upsert({
        where: { key: 'chatbot_tabela_precos' },
        update: { value: JSON.stringify(tabelaCompleta) },
        create: { key: 'chatbot_tabela_precos', value: JSON.stringify(tabelaCompleta) }
      });
    } catch (e) {
      console.error('Erro ao salvar tabelaPrecos no banco:', e);
    }

    // 2. Tenta salvar no robô se estiver online
    try {
      await fetch(`${BOT_URL}/api/tabela`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tabelaCompleta)
      }).catch(() => {});
    } catch (e) {}

    // 3. Salva no arquivo local (se estiver em ambiente com disco gravável)
    try {
      const caminho = path.join(process.cwd(), 'bot', 'tabelaPrecos.json');
      fs.writeFileSync(caminho, JSON.stringify(tabelaCompleta, null, 2), 'utf-8');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Tabela de preços salva com sucesso!', tabela: tabelaCompleta });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
