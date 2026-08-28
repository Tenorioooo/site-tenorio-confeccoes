import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(testimonials);
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, city, text, rating, image, active } = body;

    if (!name?.trim() || !text?.trim()) {
      return NextResponse.json({ error: 'Nome e depoimento sao obrigatorios.' }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: name.trim(),
        city: (city || '').trim(),
        text: text.trim(),
        rating: typeof rating === 'number' ? Math.min(5, Math.max(1, rating)) : 5,
        image: image || null,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
