import { body, param } from 'express-validator';

export const createChannelValidation = [
  param('serverId')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du serveur est requis')
    .isUUID()
    .withMessage('L\'ID du serveur doit être un UUID valide'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom du channel est requis')
    .isLength({ min: 1, max: 50 })
    .withMessage('Le nom du channel doit contenir entre 1 et 50 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom du channel ne peut contenir que des lettres, chiffres, tirets et underscores'),
];

export const getChannelsByServerValidation = [
  param('serverId')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du serveur est requis')
    .isUUID()
    .withMessage('L\'ID du serveur doit être un UUID valide'),
];

export const getChannelByIdValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du channel est requis')
    .isUUID()
    .withMessage('L\'ID du channel doit être un UUID valide'),
];

export const updateChannelValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du channel est requis')
    .isUUID()
    .withMessage('L\'ID du channel doit être un UUID valide'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom du channel est requis')
    .isLength({ min: 1, max: 50 })
    .withMessage('Le nom du channel doit contenir entre 1 et 50 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom du channel ne peut contenir que des lettres, chiffres, tirets et underscores'),
];

export const deleteChannelValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('L\'ID du channel est requis')
    .isUUID()
    .withMessage('L\'ID du channel doit être un UUID valide'),
];