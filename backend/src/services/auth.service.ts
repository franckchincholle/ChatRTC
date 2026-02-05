import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';
import type { SignupData, LoginData, AuthResponse } from '../types/auth.types';
import type { User } from '@prisma/client';

// 1. Les DTOs (Data Transfer Objects) sont dans auth.types.ts 

// 2. Classe AuthService
/**
 * Service gérant l'authentification des utilisateurs
 */
export class AuthService {

    //    - signup()
    /**
     * Inscrit un nouvel utilisateur
     * @param data - Données d'inscription
     * @returns Utilisateur créé avec tokens
     * @throws ConflictError si l'email ou username existe déjà
     */
    async signup(data: SignupData): Promise<AuthResponse> {
        // 1. Vérifier si l'email existe déjà
        const emailExists = await userRepository.emailExists(data.email);
        if (emailExists) {
            throw new ConflictError('Cet email est déjà utilisé');
        }

        // 2. Vérifier si le username existe déjà
        const usernameExists = await userRepository.usernameExists(data.username);
        if (usernameExists) {
            throw new ConflictError('Ce nom d\'utilisateur est déjà pris');
        }

        // 3. Hasher le mot de passe
        const hashedPassword = await hashPassword(data.password);

        // 4. Créer l'utilisateur dans la DB
        const user = await userRepository.createUser({
            username: data.username,
            email: data.email,
            password: hashedPassword,
        });

        // 5. Générer les tokens JWT
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

        // 6. Retourner la réponse (sans le mot de passe !)
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
    
    //    - login()
    /**
    * Connecte un utilisateur existant
    * @param data - Données de connexion
    * @returns Utilisateur avec tokens
    * @throws UnauthorizedError si les identifiants sont incorrects
    */
    async login(data: LoginData): Promise<AuthResponse> {
        // 1. Trouver l'utilisateur par email
        const user = await userRepository.findByEmail(data.email);
        
        // 2. Si l'utilisateur n'existe pas → erreur
        if (!user) {
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        // 3. Vérifier le mot de passe
        const isPasswordValid = await comparePassword(data.password, user.password);
        
        // 4. Si le mot de passe est incorrect → erreur
        if (!isPasswordValid) {
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        // 5. Générer les tokens JWT
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

        // 6. Retourner la réponse
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
    
    //    - refreshAccessToken()
    /**
    * Génère un nouveau access token à partir d'un refresh token valide
    * @param refreshToken - Refresh token à vérifier
    * @returns Nouveau access token
    * @throws UnauthorizedError si le refresh token est invalide
    */
    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            // 1. Vérifier et décoder le refresh token
            const payload = verifyRefreshToken(refreshToken);

            // 2. Vérifier que l'utilisateur existe toujours
            const user = await userRepository.findById(payload.userId);
            
            if (!user) {
            throw new UnauthorizedError('Utilisateur introuvable');
            }

            // 3. Générer un nouveau access token
            const accessToken = generateAccessToken({
            userId: user.id,
            username: user.username,
            email: user.email,
            });

            // 4. Retourner le nouveau token
            return { accessToken };
            
        } catch (error) {
            // Si le token est expiré ou invalide, on lance une erreur
            throw new UnauthorizedError('Refresh token invalide ou expiré');
        }
    }
}

// 3. Export d'une instance singleton