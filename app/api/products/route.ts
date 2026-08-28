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
      where.category = category;
    }
    if (featured === 'true') {
      where.featured = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      category, 
      description, 
      details, 
      availableSizes, 
      availableColors, 
      customizationPositions,
      printTechniques,
      leadTime,
      minQuantity,
      priceRange, 
      basePrice,
      pricingTiers,
      active, 
      featured, 
      images 
    } = body;

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: `${slug}-${Date.now()}`,
        category,
        description,
        details: details || null,
        availableSizes: typeof availableSizes === 'string' ? availableSizes : JSON.stringify(availableSizes || []),
        availableColors: typeof availableColors === 'string' ? availableColors : JSON.stringify(availableColors || []),
        customizationPositions: typeof customizationPositions === 'string' ? customizationPositions : JSON.stringify(customizationPositions || []),
        printTechniques: printTechniques || 'Silk Screen, Sublimação, DTF HD, Bordado',
        leadTime: leadTime || '7 a 15 dias úteis',
        minQuantity: minQuantity || '10 unidades',
        priceRange: priceRange || 'Consulte o valor por quantidade',
        basePrice: basePrice !== undefined ? Number(basePrice) || 0 : 0,
        pricingTiers: typeof pricingTiers === 'string' ? pricingTiers : JSON.stringify(pricingTiers || []),
        active: active !== undefined ? active : true,
        featured: featured !== undefined ? featured : false,
      },
    });

    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: newProduct.id,
            imageUrl: images[i],
            position: i,
          },
        });
      }
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
