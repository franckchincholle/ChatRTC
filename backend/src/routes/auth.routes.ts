import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { 
  signupValidation, 
  loginValidation, 
  refreshTokenValidation 
} from '../validators/auth.validator';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

/**
 * Router pour les routes d'authentification
 * Préfixe: /auth
 */
const router = Router();

/**
 * @route   POST /auth/signup
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post(
  '/signup',
  signupValidation,    // 1. Valide les données (username, email, password)
  validate,            // 2. Vérifie qu'il n'y a pas d'erreurs de validation
  authController.signup // 3. Appelle le controller
);

/**
 * @route   POST /auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post(
  '/login',
  loginValidation,     // 1. Valide les données (email, password)
  validate,            // 2. Vérifie qu'il n'y a pas d'erreurs de validation
  authController.login // 3. Appelle le controller
);

/**
 * @route   POST /auth/refresh
 * @desc    Renouveler l'access token avec un refresh token
 * @access  Public (mais nécessite un refresh token valide)
 */
router.post(
  '/refresh',
  refreshTokenValidation, // 1. Valide le refresh token
  validate,               // 2. Vérifie qu'il n'y a pas d'erreurs
  authController.refreshToken // 3. Appelle le controller
);

/**
 * @route   POST /auth/logout
 * @desc    Déconnexion d'un utilisateur
 * @access  Private (nécessite d'être connecté)
 */
router.post(
  '/logout',
  authenticate,           // 1. Vérifie que l'utilisateur est connecté
  authController.logout   // 2. Appelle le controller
);

/**
 * @route   GET /auth/me
 * @desc    Récupérer les informations de l'utilisateur connecté
 * @access  Private (nécessite d'être connecté)
 */
router.get(
  '/me',
  authenticate,              // 1. Vérifie que l'utilisateur est connecté
  authController.getCurrentUser // 2. Appelle le controller
);

export default router;