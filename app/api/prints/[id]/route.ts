import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const print = await prisma.print.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!print) {
      return NextResponse.json({ error: 'Print not found' }, { status: 404 });
    }

    return NextResponse.json(print);
  } catch (error: any) {
    console.error('Error fetching print:', error);
    return NextResponse.json({ error: 'Failed to fetch print' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code, name, tags, imageUrl, active, featured, categories } = body;

    const updated = await prisma.print.update({
      where: { id },
      data: {
        code,
        name,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        imageUrl,
        active,
        featured,
      },
    });

    if (Array.isArray(categories)) {
      // Delete existing relations
      await prisma.printCategory.deleteMany({
        where: { printId: id },
      });

      // Add new relations
      for (const catName of categories) {
        if (!catName || typeof catName !== 'string') continue;
        const trimmed = catName.trim();
        if (!trimmed) continue;

        const cat = await prisma.category.upsert({
          where: { name: trimmed },
          update: {},
          create: { name: trimmed },
        });

        await prisma.printCategory.upsert({
          where: {
            printId_categoryId: {
              printId: id,
              categoryId: cat.id,
            },
          },
          update: {},
          create: {
            printId: id,
            categoryId: cat.id,
          },
        });
      }
    }

    const result = await prisma.print.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating print:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update print' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.print.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting print:', error);
    return NextResponse.json({ error: 'Failed to delete print' }, { status: 500 });
  }
}
