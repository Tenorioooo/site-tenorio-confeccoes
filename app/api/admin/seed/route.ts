import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

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

    // 1. Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@tenorioconfeccoes.com.br' },
      update: {
        password: hashedPassword,
      },
      create: {
        name: 'Administrador Tenório',
        email: 'admin@tenorioconfeccoes.com.br',
        password: hashedPassword,
        role: 'admin',
      },
    });

    // 2. Site Settings
    const settings = [
      { key: 'company_name', value: 'Tenório Confecções' },
      { key: 'whatsapp_number', value: '5581999999999' },
      { key: 'email', value: 'contato@tenorioconfeccoes.com.br' },
      { key: 'instagram', value: '@tenorioconfeccoes' },
      { key: 'address', value: 'Caruaru - PE | Atendemos todo o Brasil' },
      { key: 'minimum_order', value: '10 peças' },
      { key: 'default_lead_time', value: '7 a 15 dias úteis' },
      { key: 'whatsapp_message_template', value: 'Olá! Gostaria de solicitar um orçamento na Tenório Confecções.' },
      { key: 'hero_headline', value: 'Personalizamos suas ideias. Produzimos seus momentos.' },
      { key: 'hero_subheadline', value: 'Camisetas, moletons, canecas, abadás, bandeiras e muito mais personalizados para empresas, eventos, equipes e ocasiões especiais.' },
    ];

    for (const s of settings) {
      await prisma.siteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: s,
      });
    }

    // 3. Products
    const products = [
      {
        name: 'Camiseta Personalizada 100% Algodão',
        slug: 'camiseta-personalizada-algodao',
        category: 'Camisetas',
        description: 'Camiseta em malha penteada 100% algodão fio 30.1. Toque macio, excelente caimento e altíssima durabilidade. Ideal para eventos, festas, formaturas e marcas próprias.',
        details: 'Gola careca reforçada, costura ombro a ombro. Disponível em Silk Screen, DTF HD e Bordado.',
        featured: true,
        basePrice: 35.0,
        pricingTiers: JSON.stringify([
          { minQty: 10, maxQty: 29, unitPrice: 35.0 },
          { minQty: 30, maxQty: 49, unitPrice: 30.0 },
          { minQty: 50, maxQty: 99, unitPrice: 26.0 },
          { minQty: 100, maxQty: null, unitPrice: 22.0 },
        ]),
        availableSizes: JSON.stringify(['PP', 'P', 'M', 'G', 'GG', 'XGG']),
        availableColors: JSON.stringify(['Branco', 'Preto', 'Azul Marinho', 'Cinza Mescla', 'Vermelho', 'Verde']),
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        ],
      },
      {
        name: 'Camiseta Dry Fit Esportiva / Equipes',
        slug: 'camiseta-dry-fit-esportiva',
        category: 'Camisetas',
        description: 'Tecido Dry Fit de alta tecnologia com proteção UV30+. Transpirável, leve e seca rapidamente. Perfeita para corridas, academias, times e torneios.',
        details: 'Sublimação total em alta definição sem limite de cores.',
        featured: true,
        basePrice: 32.0,
        pricingTiers: JSON.stringify([
          { minQty: 10, maxQty: 24, unitPrice: 32.0 },
          { minQty: 25, maxQty: 49, unitPrice: 28.0 },
          { minQty: 50, maxQty: 99, unitPrice: 24.0 },
          { minQty: 100, maxQty: null, unitPrice: 20.0 },
        ]),
        availableSizes: JSON.stringify(['P', 'M', 'G', 'GG', 'XGG']),
        availableColors: JSON.stringify(['Branco', 'Preto', 'Azul Boreal', 'Amarelo Neon', 'Verde']),
        images: [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        ],
      },
      {
        name: 'Moletom Canguru Personalizado com Capuz',
        slug: 'moletom-canguru-personalizado',
        category: 'Moletons',
        description: 'Moletom flanelado 3 cabos de alta gramatura. Quente, confortável e extremamente elegante para turmas, formandos, atléticas e uniformes de inverno.',
        details: 'Bolso frontal estilo canguru, capuz forrado e cordão ajustável.',
        featured: true,
        basePrice: 89.0,
        pricingTiers: JSON.stringify([
          { minQty: 10, maxQty: 24, unitPrice: 89.0 },
          { minQty: 25, maxQty: 49, unitPrice: 82.0 },
          { minQty: 50, maxQty: 99, unitPrice: 75.0 },
          { minQty: 100, maxQty: null, unitPrice: 68.0 },
        ]),
        availableSizes: JSON.stringify(['PP', 'P', 'M', 'G', 'GG', 'XGG']),
        availableColors: JSON.stringify(['Preto', 'Azul Marinho', 'Cinza Chumbo', 'Branco']),
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        ],
      },
      {
        name: 'Caneca de Alumínio Personalizada Tirante',
        slug: 'caneca-aluminio-personalizada',
        category: 'Canecas',
        description: 'Caneca de alumínio resistente com pintura eletrostática ou polida. Ideal para festas, atléticas, eventos universitários e blocos de carnaval.',
        details: 'Disponível em 300ml e 500ml com opção de tirante personalizado.',
        featured: true,
        basePrice: 28.46,
        pricingTiers: JSON.stringify({
          mode: 'by_variant',
          variantTiers: {
            '300ml': [
              { minQty: 1, maxQty: 10, unitPrice: 28.46 },
              { minQty: 11, maxQty: 29, unitPrice: 25.0 },
              { minQty: 30, maxQty: 49, unitPrice: 22.0 },
              { minQty: 50, maxQty: null, unitPrice: 19.5 },
            ],
            '500ml': [
              { minQty: 1, maxQty: 10, unitPrice: 31.66 },
              { minQty: 11, maxQty: 29, unitPrice: 28.0 },
              { minQty: 30, maxQty: 49, unitPrice: 25.0 },
              { minQty: 50, maxQty: null, unitPrice: 22.0 },
            ],
          },
        }),
        availableSizes: JSON.stringify(['300ml', '500ml']),
        availableColors: JSON.stringify(['Alumínio Polido', 'Preto Fosco', 'Branco', 'Vermelho', 'Azul Royal', 'Rosa Neon']),
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        ],
      },
      {
        name: 'Abadá Personalizado para Carnaval e Micaretas',
        slug: 'abada-personalizado-carnaval',
        category: 'Abadás',
        description: 'Abadá em tecido Helanca Light 100% poliéster. Leve, super confortável, com cores vibrantes que não desbotam.',
        details: 'Sublimação total frente e verso.',
        featured: true,
        basePrice: 18.0,
        pricingTiers: JSON.stringify([
          { minQty: 20, maxQty: 49, unitPrice: 18.0 },
          { minQty: 50, maxQty: 99, unitPrice: 15.0 },
          { minQty: 100, maxQty: 299, unitPrice: 12.5 },
          { minQty: 300, maxQty: null, unitPrice: 10.0 },
        ]),
        availableSizes: JSON.stringify(['P', 'M', 'G', 'GG', 'XGG']),
        availableColors: JSON.stringify(['Estampa Total Personalizada']),
        images: [
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80',
        ],
      },
    ];

    for (const p of products) {
      const { images, ...productData } = p;
      const created = await prisma.product.upsert({
        where: { slug: p.slug },
        update: productData,
        create: productData,
      });

      if (images && images.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: created.id } });
        for (let i = 0; i < images.length; i++) {
          await prisma.productImage.create({
            data: {
              productId: created.id,
              imageUrl: images[i],
              position: i,
            },
          });
        }
      }
    }

    // 4. Categories for Prints
    const printCats = ['Igrejas & Religiosos', 'Formatura & Escolar', 'Carnaval & Festas', 'Empresas & Negócios', 'Esportes & Academias'];
    for (const cName of printCats) {
      await prisma.category.upsert({
        where: { name: cName },
        update: { name: cName },
        create: { name: cName },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tabelas criadas e banco de dados PostgreSQL populado com sucesso com os dados da Tenório Confecções!',
      counts: {
        products: products.length,
        settings: settings.length,
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erro ao popular banco de dados: ' + error.message }, { status: 500 });
  }
}
