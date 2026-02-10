import { body, param } from 'express-validator';

/**
 * Validation pour créer un channel
 * POST /servers/:serverId/channels
 */
export const createChannelValidation = [
  // Validation du serverId dans l'URL
  param('serverId')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du serveur est requis')
    .isUUID()
    .withMessage('L\'ID du serveur doit être un UUID valide'),

  // Validation du nom du channel
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom du channel est requis')
    .isLength({ min: 1, max: 50 })
    .withMessage('Le nom du channel doit contenir entre 1 et 50 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom du channel ne peut contenir que des lettres, chiffres, tirets et underscores'),
];

/**
 * Validation pour récupérer les channels d'un serveur
 * GET /servers/:serverId/channels
 */
export const getChannelsByServerValidation = [
  param('serverId')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du serveur est requis')
    .isUUID()
    .withMessage('L\'ID du serveur doit être un UUID valide'),
];

/**
 * Validation pour récupérer un channel par ID
 * GET /channels/:id
 */
export const getChannelByIdValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du channel est requis')
    .isUUID()
    .withMessage('L\'ID du channel doit être un UUID valide'),
];

/**
 * Validation pour mettre à jour un channel
 * PUT /channels/:id
 */
export const updateChannelValidation = [
  // Validation de l'ID dans l'URL
  param('id')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du channel est requis')
    .isUUID()
    .withMessage('L\'ID du channel doit être un UUID valide'),

  // Validation du nom
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom du channel est requis')
    .isLength({ min: 1, max: 50 })
    .withMessage('Le nom du channel doit contenir entre 1 et 50 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom du channel ne peut contenir que des lettres, chiffres, tirets et underscores'),
];

/**
 * Validation pour supprimer un channel
 * DELETE /channels/:id
 */
export const deleteChannelValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du channel est requis')
    .isUUID()
    .withMessage('L\'ID du channel doit être un UUID valide'),
];