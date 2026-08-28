import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        category,
        description,
        details,
        availableSizes: typeof availableSizes === 'string' ? availableSizes : JSON.stringify(availableSizes || []),
        availableColors: typeof availableColors === 'string' ? availableColors : JSON.stringify(availableColors || []),
        customizationPositions: typeof customizationPositions === 'string' ? customizationPositions : JSON.stringify(customizationPositions || []),
        printTechniques: printTechniques !== undefined ? printTechniques : undefined,
        leadTime: leadTime !== undefined ? leadTime : undefined,
        minQuantity: minQuantity !== undefined ? minQuantity : undefined,
        priceRange,
        basePrice: basePrice !== undefined ? Number(basePrice) || 0 : undefined,
        pricingTiers: pricingTiers !== undefined ? (typeof pricingTiers === 'string' ? pricingTiers : JSON.stringify(pricingTiers || [])) : undefined,
        active,
        featured,
      },
    });

    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          await prisma.productImage.create({
            data: {
              productId: id,
              imageUrl: images[i],
              position: i,
            },
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
