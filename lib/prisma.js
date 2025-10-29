import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
  },
  __internal: {
    engine: {
      binaryTargets: ['native'],
    },
  }
});

if (process.env.NODE_ENV !== 'production') {

  globalForPrisma.prisma = prisma;
}

if (!globalForPrisma.prismaCleanupAdded) {

  globalForPrisma.prismaCleanupAdded = true;
  
  process.on('beforeExit', async () => {

    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {

    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {

    await prisma.$disconnect();
    process.exit(0);
  });
}
