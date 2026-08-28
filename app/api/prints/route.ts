import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const where: any = {};
    if (category && category !== 'Todos') {
      // Filter prints that have at least one category matching the query
      where.categories = { some: { category: { name: category } } };
    }
    if (featured === 'true') {
      where.featured = true;
    }
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { categories: { some: { category: { name: { contains: search } } } } },
        { tags: { contains: search } },
      ];
    }

    const prints = await prisma.print.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(prints);
  } catch (error: any) {
    console.error('Error fetching prints:', error);
    return NextResponse.json({ error: 'Failed to fetch prints' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, tags, imageUrl, active, featured, categories } = body;

    const newPrint = await prisma.print.create({
      data: {
        code,
        name,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        imageUrl,
        active: active !== undefined ? active : true,
        featured: featured !== undefined ? featured : false,
      },
    });

    if (Array.isArray(categories) && categories.length > 0) {
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
              printId: newPrint.id,
              categoryId: cat.id,
            },
          },
          update: {},
          create: {
            printId: newPrint.id,
            categoryId: cat.id,
          },
        });
      }
    }

    const result = await prisma.print.findUnique({
      where: { id: newPrint.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating print:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create print' }, { status: 500 });
  }
}
