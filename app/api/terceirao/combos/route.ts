import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_COMBOS, getTerceiraoCombos, ComboData } from '@/lib/terceiraoData';

export async function GET() {
  try {
    const combos = await getTerceiraoCombos();
    return NextResponse.json(combos);
  } catch (error: any) {
    console.error('Erro ao buscar combos do Terceirão:', error);
    return NextResponse.json({ error: 'Erro ao buscar combos' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'O payload de combos deve ser um array.' },
        { status: 400 }
      );
    }

    const combosJson = JSON.stringify(body);

    await prisma.siteSetting.upsert({
      where: { key: 'terceirao_combos' },
      update: { value: combosJson },
      create: { key: 'terceirao_combos', value: combosJson },
    });

    return NextResponse.json({ success: true, count: body.length });
  } catch (error: any) {
    console.error('Erro ao atualizar combos do Terceirão:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar combos: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Se ação for reset para o padrão
    if (body?.action === 'reset') {
      await prisma.siteSetting.upsert({
        where: { key: 'terceirao_combos' },
        update: { value: JSON.stringify(DEFAULT_COMBOS) },
        create: { key: 'terceirao_combos', value: JSON.stringify(DEFAULT_COMBOS) },
      });
      return NextResponse.json({ success: true, combos: DEFAULT_COMBOS });
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro na ação de combos:', error);
    return NextResponse.json(
      { error: 'Erro ao processar ação: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
