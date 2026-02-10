import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type { SignupData, LoginData } from '../types/auth.types';

/**
* Controller gérant les routes d'authentification
*/
export class AuthController {

    /**
    * Inscription d'un nouvel utilisateur
    * @route POST /auth/signup
    */
    async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // 1. Extraire les données validées du body
            const signupData: SignupData = req.body;

            // 2. Appeler le service pour créer l'utilisateur
            const result = await authService.signup(signupData);

            // 3. Retourner la réponse avec status 201 (Created)
            res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: result,
            });
        } catch (error) {
            // 4. Passer l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    }

    /**
    * Connexion d'un utilisateur
    * @route POST /auth/login
    */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // 1. Extraire les données validées du body
            const loginData: LoginData = req.body;

            // 2. Appeler le service pour authentifier l'utilisateur
            const result = await authService.login(loginData);

            // 3. Retourner la réponse avec status 200 (OK)
            res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: result,
            });
        } catch (error) {
            // 4. Passer l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    }

    /**
    * Renouveler l'access token avec un refresh token
     @route POST /auth/refresh
    */
    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // 1. Extraire le refresh token du body
            const { refreshToken } = req.body;

            // 2. Appeler le service pour générer un nouveau access token
            const result = await authService.refreshAccessToken(refreshToken);

            // 3. Retourner le nouveau access token
            res.status(200).json({
            success: true,
            message: 'Token renouvelé avec succès',
            data: result,
            });
        } catch (error) {
            // 4. Passer l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    }

    /**
    * Déconnexion d'un utilisateur
    * @route POST /auth/logout
    */
    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Pour l'instant, on retourne juste un message
            // Plus tard, vous pourrez invalider le refresh token en base/Redis
            
            res.status(200).json({
            success: true,
            message: 'Déconnexion réussie',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
    * Récupérer les informations de l'utilisateur connecté
    * @route GET /auth/me
    */
    async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // L'utilisateur sera ajouté à req par le middleware d'authentification
            // Pour l'instant, on retourne juste un placeholder
            // Vous implémenterez ça une fois le middleware auth créé
            
            res.status(200).json({
            success: true,
            message: 'Utilisateur récupéré',
            data: {
                user: (req as any).user, // Sera typé correctement plus tard
            },
            });
        } catch (error) {
            next(error);
        }
    }
}

/**
 * Instance unique du controller d'authentification
 */
export const authController = new AuthController();