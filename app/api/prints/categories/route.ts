import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_CATEGORIES = [
  'Verão & Praia',
  'Festas & Baladas',
  'Esportes & Times',
  'Minimalista & Urbano',
  'Formaturas & Escolas',
  'Corporativo & Empresas',
  'Igrejas & Retiros',
  'Abadás & Carnaval',
];

async function getStoredCategories(): Promise<string[]> {
  try {
    const categoriesInDb = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    if (categoriesInDb.length > 0) {
      return categoriesInDb.map((c) => c.name);
    }
  } catch {}

  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'print_categories' },
  });

  if (setting && setting.value) {
    try {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {}
  }

  return DEFAULT_CATEGORIES;
}

export async function GET() {
  try {
    const categories = await getStoredCategories();

    // Count prints in each category from Category relation
    const categoriesWithCount = await prisma.category.findMany({
      include: {
        _count: {
          select: { prints: true },
        },
      },
    });

    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat] = 0;
    });

    categoriesWithCount.forEach((c) => {
      counts[c.name] = c._count.prints;
    });

    const totalPrints = await prisma.print.count();

    return NextResponse.json({
      categories,
      counts,
      totalPrints,
    });
  } catch (error: any) {
    console.error('Error fetching print categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body.name || '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Nome da categoria é obrigatório.' }, { status: 400 });
    }

    const categories = await getStoredCategories();

    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: 'Esta categoria já existe.' }, { status: 400 });
    }

    const updatedList = [...categories, name];

    await prisma.siteSetting.upsert({
      where: { key: 'print_categories' },
      update: { value: JSON.stringify(updatedList) },
      create: { key: 'print_categories', value: JSON.stringify(updatedList) },
    });

    return NextResponse.json({ success: true, categories: updatedList }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating print category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, oldName, newName, categories: newOrderedList } = body;

    let categories = await getStoredCategories();

    if (action === 'rename') {
      const trimmedOld = (oldName || '').trim();
      const trimmedNew = (newName || '').trim();

      if (!trimmedOld || !trimmedNew) {
        return NextResponse.json({ error: 'Nome antigo e novo são obrigatórios.' }, { status: 400 });
      }

      if (trimmedOld.toLowerCase() !== trimmedNew.toLowerCase()) {
        if (categories.some((c) => c.toLowerCase() === trimmedNew.toLowerCase())) {
          return NextResponse.json({ error: 'Já existe uma categoria com este nome.' }, { status: 400 });
        }
      }

      categories = categories.map((c) => (c === trimmedOld ? trimmedNew : c));

      // Update the Category record in the database (uses the Category model, not Print.category which no longer exists)
      try {
        await prisma.category.updateMany({
          where: { name: trimmedOld },
          data: { name: trimmedNew },
        });
      } catch {
        // Category may only exist in settings, not in DB — safe to ignore
      }

      await prisma.siteSetting.upsert({
        where: { key: 'print_categories' },
        update: { value: JSON.stringify(categories) },
        create: { key: 'print_categories', value: JSON.stringify(categories) },
      });

      return NextResponse.json({ success: true, categories });
    }

    if (action === 'reorder' && Array.isArray(newOrderedList)) {
      await prisma.siteSetting.upsert({
        where: { key: 'print_categories' },
        update: { value: JSON.stringify(newOrderedList) },
        create: { key: 'print_categories', value: JSON.stringify(newOrderedList) },
      });
      return NextResponse.json({ success: true, categories: newOrderedList });
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating print categories:', error);
    return NextResponse.json({ error: 'Failed to update categories' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryToDelete = searchParams.get('category');

    if (!categoryToDelete) {
      return NextResponse.json({ error: 'Categoria não especificada.' }, { status: 400 });
    }

    const categories = await getStoredCategories();
    const updatedList = categories.filter((c) => c !== categoryToDelete);

    await prisma.siteSetting.upsert({
      where: { key: 'print_categories' },
      update: { value: JSON.stringify(updatedList) },
      create: { key: 'print_categories', value: JSON.stringify(updatedList) },
    });

    return NextResponse.json({ success: true, categories: updatedList });
  } catch (error: any) {
    console.error('Error deleting print category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
