import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import serverRoutes from './routes/server.routes';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { errorHandler } from './middlewares/error.middleware';
import { createServer } from 'http';
import { SocketManager } from './sockets/socket.manager';

import authRoutes from './routes/auth.routes';
import channelRoutes from './routes/channel.routes';
import messageRoutes from './routes/message.routes';
import reactionRoutes from './routes/reaction.routes';
import memberRoutes from './routes/member.routes';

const app = express();

const httpServer = createServer(app);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = env.CLIENT_URL.split(',').map((o) => o.trim());
      // Pas d'origine (ex: curl, mobile) ou origine autorisée → OK
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || allowedOrigins[0]); // ← renvoie l'origine exacte, pas toute la liste
      } else {
        callback(new Error(`CORS bloqué pour l'origine : ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/', channelRoutes);
app.use('/channels/:channelId/messages', messageRoutes);
app.use('/channels/:channelId/messages/:messageId/reactions', reactionRoutes); 
app.use('/', memberRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`,
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    console.log('🔍 Vérification de la connexion à PostgreSQL...');
    await prisma.$connect();
    console.log('✅ PostgreSQL connecté');

    console.log('🔍 Vérification de la connexion à Redis...');
    await redis.ping();
    console.log('✅ Redis connecté');

    SocketManager.init(httpServer);
    console.log('✅ Socket.io initialisé');

    httpServer.listen(env.PORT, () => {
      console.log('\n🚀 ============================================');
      console.log(`🚀 Serveur démarré sur le port ${env.PORT}`);
      console.log(`🌍 Environnement: ${env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${env.PORT}`);
      console.log(`💚 Health check: http://localhost:${env.PORT}/health`);
      console.log('🚀 ============================================\n');
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n⚠️  Signal SIGINT reçu, arrêt du serveur...');

  try {
    await prisma.$disconnect();
    console.log('✅ Prisma déconnecté');

    await redis.quit();
    console.log('✅ Redis déconnecté');

    console.log('👋 Serveur arrêté proprement\n');
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'arrêt:", error);
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

export default app;
