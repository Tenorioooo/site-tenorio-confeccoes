import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Tenório Confecções database...');

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
  console.log('Admin user created/updated.');

  // 2. Site Settings
  const settings = [
    { key: 'company_name', value: 'Tenório Confecções' },
    { key: 'whatsapp_number', value: '+55 18 99179-5656' },
    { key: 'email', value: 'tenorioconfeccoes.of@gmail.com' },
    { key: 'instagram', value: '@tenorio_confeccoes' },
    { key: 'address', value: 'Andradina - SP | Atendemos todo o Brasil' },
    { key: 'minimum_order', value: '1 peças' },
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
  console.log('Site settings initialized.');

  // 3. Products
  const products = [
    {
      name: 'Camiseta Personalizada 100% Algodão',
      slug: 'camiseta-personalizada-algodao',
      category: 'Camisetas',
      description: 'Camiseta em malha penteada 100% algodão fio 30.1. Toque macio, excelente caimento e altíssima durabilidade. Ideal para eventos, festas, formaturas e marcas próprias.',
      details: 'Gola careca reforçada, costura ombro a ombro. Disponível em Silk Screen, DTF HD e Bordado.',
      featured: true,
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
      availableSizes: JSON.stringify(['PP', 'P', 'M', 'G', 'GG', 'XGG']),
      availableColors: JSON.stringify(['Preto', 'Azul Marinho', 'Cinza Chumbo', 'Branco']),
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Caneca de Porcelana Personalizada 325ml',
      slug: 'caneca-porcelana-personalizada',
      category: 'Canecas',
      description: 'Caneca de porcelanaAAA com acabamento brilhante. Impressão sublimática de altíssima definição que não desbota e pode ir ao micro-ondas.',
      details: 'Capacidade 325ml. Ótima para brindes corporativos, presentes e lembranças de eventos.',
      featured: true,
      availableSizes: JSON.stringify(['325ml']),
      availableColors: JSON.stringify(['Branco', 'Alça Preta', 'Alça Azul', 'Alça Vermelha']),
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Abadá Personalizado para Blocos e Festas',
      slug: 'abada-personalizado-eventos',
      category: 'Abadás',
      description: 'Abadá em tecido 100% poliéster ou dry fit leve. Sublimação total frente e costas com cores vivas e vibrantes para micaretas, carnaval e festas.',
      details: 'Corte anatômico confortável, acabamento impecável em viés.',
      featured: true,
      availableSizes: JSON.stringify(['PP', 'P', 'M', 'G', 'GG', 'XGG']),
      availableColors: JSON.stringify(['Sublimação Total Personalizada']),
      images: [
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Bandeira Personalizada de Poliéster',
      slug: 'bandeira-personalizada-poliester',
      category: 'Bandeiras',
      description: 'Bandeira estampada por sublimação em tecido lavável de alta durabilidade. Ideal para torcidas, eventos esportivos, fachadas e convenções.',
      details: 'Disponível em 1x0,70m, 1,50x1,00m e 2,00x1,40m com ilhós ou tralha para haste.',
      featured: false,
      availableSizes: JSON.stringify(['P (1x0,7m)', 'M (1.5x1m)', 'G (2x1.4m)']),
      availableColors: JSON.stringify(['Arte Personalizada']),
      images: [
        'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Wind Banner Publicitário Completo',
      slug: 'wind-banner-publicitario',
      category: 'Wind Banner',
      description: 'Flag banner promocional para fachadas de lojas, postos, eventos e praias. Altíssima visibilidade e resistência ao vento.',
      details: 'Acompanha haste de fibra, tecido dupla face sublimado e base de apoio preenchível.',
      featured: true,
      availableSizes: JSON.stringify(['2 metros', '3 metros', '4 metros']),
      availableColors: JSON.stringify(['Gota', 'Pena', 'Vela']),
      images: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Camisa Polo Uniforme Corporativo',
      slug: 'camisa-polo-uniforme-corporativo',
      category: 'Uniformes',
      description: 'Camisa Polo Piquet Misto ou Algodão. Confere elegância e profissionalismo para a equipe de vendas, atendimento e escritórios.',
      details: 'Bordado computadorizado de alta precisão no peito e mangas.',
      featured: true,
      availableSizes: JSON.stringify(['P', 'M', 'G', 'GG', 'XGG']),
      availableColors: JSON.stringify(['Azul Marinho', 'Preto', 'Branco', 'Cinza', 'Verde']),
      images: [
        'https://images.unsplash.com/photo-1625910513413-433a010d29a5?w=800&auto=format&fit=crop&q=80',
      ],
    },
  ];

  for (const prod of products) {
    const { images, ...prodData } = prod;
    const existing = await prisma.product.findUnique({ where: { slug: prodData.slug } });
    if (!existing) {
      const created = await prisma.product.create({
        data: prodData,
      });

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
  console.log('Products initialized.');

  // 4. Print Catalog (EST-001 to EST-012)
  const prints = [
    {
      code: 'EST-001',
      name: 'Tropical Sunset',
      category: 'Verão & Praia',
      tags: JSON.stringify(['Tropical', 'Praia', 'Verão', 'Festa', 'Sunset']),
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      code: 'EST-002',
      name: 'Summer Vibes Neon',
      category: 'Festas & Baladas',
      tags: JSON.stringify(['Neon', 'Summer', 'Vibes', 'Balada', 'Carnaval']),
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      code: 'EST-003',
      name: 'Team Spirit Champion',
      category: 'Esportes & Times',
      tags: JSON.stringify(['Esporte', 'Time', 'Campeonato', 'Equipe', 'Futebol']),
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      code: 'EST-004',
      name: 'Minimal Typography Bold',
      category: 'Minimalista & Urbano',
      tags: JSON.stringify(['Minimalista', 'Tipografia', 'Urbano', 'Streetwear']),
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      code: 'EST-005',
      name: 'Formandos 2026 Conquistadores',
      category: 'Formaturas & Escolas',
      tags: JSON.stringify(['Formando', 'Formatura', 'Terceirão', 'Faculdade']),
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      code: 'EST-006',
      name: 'Corporate Excellence Pro',
      category: 'Corporativo & Empresas',
      tags: JSON.stringify(['Empresa', 'Corporativo', 'Branded', 'Equipe']),
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
      featured: false,
    },
    {
      code: 'EST-007',
      name: 'Fé e Esperança Geometric',
      category: 'Igrejas & Retiros',
      tags: JSON.stringify(['Igreja', 'Retiro', 'Gospel', 'Jovens']),
      imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop&q=80',
      featured: false,
    },
    {
      code: 'EST-008',
      name: 'Bloco da Alegria Carnaval',
      category: 'Abadás & Carnaval',
      tags: JSON.stringify(['Abadá', 'Bloco', 'Carnaval', 'Micareta', 'Festa']),
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      code: 'EST-009',
      name: 'Vintage Retro Stamp 80s',
      category: 'Minimalista & Urbano',
      tags: JSON.stringify(['Retro', 'Vintage', '80s', 'Estilo']),
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      featured: false,
    },
    {
      code: 'EST-010',
      name: 'Coffee & Code Tech',
      category: 'Corporativo & Empresas',
      tags: JSON.stringify(['Tech', 'Programação', 'Coffee', 'Geek']),
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      featured: false,
    },
  ];

  // 4. Prints - handle categories and linking
  // Extract unique categories from prints array
  const categoryNames = Array.from(new Set(prints.map(p => p.category)));
  // Upsert categories
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Upsert prints without category field
  const printsData = prints.map(({ category, ...rest }) => rest);
  for (const pr of printsData) {
    await prisma.print.upsert({
      where: { code: pr.code },
      update: pr,
      create: pr,
    });
  }

  // Link prints to categories via PrintCategory join table
  for (const pr of prints) {
    const category = await prisma.category.findUnique({ where: { name: pr.category } });
    const print = await prisma.print.findUnique({ where: { code: pr.code } });
    if (category && print) {
      const existingLink = await prisma.printCategory.findUnique({
        where: { printId_categoryId: { printId: print.id, categoryId: category.id } },
      });
      if (!existingLink) {
        await prisma.printCategory.create({
          data: {
            printId: print.id,
            categoryId: category.id,
          },
        });
      }
    }
  }

  console.log('Prints catalog initialized.');

  // 5. Testimonials
  const testimonials = [
    {
      name: 'CarlosEduardo M.',
      city: 'Caruaru - PE',
      text: 'Fizemos 150 camisetas para o evento da nossa empresa. A qualidade do algodão e a precisão do bordado superaram todas as expectativas!',
      rating: 5,
    },
    {
      name: 'Juliana Paes',
      city: 'Recife - PE',
      text: 'Pedimos abadás e wind banners para nosso bloco. Entrega no prazo, sublimação com cores super vivas! Atendimento de primeira pelo WhatsApp.',
      rating: 5,
    },
    {
      name: 'Roberto Alencar',
      city: 'Campina Grande - PB',
      text: 'Excelente suporte para ajuste da nossa arte própria. As polo uniformes da nossa equipe ficaram impecáveis.',
      rating: 5,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log('Testimonials initialized.');

  // 6. Sample Quote
  const sampleQuoteCode = 'ORC-2026-000101';
  const existingQuote = await prisma.quote.findUnique({ where: { quoteCode: sampleQuoteCode } });
  if (!existingQuote) {
    const createdQuote = await prisma.quote.create({
      data: {
        quoteCode: sampleQuoteCode,
        customerName: 'João Silva',
        whatsapp: '81998877665',
        email: 'joao.silva@email.com',
        city: 'Caruaru',
        state: 'PE',
        desiredDate: '2026-10-15',
        notes: 'Preciso das camisetas para o evento anual da empresa. Gostaria de saber prazo de envio.',
        status: 'Em análise',
      },
    });

    const item1 = await prisma.quoteItem.create({
      data: {
        quoteId: createdQuote.id,
        productName: 'Camiseta Personalizada 100% Algodão',
        printCode: 'EST-001',
        printName: 'Tropical Sunset',
        quantity: 30,
        customizationPositions: JSON.stringify(['Frente', 'Costas']),
        hasCustomArt: false,
      },
    });
}

  console.log('🚀 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
