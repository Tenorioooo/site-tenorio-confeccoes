import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import localData from '@/lib/local_db_backup.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 0. Auto-Create PostgreSQL Tables if they don't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "details" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "availableSizes" TEXT NOT NULL DEFAULT '["PP","P","M","G","GG","XGG"]',
        "availableColors" TEXT NOT NULL DEFAULT '["Branco","Preto","Azul Marinho","Cinza","Vermelho","Amarelo"]',
        "customizationPositions" TEXT DEFAULT '["Frente","Costas","Manga Direita","Manga Esquerda","Nome Individual","Número Individual","Outro Local"]',
        "printTechniques" TEXT DEFAULT 'Silk Screen, Sublimação, DTF HD, Bordado',
        "leadTime" TEXT DEFAULT '7 a 15 dias úteis',
        "minQuantity" TEXT DEFAULT '10 unidades',
        "priceRange" TEXT DEFAULT 'Consulte valor por quantidade',
        "basePrice" DOUBLE PRECISION DEFAULT 0,
        "pricingTiers" TEXT DEFAULT '[]',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "ProductImage" (
        "id" TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "position" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Print" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "tags" TEXT NOT NULL DEFAULT '[]',
        "imageUrl" TEXT NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "PrintCategory" (
        "printId" TEXT NOT NULL,
        "categoryId" TEXT NOT NULL,
        PRIMARY KEY ("printId", "categoryId"),
        CONSTRAINT "PrintCategory_printId_fkey" FOREIGN KEY ("printId") REFERENCES "Print"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PrintCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Quote" (
        "id" TEXT PRIMARY KEY,
        "quoteCode" TEXT UNIQUE NOT NULL,
        "customerName" TEXT NOT NULL,
        "whatsapp" TEXT NOT NULL,
        "email" TEXT,
        "city" TEXT,
        "state" TEXT,
        "desiredDate" TEXT,
        "notes" TEXT,
        "estimatedTotal" DOUBLE PRECISION DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'Recebido',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "QuoteItem" (
        "id" TEXT PRIMARY KEY,
        "quoteId" TEXT NOT NULL,
        "productId" TEXT,
        "productName" TEXT NOT NULL,
        "printId" TEXT,
        "printCode" TEXT,
        "printName" TEXT,
        "quantity" INTEGER NOT NULL,
        "unitPrice" DOUBLE PRECISION DEFAULT 0,
        "totalPrice" DOUBLE PRECISION DEFAULT 0,
        "customizationPositions" TEXT NOT NULL DEFAULT '["Frente"]',
        "hasCustomArt" BOOLEAN NOT NULL DEFAULT false,
        "notes" TEXT,
        CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "QuoteItem_printId_fkey" FOREIGN KEY ("printId") REFERENCES "Print"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "QuoteSize" (
        "id" TEXT PRIMARY KEY,
        "quoteItemId" TEXT NOT NULL,
        "size" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        CONSTRAINT "QuoteSize_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "QuoteItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "UploadedFile" (
        "id" TEXT PRIMARY KEY,
        "quoteId" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "originalName" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UploadedFile_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Testimonial" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "image" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "SiteSetting" (
        "key" TEXT PRIMARY KEY,
        "value" TEXT NOT NULL
      );
    `);

    // 1. Users
    for (const u of localData.User || []) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          password: u.password,
          role: u.role,
        },
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
        },
      });
    }

    // 2. SiteSettings
    for (const s of localData.SiteSetting || []) {
      await prisma.siteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value },
      });
    }

    // 3. Categories
    for (const c of localData.Category || []) {
      await prisma.category.upsert({
        where: { id: c.id },
        update: { name: c.name },
        create: { id: c.id, name: c.name },
      });
    }

    // 4. Products & Images
    for (const p of localData.Product || []) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          slug: p.slug,
          category: p.category,
          description: p.description,
          details: p.details,
          active: Boolean(p.active),
          featured: Boolean(p.featured),
          availableSizes: p.availableSizes,
          availableColors: p.availableColors,
          customizationPositions: p.customizationPositions,
          printTechniques: p.printTechniques,
          leadTime: p.leadTime,
          minQuantity: p.minQuantity,
          priceRange: p.priceRange,
          basePrice: p.basePrice,
          pricingTiers: p.pricingTiers,
        },
        create: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category,
          description: p.description,
          details: p.details,
          active: Boolean(p.active),
          featured: Boolean(p.featured),
          availableSizes: p.availableSizes,
          availableColors: p.availableColors,
          customizationPositions: p.customizationPositions,
          printTechniques: p.printTechniques,
          leadTime: p.leadTime,
          minQuantity: p.minQuantity,
          priceRange: p.priceRange,
          basePrice: p.basePrice,
          pricingTiers: p.pricingTiers,
        },
      });
    }

    for (const img of localData.ProductImage || []) {
      await prisma.productImage.upsert({
        where: { id: img.id },
        update: {
          productId: img.productId,
          imageUrl: img.imageUrl,
          position: img.position,
        },
        create: {
          id: img.id,
          productId: img.productId,
          imageUrl: img.imageUrl,
          position: img.position,
        },
      });
    }

    // 5. Prints & PrintCategories
    for (const pr of localData.Print || []) {
      await prisma.print.upsert({
        where: { id: pr.id },
        update: {
          code: pr.code,
          name: pr.name,
          tags: pr.tags,
          imageUrl: pr.imageUrl,
          active: Boolean(pr.active),
          featured: Boolean(pr.featured),
        },
        create: {
          id: pr.id,
          code: pr.code,
          name: pr.name,
          tags: pr.tags,
          imageUrl: pr.imageUrl,
          active: Boolean(pr.active),
          featured: Boolean(pr.featured),
        },
      });
    }

    for (const pc of localData.PrintCategory || []) {
      await prisma.printCategory.upsert({
        where: {
          printId_categoryId: {
            printId: pc.printId,
            categoryId: pc.categoryId,
          },
        },
        update: {},
        create: {
          printId: pc.printId,
          categoryId: pc.categoryId,
        },
      });
    }

    // 6. Testimonials
    for (const t of localData.Testimonial || []) {
      await prisma.testimonial.upsert({
        where: { id: t.id },
        update: {
          name: t.name,
          city: t.city,
          text: t.text,
          rating: t.rating,
          image: t.image,
          active: Boolean(t.active),
        },
        create: {
          id: t.id,
          name: t.name,
          city: t.city,
          text: t.text,
          rating: t.rating,
          image: t.image,
          active: Boolean(t.active),
        },
      });
    }

    // 7. Quotes & Items
    for (const q of localData.Quote || []) {
      await prisma.quote.upsert({
        where: { id: q.id },
        update: {
          quoteCode: q.quoteCode,
          customerName: q.customerName,
          whatsapp: q.whatsapp,
          email: q.email,
          city: q.city,
          state: q.state,
          desiredDate: q.desiredDate,
          notes: q.notes,
          estimatedTotal: q.estimatedTotal,
          status: q.status,
        },
        create: {
          id: q.id,
          quoteCode: q.quoteCode,
          customerName: q.customerName,
          whatsapp: q.whatsapp,
          email: q.email,
          city: q.city,
          state: q.state,
          desiredDate: q.desiredDate,
          notes: q.notes,
          estimatedTotal: q.estimatedTotal,
          status: q.status,
        },
      });
    }

    for (const qi of localData.QuoteItem || []) {
      await prisma.quoteItem.upsert({
        where: { id: qi.id },
        update: {
          quoteId: qi.quoteId,
          productId: qi.productId,
          productName: qi.productName,
          printId: qi.printId,
          printCode: qi.printCode,
          printName: qi.printName,
          quantity: qi.quantity,
          unitPrice: qi.unitPrice,
          totalPrice: qi.totalPrice,
          customizationPositions: qi.customizationPositions,
          hasCustomArt: Boolean(qi.hasCustomArt),
          notes: qi.notes,
        },
        create: {
          id: qi.id,
          quoteId: qi.quoteId,
          productId: qi.productId,
          productName: qi.productName,
          printId: qi.printId,
          printCode: qi.printCode,
          printName: qi.printName,
          quantity: qi.quantity,
          unitPrice: qi.unitPrice,
          totalPrice: qi.totalPrice,
          customizationPositions: qi.customizationPositions,
          hasCustomArt: Boolean(qi.hasCustomArt),
          notes: qi.notes,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '100% dos dados originais do localhost foram migrados com sucesso para o PostgreSQL da nuvem!',
      counts: {
        products: (localData.Product || []).length,
        productImages: (localData.ProductImage || []).length,
        prints: (localData.Print || []).length,
        categories: (localData.Category || []).length,
        siteSettings: (localData.SiteSetting || []).length,
        testimonials: (localData.Testimonial || []).length,
        quotes: (localData.Quote || []).length,
      },
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Erro ao migrar dados: ' + error.message }, { status: 500 });
  }
}
