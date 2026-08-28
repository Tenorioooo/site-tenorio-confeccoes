import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '';

function createPrismaClient(): PrismaClient {
  if (connectionString) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
