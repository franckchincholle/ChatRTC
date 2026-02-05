import { PrismaClient } from '@prisma/client';

// Singleton pattern pour éviter d'ouvrir plusieurs connexions
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn']  // En dev, on log tout
      : ['error'],                   // En prod, seulement les erreurs
  });

// En dev, on garde l'instance en mémoire (Hot Module Reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Fermeture propre de la connexion à l'arrêt du serveur
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});