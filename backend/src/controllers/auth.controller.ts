import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type { SignupData, LoginData } from '../types/auth.types';

export class AuthController {

    async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const signupData: SignupData = req.body;
            const result = await authService.signup(signupData);

            res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginData: LoginData = req.body;
            const result = await authService.login(loginData);

            res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshAccessToken(refreshToken);

            res.status(200).json({
            success: true,
            message: 'Token renouvelé avec succès',
            data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.status(200).json({
            success: true,
            message: 'Déconnexion réussie',
            });
        } catch (error) {
            next(error);
        }
    }

    async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.status(200).json({
            success: true,
            message: 'Utilisateur récupéré',
            data: {
                user: (req as any).user, 
            },
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();