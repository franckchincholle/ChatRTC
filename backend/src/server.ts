import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import serverRoutes from './routes/server.routes';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { errorHandler } from './middlewares/error.middleware';

// Import des routes
import authRoutes from './routes/auth.routes';
import channelRoutes from './routes/channel.routes';

/**
 * Initialisation de l'application Express
 */
const app = express();

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

/**
 * Helmet - Sécurise les headers HTTP
 */
app.use(helmet());

/**
 * CORS - Autorise les requêtes cross-origin depuis le frontend
 */
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true, // Permet l'envoi de cookies
}));

/**
 * Body parsers - Parse le JSON et les données de formulaire
 */
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

// ============================================
// ROUTES
// ============================================

/**
 * Health check - Vérifie que le serveur fonctionne
 * @route GET /health
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Routes d'authentification
 * Préfixe: /auth
 */
app.use('/auth', authRoutes);

// TODO: Ajouter d'autres routes ici plus tard
// app.use('/servers', serverRoutes);
app.use('/api/servers', serverRoutes);
// Routes de channels
app.use('/', channelRoutes);
// app.use('/messages', messageRoutes);

/**
 * Route 404 - Route non trouvée
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`,
  });
});

// ============================================
// MIDDLEWARE DE GESTION D'ERREURS
// ============================================

/**
 * Middleware global de gestion des erreurs
 * DOIT être placé APRÈS toutes les routes
 */
app.use(errorHandler);

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

/**
 * Fonction pour démarrer le serveur
 */
async function startServer() {
  try {
    // 1. Vérifier la connexion à la base de données
    console.log('🔍 Vérification de la connexion à PostgreSQL...');
    await prisma.$connect();
    console.log('✅ PostgreSQL connecté');

    // 2. Vérifier la connexion à Redis
    console.log('🔍 Vérification de la connexion à Redis...');
    await redis.ping();
    console.log('✅ Redis connecté');

    // 3. Démarrer le serveur HTTP
    app.listen(env.PORT, () => {
      console.log('\n🚀 ============================================');
      console.log(`🚀 Serveur démarré sur le port ${env.PORT}`);
      console.log(`🌍 Environnement: ${env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${env.PORT}`);
      console.log(`💚 Health check: http://localhost:${env.PORT}/health`);
      console.log('🚀 ============================================\n');
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1); // Quitter avec un code d'erreur
  }
}

// ============================================
// GESTION DE L'ARRÊT DU SERVEUR
// ============================================

/**
 * Gestion propre de l'arrêt du serveur (Ctrl+C)
 */
process.on('SIGINT', async () => {
  console.log('\n⚠️  Signal SIGINT reçu, arrêt du serveur...');
  
  try {
    // Fermer la connexion Prisma
    await prisma.$disconnect();
    console.log('✅ Prisma déconnecté');
    
    // Fermer la connexion Redis
    await redis.quit();
    console.log('✅ Redis déconnecté');
    
    console.log('👋 Serveur arrêté proprement\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'arrêt:', error);
    process.exit(1);
  }
});

/**
 * Gestion des erreurs non capturées
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Démarrer le serveur
startServer();

export default app;