import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UnauthorizedError, ConflictError } from '../utils/errors';
import type { SignupData, LoginData, AuthResponse } from '../types/auth.types';
export class AuthService {

    async signup(data: SignupData): Promise<AuthResponse> {
        const emailExists = await userRepository.emailExists(data.email);
        if (emailExists) {
            throw new ConflictError('Cet email est déjà utilisé');
        }

        const usernameExists = await userRepository.usernameExists(data.username);
        if (usernameExists) {
            throw new ConflictError('Ce nom d\'utilisateur est déjà pris');
        }

        const hashedPassword = await hashPassword(data.password);

        const user = await userRepository.createUser({
            username: data.username,
            email: data.email,
            password: hashedPassword,
        });

        const accessToken = generateAccessToken({
            userId: user.id,
            username: user.username,
            email: user.email,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            username: user.username,
            email: user.email,
        });

        return {
            user: {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        };
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const user = await userRepository.findByEmail(data.email);
        
        if (!user) {
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        const isPasswordValid = await comparePassword(data.password, user.password);
        
        if (!isPasswordValid) {
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        const accessToken = generateAccessToken({
            userId: user.id,
            username: user.username,
            email: user.email,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            username: user.username,
            email: user.email,
        });

        return {
            user: {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        };
    }
    
    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const payload = verifyRefreshToken(refreshToken);

            const user = await userRepository.findById(payload.userId);
            
            if (!user) {
            throw new UnauthorizedError('Utilisateur introuvable');
            }

            const accessToken = generateAccessToken({
            userId: user.id,
            username: user.username,
            email: user.email,
            });

            return { accessToken };
            
        } catch (_error) {
            throw new UnauthorizedError('Refresh token invalide ou expiré');
        }
    }
}

export const authService = new AuthService();