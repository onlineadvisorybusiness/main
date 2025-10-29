import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn', 'info'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  transactionOptions: {
    maxWait: 10000, // Increased wait time for serverless
    timeout: 30000, // Increased timeout for slow connections
  },
  __internal: {
    engine: {
      binaryTargets: ['native'],
    },
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // In production, also store globally to prevent multiple instances
  globalForPrisma.prisma = prisma;
  
  // Add connection diagnostics on initialization
  console.log('[PRISMA] Initializing Prisma client for production');
  console.log('[PRISMA] DATABASE_URL configured:', !!process.env.DATABASE_URL);
  
  // Test connection (non-blocking)
  prisma.$connect().then(() => {
    console.log('[PRISMA] Successfully connected to database');
  }).catch((error) => {
    console.error('[PRISMA] Initial connection failed:', {
      code: error.code,
      message: error.message?.substring(0, 200),
      hasTLS: error.message?.includes('fatal alert') || error.message?.includes('SSL') || error.message?.includes('TLS')
    });
  });
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
