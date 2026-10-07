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

    const quoteCode = (body.quoteCode && typeof body.quoteCode === 'string' && body.quoteCode.trim().length > 0)
      ? body.quoteCode.trim()
      : generateQuoteCode();

    // Verifica se já existe um orçamento com esse código
    const existing = await prisma.quote.findUnique({
      where: { quoteCode },
      include: { items: true },
    });

    let createdQuote;
    if (existing) {
      createdQuote = await prisma.quote.update({
        where: { id: existing.id },
        data: {
          customerName: customerName || existing.customerName,
          whatsapp: whatsapp || existing.whatsapp,
          email: email !== undefined ? (email || null) : existing.email,
          city: city !== undefined ? (city || null) : existing.city,
          state: state !== undefined ? (state || null) : existing.state,
          desiredDate: desiredDate !== undefined ? (desiredDate || null) : existing.desiredDate,
          notes: notes !== undefined ? (notes || null) : existing.notes,
          estimatedTotal: estimatedTotal ? Number(estimatedTotal) : existing.estimatedTotal,
        },
      });

      // Se o orçamento existente não tinha itens salvos e agora tem itens, cria-os
      if (existing.items.length === 0 && items.length > 0) {
        for (const item of items) {
          const createdItem = await prisma.quoteItem.create({
            data: {
              quoteId: createdQuote.id,
              productId: item.productId || null,
              productName: item.productName || 'Produto Personalizado',
              printId: item.printId || null,
              printCode: item.printCode || null,
              printName: item.printName || null,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
              totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
              customizationPositions: typeof item.customizationPositions === 'string'
                ? item.customizationPositions
                : JSON.stringify(item.customizationPositions || ['Frente']),
              hasCustomArt: Boolean(item.hasCustomArt),
              notes: item.notes || null,
            },
          });

          if (item.sizes && typeof item.sizes === 'object') {
            const sizeEntries = Object.entries(item.sizes).filter(([, q]) => Number(q) > 0);
            if (sizeEntries.length > 0) {
              await prisma.quoteSize.createMany({
                data: sizeEntries.map(([size, quantity]) => ({
                  quoteItemId: createdItem.id,
                  size,
                  quantity: Number(quantity),
                })),
              });
            }
          }
        }
      }
    } else {
      createdQuote = await prisma.quote.create({
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
            productName: item.productName || 'Produto Personalizado',
            printId: item.printId || null,
            printCode: item.printCode || null,
            printName: item.printName || null,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
            totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
            customizationPositions: typeof item.customizationPositions === 'string'
              ? item.customizationPositions
              : JSON.stringify(item.customizationPositions || ['Frente']),
            hasCustomArt: Boolean(item.hasCustomArt),
            notes: item.notes || null,
          },
        });

        if (item.sizes && typeof item.sizes === 'object') {
          const sizeEntries = Object.entries(item.sizes).filter(([, q]) => Number(q) > 0);
          if (sizeEntries.length > 0) {
            await prisma.quoteSize.createMany({
              data: sizeEntries.map(([size, quantity]) => ({
                quoteItemId: createdItem.id,
                size,
                quantity: Number(quantity),
              })),
            });
          }
        }
      }
    }

    // Coletar arquivos do root e dos itens (customArtFiles)
    const filesToSave: Array<{ url: string; name?: string; mimeType?: string; size?: number }> = [];
    const seenUrls = new Set<string>();

    if (Array.isArray(files)) {
      for (const f of files) {
        const url = f.url || f.fileUrl;
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          filesToSave.push({
            url,
            name: f.name || f.originalName || 'arte_cliente',
            mimeType: f.mimeType || 'image/jpeg',
            size: f.size || 0,
          });
        }
      }
    }

    for (const item of items) {
      if (Array.isArray(item.customArtFiles)) {
        for (const f of item.customArtFiles) {
          const url = f.url || f.fileUrl;
          if (url && !seenUrls.has(url)) {
            seenUrls.add(url);
            filesToSave.push({
              url,
              name: f.name || f.originalName || 'arte_cliente',
              mimeType: f.mimeType || 'image/jpeg',
              size: f.size || 0,
            });
          }
        }
      }
    }

    for (const f of filesToSave) {
      await prisma.uploadedFile.create({
        data: {
          quoteId: createdQuote.id,
          fileUrl: f.url,
          originalName: f.name || 'arte_cliente',
          mimeType: f.mimeType || 'image/jpeg',
          size: f.size || 0,
        },
      });
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
