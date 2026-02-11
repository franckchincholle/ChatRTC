import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/socket-auth.middleware';
import { ServerIO, AppSocket } from '../types/socket.types';

export class SocketManager {
    private static io: ServerIO;

    static init(httpServer: HTTPServer): ServerIO {
        this.io = new Server(httpServer, {
            cors: { origin: process.env.CLIENT_URL, credentials: true }
        });

        this.io.use(socketAuthMiddleware);

        this.io.on('connection', (socket: AppSocket) => {
            socket.on('server:join_room', (serverId: string) => {
                socket.join(`server:${serverId}`);
            });

            socket.on('disconnect', () => {
                console.log(`🔌 Out: ${socket.data.userId}`);
            });
        });

        return this.io;
    };

    static getIO(): ServerIO {
        if (!this.io) throw new Error("Socket.io not initialized");
        return this.io;
    };
}