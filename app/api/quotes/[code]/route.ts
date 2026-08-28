import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = code.trim().toUpperCase();

    const quote = await prisma.quote.findFirst({
      where: {
        OR: [{ quoteCode: cleanCode }, { id: code }],
      },
      include: {
        items: {
          include: {
            sizes: true,
          },
        },
        files: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error: any) {
    console.error('Error fetching quote status:', error);
    return NextResponse.json({ error: 'Erro ao consultar orçamento.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { status, notes, estimatedTotal } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (estimatedTotal !== undefined) updateData.estimatedTotal = Number(estimatedTotal);

    const updated = await prisma.quote.update({
      where: { id: code },
      data: updateData,
      include: {
        items: {
          include: {
            sizes: true,
          },
        },
        files: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating quote status:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status do orçamento.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const {
      customerName,
      whatsapp,
      email,
      city,
      state,
      desiredDate,
      notes,
      status,
      estimatedTotal,
      items,
    } = body;

    if (!customerName || !whatsapp) {
      return NextResponse.json(
        { error: 'Nome e WhatsApp são obrigatórios.' },
        { status: 400 }
      );
    }

    // Update main quote info
    const updated = await prisma.quote.update({
      where: { id: code },
      data: {
        customerName,
        whatsapp,
        email: email || null,
        city: city || null,
        state: state || null,
        desiredDate: desiredDate || null,
        notes: notes || null,
        status: status || 'Recebido',
        estimatedTotal: estimatedTotal !== undefined && estimatedTotal !== null ? Number(estimatedTotal) : null,
      },
    });

    // If items are provided, replace them
    if (Array.isArray(items)) {
      // Delete existing items (cascade deletes sizes)
      await prisma.quoteItem.deleteMany({
        where: { quoteId: code },
      });

      // Re-create updated items
      for (const item of items) {
        const createdItem = await prisma.quoteItem.create({
          data: {
            quoteId: code,
            productId: item.productId || null,
            productName: item.productName || 'Produto Personalizado',
            printId: item.printId || null,
            printCode: item.printCode || null,
            printName: item.printName || null,
            quantity: Number(item.quantity) || 1,
            unitPrice: item.unitPrice !== undefined ? Number(item.unitPrice) : null,
            totalPrice: item.totalPrice !== undefined ? Number(item.totalPrice) : null,
            customizationPositions: JSON.stringify(item.customizationPositions || ['Frente']),
            hasCustomArt: Boolean(item.hasCustomArt),
            notes: item.notes || null,
          },
        });

        if (item.sizes && typeof item.sizes === 'object') {
          const sizeEntries = Array.isArray(item.sizes)
            ? item.sizes
            : Object.entries(item.sizes).map(([s, q]) => ({ size: s, quantity: Number(q) }));

          const validSizes = sizeEntries.filter((s: any) => Number(s.quantity) > 0);
          if (validSizes.length > 0) {
            await prisma.quoteSize.createMany({
              data: validSizes.map((s: any) => ({
                quoteItemId: createdItem.id,
                size: s.size,
                quantity: Number(s.quantity),
              })),
            });
          }
        }
      }
    }

    const fullUpdated = await prisma.quote.findUnique({
      where: { id: code },
      include: {
        items: {
          include: {
            sizes: true,
          },
        },
        files: true,
      },
    });

    return NextResponse.json(fullUpdated);
  } catch (error: any) {
    console.error('Error updating full quote:', error);
    return NextResponse.json({ error: 'Erro ao salvar alterações do orçamento.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    await prisma.quote.delete({
      where: { id: code },
    });

    return NextResponse.json({ success: true, message: 'Orçamento excluído com sucesso.' });
  } catch (error: any) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: 'Erro ao excluir orçamento.' }, { status: 500 });
  }
}
