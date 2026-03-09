import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/socket-auth.middleware';
import { ServerIO, AppSocket } from '../types/socket.types';
import { ServerRepository } from '../repositories/server.repository';

export class SocketManager {
  private static io: ServerIO;
  private static serverRepository = new ServerRepository();
  private static onlineUsers = new Map<string, Set<string>>();

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
        const userServers = await this.serverRepository.findByUserId(userId);

        userServers.forEach((server) => {
          socket.join(`server:${server.id}`);
          if (!this.onlineUsers.has(server.id)) {
              this.onlineUsers.set(server.id, new Set());
            }
          this.onlineUsers.get(server.id)!.add(userId);
          this.io.to(`server:${server.id}`).emit('user:status_changed', { userId, status: 'online' });
        });

        socket.join(`user:${userId}`);

        console.log(`🔗 User ${userId} a rejoint ${userServers.length} serveurs`);

        // GESTION DES CHANNELS

        socket.on('join_channel', (data: { serverId: string, channelId: string }) => {
          const channelRoom = `channel:${data.channelId}`;
          socket.join(channelRoom);

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

        socket.on('join_server', (data: { serverId: string }) => {
          const serverRoom = `server:${data.serverId}`;
          socket.join(serverRoom);
          if (!this.onlineUsers.has(data.serverId)) {
            this.onlineUsers.set(data.serverId, new Set());
          }
          this.onlineUsers.get(data.serverId)!.add(userId);
          console.log(`🏠 User ${userId} a rejoint server room: ${data.serverId}`);
          this.io.to(serverRoom).emit('user:status_changed', {
            userId,
            status: 'online',
          });
        });

        socket.on('leave_server', (data: { serverId: string }) => {
          const serverRoom = `server:${data.serverId}`;
          socket.leave(serverRoom);
          this.onlineUsers.get(data.serverId)?.delete(userId);
          console.log(`🏠 User ${userId} a quitté server room: ${data.serverId}`);
        })

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

        socket.on('disconnect', () => {
          console.log(`🔌 Utilisateur déconnecté : ${userId}`);
          userServers.forEach((server) => {
            this.onlineUsers.get(server.id)?.delete(userId);
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

  static getOnlineUsers(serverId: string): string[] {
    return Array.from(this.onlineUsers.get(serverId) || []);
  }

  static getIO(): ServerIO {
    if (!this.io) {
      throw new Error("Socket.io n'est pas initialisé.");
    }
    return this.io;
  }
}