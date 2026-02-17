import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/socket-auth.middleware';
import { ServerIO, AppSocket } from '../types/socket.types';
import { ServerRepository } from '../repositories/server.repository';

export class SocketManager {
  private static io: ServerIO;
  private static serverRepository = new ServerRepository();

  static init(httpServer: HTTPServer): ServerIO {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true
      }
    });

    this.io.use(socketAuthMiddleware);

    this.io.on('connection', async (socket: AppSocket) => {
      const userId = socket.data.userId;
      const username = socket.data.username;

      console.log(`🔡 Utilisateur connecté : ${userId}`);

      try {
        // 1. Récupérer les serveurs de l'utilisateur
        const userServers = await this.serverRepository.findByUserId(userId);

        // 2. Rejoindre les rooms des serveurs
        userServers.forEach((server) => {
          socket.join(`server:${server.id}`);
          socket.to(`server:${server.id}`).emit('user:status_changed', { userId, status: 'online' });
        });

        // 3. Room privée pour notifications directes
        socket.join(`user:${userId}`);

        console.log(`🔗 User ${userId} a rejoint ${userServers.length} serveurs`);

        // ============================================
        // GESTION DES CHANNELS
        // ============================================

        socket.on('join_channel', (data: { serverId: string, channelId: string }) => {
          const channelRoom = `channel:${data.channelId}`;
          socket.join(channelRoom);
          // 🔍 DEBUG
  console.log(`📺 JOIN_CHANNEL reçu:`);
  console.log(`  - userId: ${userId}`);
  console.log(`  - channelId: ${data.channelId}`);
  console.log(`  - room: ${channelRoom}`);
  console.log(`  - Toutes les rooms du socket: ${[...socket.rooms].join(', ')}`);

          socket.to(channelRoom).emit('channel:user_joined', {
            userId,
            username,
            channelId: data.channelId,
          });
        });

        socket.on('leave_channel', (data: { serverId: string, channelId: string }) => {
          const channelRoom = `channel:${data.channelId}`;
          socket.leave(channelRoom);
          console.log(`📺 User ${userId} a quitté channel ${data.channelId}`);

          socket.to(channelRoom).emit('channel:user_left', {
            userId,
            username,
            channelId: data.channelId,
          });
        });

        // ============================================
        // TYPING
        // ============================================

        socket.on('user:typing', (data: { channelId: string, serverId: string }) => {
          socket.to(`channel:${data.channelId}`).emit('user:typing', {
            serverId: data.serverId,
            channelId: data.channelId,
            user: { userId, username },
          });
        });

        socket.on('user:stop_typing', (data: { channelId: string, serverId: string }) => {
          socket.to(`channel:${data.channelId}`).emit('user:stop_typing', {
            serverId: data.serverId,
            channelId: data.channelId,
            user: { userId, username },
          });
        });

        // ============================================
        // DÉCONNEXION
        // ============================================

        socket.on('disconnect', () => {
          console.log(`🔌 Utilisateur déconnecté : ${userId}`);
          userServers.forEach((server) => {
            this.io.to(`server:${server.id}`).emit('user:status_changed', {
              userId,
              status: 'offline',
            });
          });
        });

      } catch (error) {
        console.error(`❌ Erreur pour ${userId}:`, error);
      }
    });

    return this.io;
  }

  static getIO(): ServerIO {
    if (!this.io) {
      throw new Error("Socket.io n'est pas initialisé.");
    }
    return this.io;
  }
}