import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/socket-auth.middleware';
import { ServerIO, AppSocket } from '../types/socket.types';
import { ServerRepository } from '../repositories/server.repository';

export class SocketManager {
  private static io: ServerIO;
  private static serverRepository = new ServerRepository();

  // serverId -> Set<userId>
  private static onlineUsers = new Map<string, Set<string>>();

  // userId -> Set<socketId>
  private static userSockets = new Map<string, Set<string>>();

  static init(httpServer: HTTPServer): ServerIO {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    this.io.use(socketAuthMiddleware);

    this.io.on('connection', async (socket: AppSocket) => {
      const userId = socket.data.userId;
      const username = socket.data.username;

      console.log(`🔗 Socket connectée ${socket.id} pour user ${userId}`);

      // ───── gestion multi sockets utilisateur ─────

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }

      const userSocketSet = this.userSockets.get(userId)!;
      userSocketSet.add(socket.id);

      const isFirstConnection = userSocketSet.size === 1;

      try {
        const userServers = await this.serverRepository.findByUserId(userId);

        // ───── rejoindre les rooms serveur ─────

        userServers.forEach((server) => {
          socket.join(`server:${server.id}`);

          if (!this.onlineUsers.has(server.id)) {
            this.onlineUsers.set(server.id, new Set());
          }

          if (isFirstConnection) {
            this.onlineUsers.get(server.id)!.add(userId);

            this.io.to(`server:${server.id}`).emit('user:status_changed', {
              userId,
              status: 'online',
            });
          }
        });

        socket.join(`user:${userId}`);

        console.log(`📡 User ${userId} connecté à ${userServers.length} serveurs`);

        // ───── channels ─────

        socket.on('join_channel', (data: { serverId: string; channelId: string }) => {
          socket.join(`channel:${data.channelId}`);

          socket.to(`channel:${data.channelId}`).emit('channel:user_joined', {
            userId,
            username,
            channelId: data.channelId,
          });
        });

        socket.on('leave_channel', (data: { serverId: string; channelId: string }) => {
          socket.leave(`channel:${data.channelId}`);

          socket.to(`channel:${data.channelId}`).emit('channel:user_left', {
            userId,
            username,
            channelId: data.channelId,
          });
        });

        // ───── serveurs ─────

        socket.on('join_server', (data: { serverId: string }) => {
          socket.join(`server:${data.serverId}`);

          if (!this.onlineUsers.has(data.serverId)) {
            this.onlineUsers.set(data.serverId, new Set());
          }

          this.onlineUsers.get(data.serverId)!.add(userId);

          this.io.to(`server:${data.serverId}`).emit('user:status_changed', {
            userId,
            status: 'online',
          });
        });

        socket.on('leave_server', (data: { serverId: string }) => {
          socket.leave(`server:${data.serverId}`);

          this.onlineUsers.get(data.serverId)?.delete(userId);

          this.io.to(`server:${data.serverId}`).emit('user:status_changed', {
            userId,
            status: 'offline',
          });
        });

        // ───── typing ─────

        socket.on('user:typing', (data: { channelId: string; serverId: string }) => {
          socket.to(`channel:${data.channelId}`).emit('user:typing', {
            serverId: data.serverId,
            channelId: data.channelId,
            user: { userId, username },
          });
        });

        socket.on('user:stop_typing', (data: { channelId: string; serverId: string }) => {
          socket.to(`channel:${data.channelId}`).emit('user:stop_typing', {
            serverId: data.serverId,
            channelId: data.channelId,
            user: { userId, username },
          });
        });

        // ───── déconnexion robuste ─────

        socket.on('disconnecting', () => {
          console.log(`🔌 Socket ${socket.id} en cours de déconnexion`);

          const sockets = this.userSockets.get(userId);
          if (!sockets) return;

          sockets.delete(socket.id);

          if (sockets.size === 0) {
            this.userSockets.delete(userId);

            console.log(`📴 User ${userId} totalement offline`);

            const serverRooms = [...socket.rooms].filter((room) =>
              room.startsWith('server:')
            );

            serverRooms.forEach((room) => {
              const serverId = room.replace('server:', '');

              this.onlineUsers.get(serverId)?.delete(userId);

              this.io.to(room).emit('user:status_changed', {
                userId,
                status: 'offline',
              });
            });
          }
        });

      } catch (error) {
        console.error(`❌ Erreur pour ${userId}:`, error);
      }
    });

    return this.io;
  }

  // ───── événements admin ─────

  static emitMemberKicked(serverId: string, userId: string): void {
    this.io.to(`server:${serverId}`).emit('member:kicked', { userId, serverId });
    this.io.to(`user:${userId}`).emit('member:kicked', { userId, serverId });
  }

  static emitMemberBanned(serverId: string, userId: string): void {
    this.io.to(`server:${serverId}`).emit('member:banned', { userId, serverId });
    this.io.to(`user:${userId}`).emit('member:banned', { userId, serverId });
  }

  static emitMemberUnbanned(serverId: string, userId: string): void {
    this.io.to(`server:${serverId}`).emit('member:unbanned', { userId, serverId });
    this.io.to(`user:${userId}`).emit('member:unbanned', { userId, serverId });
  }

  // ───── utilitaires ─────

  static getOnlineUsers(serverId: string): string[] {
    return Array.from(this.onlineUsers.get(serverId) || []);
  }

  static getIO(): ServerIO {
    if (!this.io) throw new Error("Socket.io n'est pas initialisé.");
    return this.io;
  }
}