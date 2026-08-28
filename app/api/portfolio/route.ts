import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

const DEFAULT_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: '1',
    title: 'Camisetas Algodão Penteado - Evento Tech 2025',
    category: 'Camisetas',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Abadás Sublimados - Bloco da Alegria',
    category: 'Abadás',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'Uniformes Polos - Equipe Comercial',
    category: 'Empresas',
    image: 'https://images.unsplash.com/photo-1625910513413-433a010d29a5?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    title: 'Moletons Flanelados - Turma de Medicina',
    category: 'Moletons',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '5',
    title: 'Canecas Porcelana AAA - Brinde Corporativo',
    category: 'Canecas',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '6',
    title: 'Wind Banner Publicitário - Posto & Conveniência',
    category: 'Bandeiras',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
  },
];

async function getStoredPortfolio(): Promise<PortfolioItem[]> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'portfolio_items' },
  });

  if (setting && setting.value) {
    try {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {}
  }

  // Seed default if not yet created
  await prisma.siteSetting.upsert({
    where: { key: 'portfolio_items' },
    update: { value: JSON.stringify(DEFAULT_PORTFOLIO_ITEMS) },
    create: { key: 'portfolio_items', value: JSON.stringify(DEFAULT_PORTFOLIO_ITEMS) },
  });

  return DEFAULT_PORTFOLIO_ITEMS;
}

export async function GET() {
  try {
    const items = await getStoredPortfolio();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, image } = body;

    if (!title || !category || !image) {
      return NextResponse.json(
        { error: 'Título, categoria e imagem são obrigatórios.' },
        { status: 400 }
      );
    }

    const items = await getStoredPortfolio();
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: title.trim(),
      category: category.trim(),
      image: image.trim(),
    };

    const updated = [newItem, ...items];

    await prisma.siteSetting.upsert({
      where: { key: 'portfolio_items' },
      update: { value: JSON.stringify(updated) },
      create: { key: 'portfolio_items', value: JSON.stringify(updated) },
    });

    return NextResponse.json({ success: true, item: newItem, items: updated }, { status: 201 });
  } catch (error) {
    console.error('Error adding portfolio item:', error);
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Reorder or batch save
    if (body.items && Array.isArray(body.items)) {
      await prisma.siteSetting.upsert({
        where: { key: 'portfolio_items' },
        update: { value: JSON.stringify(body.items) },
        create: { key: 'portfolio_items', value: JSON.stringify(body.items) },
      });
      return NextResponse.json({ success: true, items: body.items });
    }

    // Single item edit
    const { id, title, category, image } = body;
    if (!id || !title || !category || !image) {
      return NextResponse.json({ error: 'Dados incompletos para atualização.' }, { status: 400 });
    }

    const items = await getStoredPortfolio();
    const index = items.findIndex((i) => i.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Item de portfólio não encontrado.' }, { status: 404 });
    }

    items[index] = { id, title: title.trim(), category: category.trim(), image: image.trim() };

    await prisma.siteSetting.upsert({
      where: { key: 'portfolio_items' },
      update: { value: JSON.stringify(items) },
      create: { key: 'portfolio_items', value: JSON.stringify(items) },
    });

    return NextResponse.json({ success: true, item: items[index], items });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido.' }, { status: 400 });
    }

    const items = await getStoredPortfolio();
    const filtered = items.filter((i) => i.id !== id);

    await prisma.siteSetting.upsert({
      where: { key: 'portfolio_items' },
      update: { value: JSON.stringify(filtered) },
      create: { key: 'portfolio_items', value: JSON.stringify(filtered) },
    });

    return NextResponse.json({ success: true, items: filtered });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
