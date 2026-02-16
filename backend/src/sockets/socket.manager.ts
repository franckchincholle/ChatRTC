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
      console.log(`📡 Utilisateur connecté aux sockets : ${userId}`);

      try {
        // 1. Récupérer les serveurs de l'utilisateur via ton repository existant
        const userServers = await this.serverRepository.findByUserId(userId);

        // 2. Faire rejoindre à l'utilisateur la "room" de chaque serveur
        userServers.forEach((server) => {
          const roomName = `server:${server.id}`;
          socket.join(roomName);
          socket.to(roomName).emit('user:status_changed', { userId, status: 'online' });
        });

        console.log(`🔗 User ${userId} a rejoint ${userServers.length} salons de serveurs`);

        // 3. Rejoindre une room privée pour les notifications directes à l'user
        socket.join(`user:${userId}`);

        // 4. Gérer les événements de typing
        socket.on('user:typing', (data: { channelId: string, serverId: string }) => {
          // On utilise socket.to pour ne pas se l'envoyer à soi-même
          socket.to(`server:${data.serverId}`).emit('user:typing', { userId: userId, channelId: data.channelId });
        });

        // 6. Gérer la déconnexion
        socket.on('disconnect', () => {
          console.log(`🔌 Utilisateur déconnecté : ${userId}`);
          userServers.forEach((server) => {
            this.io.to(`server:${server.id}`).emit('user:status_changed', { userId, status: 'offline' });
          })
        });

      } catch (error) {
        console.error(`❌ Erreur lors de la synchronisation des rooms pour ${userId}:`, error);
      }  
    });

    return this.io;
  }

  /**
   * Récupère l'instance IO pour émettre des événements depuis les services
   */
  static getIO(): ServerIO {
    if (!this.io) {
      throw new Error("Socket.io n'est pas initialisé. Appelez SocketManager.init(server) d'abord.");
    }
    return this.io;
  }
}