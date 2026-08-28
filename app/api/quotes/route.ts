import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateQuoteCode } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'Todos') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { quoteCode: { contains: search } },
        { customerName: { contains: search } },
        { whatsapp: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        items: {
          include: {
            sizes: true,
          },
        },
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(quotes);
  } catch (error: any) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, whatsapp, email, city, state, desiredDate, notes, items, files, estimatedTotal } = body;

    if (!customerName || !whatsapp || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Nome, WhatsApp e ao menos um produto são obrigatórios.' },
        { status: 400 }
      );
    }

    const quoteCode = generateQuoteCode();

    const createdQuote = await prisma.quote.create({
      data: {
        quoteCode,
        customerName,
        whatsapp,
        email: email || null,
        city: city || null,
        state: state || null,
        desiredDate: desiredDate || null,
        notes: notes || null,
        estimatedTotal: estimatedTotal ? Number(estimatedTotal) : null,
        status: 'Recebido',
      },
    });

    for (const item of items) {
      const createdItem = await prisma.quoteItem.create({
        data: {
          quoteId: createdQuote.id,
          productId: item.productId || null,
          productName: item.productName,
          printId: item.printId || null,
          printCode: item.printCode || null,
          printName: item.printName || null,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
          totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
          customizationPositions: JSON.stringify(item.customizationPositions || ['Frente']),
          hasCustomArt: Boolean(item.hasCustomArt),
          notes: item.notes || null,
        },
      });

      if (item.sizes && typeof item.sizes === 'object') {
        const sizeEntries = Object.entries(item.sizes).filter(([, q]) => (q as number) > 0);
        if (sizeEntries.length > 0) {
          await prisma.quoteSize.createMany({
            data: sizeEntries.map(([size, quantity]) => ({
              quoteItemId: createdItem.id,
              size,
              quantity: quantity as number,
            })),
          });
        }
      }
    }

    if (Array.isArray(files) && files.length > 0) {
      for (const f of files) {
        await prisma.uploadedFile.create({
          data: {
            quoteId: createdQuote.id,
            fileUrl: f.url || f.fileUrl,
            originalName: f.name || f.originalName || 'arte_cliente',
            mimeType: f.mimeType || 'application/octet-stream',
            size: f.size || 0,
          },
        });
      }
    }

    const fullQuote = await prisma.quote.findUnique({
      where: { id: createdQuote.id },
      include: {
        items: {
          include: {
            sizes: true,
          },
        },
        files: true,
      },
    });

    return NextResponse.json(fullQuote, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}
