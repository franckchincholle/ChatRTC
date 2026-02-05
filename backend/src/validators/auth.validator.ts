import { body } from 'express-validator';

// 1. Validation pour signup
export const signupValidation = [
  // Validation du username
  body('username')
    .trim() // Enlève les espaces au début et à la fin
    .notEmpty()
    .withMessage('Le nom d\'utilisateur est requis')
    .isLength({ min: 3, max: 50 })
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),

  // Validation de l'email
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('L\'email n\'est pas valide')
    .normalizeEmail(), // Normalise l'email (lowercase, etc.)

  // Validation du password
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
];


// 2. Validation pour login
export const loginValidation = [
  // Validation de l'email
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('L\'email n\'est pas valide')
    .normalizeEmail(),

  // Validation du password
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
  
  // Note : On ne valide PAS la complexité du mot de passe au login
  // car on veut juste vérifier qu'il y a quelque chose
];


// 3. Validation pour refresh token (pour la route POST /auth/refresh)

export const refreshTokenValidation = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Le refresh token est requis')
    .isString()
    .withMessage('Le refresh token doit être une chaîne de caractères'),
];