import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
){
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, city, text, rating, image, active } = body;

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        name: name?.trim(),
        city: (city || '').trim(),
        text: text?.trim(),
        rating: typeof rating === 'number' ? Math.min(5, Math.max(1, rating)) : 5,
        image: image !== undefined ? (image || null) : undefined,
        active: active !== undefined ? active : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
){
  try {
    const { id } = await params;
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}