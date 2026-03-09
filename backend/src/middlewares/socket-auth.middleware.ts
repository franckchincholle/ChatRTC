import { AppSocket } from '../types/socket.types';
import { verifyAccessToken } from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';

export const socketAuthMiddleware = async (socket: AppSocket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers['authorization'];

        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

        const payload = verifyAccessToken(tokenString);

        const user = await userRepository.findById(payload.userId);

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.data.userId = user.id;
        socket.data.username = user.username;

        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid or expired token'));
    }
};