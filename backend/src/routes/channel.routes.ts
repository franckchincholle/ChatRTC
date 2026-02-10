import { Router } from 'express';
import { channelController } from '../controllers/channel.controller';
import {
  createChannelValidation,
  getChannelsByServerValidation,
  getChannelByIdValidation,
  updateChannelValidation,
  deleteChannelValidation,
} from '../validators/channel.validator';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

/**
 * Router pour les routes de channels
 */
const router = Router();

// ============================================
// ROUTES LIÉES À UN SERVEUR
// Préfixe: /servers/:serverId/channels
// ============================================

/**
 * @route   POST /servers/:serverId/channels
 * @desc    Créer un nouveau channel dans un serveur
 * @access  Private (Admin ou Owner uniquement)
 */
router.post(
  '/servers/:serverId/channels',
  authenticate,                 // 1. Vérifier que l'utilisateur est connecté
  createChannelValidation,      // 2. Valider serverId (URL) et name (body)
  validate,                     // 3. Vérifier qu'il n'y a pas d'erreurs
  channelController.createChannel // 4. Appeler le controller
);

/**
 * @route   GET /servers/:serverId/channels
 * @desc    Récupérer tous les channels d'un serveur
 * @access  Private (Membre du serveur)
 */
router.get(
  '/servers/:serverId/channels',
  authenticate,                      // 1. Vérifier que l'utilisateur est connecté
  getChannelsByServerValidation,     // 2. Valider serverId (URL)
  validate,                          // 3. Vérifier qu'il n'y a pas d'erreurs
  channelController.getChannelsByServer // 4. Appeler le controller
);

// ============================================
// ROUTES DIRECTES SUR UN CHANNEL
// Préfixe: /channels/:id
// ============================================

/**
 * @route   GET /channels/:id
 * @desc    Récupérer un channel par son ID
 * @access  Private (Membre du serveur parent)
 */
router.get(
  '/channels/:id',
  authenticate,                   // 1. Vérifier que l'utilisateur est connecté
  getChannelByIdValidation,       // 2. Valider l'ID du channel
  validate,                       // 3. Vérifier qu'il n'y a pas d'erreurs
  channelController.getChannelById // 4. Appeler le controller
);

/**
 * @route   PUT /channels/:id
 * @desc    Mettre à jour un channel
 * @access  Private (Admin ou Owner uniquement)
 */
router.put(
  '/channels/:id',
  authenticate,                // 1. Vérifier que l'utilisateur est connecté
  updateChannelValidation,     // 2. Valider l'ID et le nouveau nom
  validate,                    // 3. Vérifier qu'il n'y a pas d'erreurs
  channelController.updateChannel // 4. Appeler le controller
);

/**
 * @route   DELETE /channels/:id
 * @desc    Supprimer un channel
 * @access  Private (Admin ou Owner uniquement)
 */
router.delete(
  '/channels/:id',
  authenticate,                // 1. Vérifier que l'utilisateur est connecté
  deleteChannelValidation,     // 2. Valider l'ID du channel
  validate,                    // 3. Vérifier qu'il n'y a pas d'erreurs
  channelController.deleteChannel // 4. Appeler le controller
);

export default router;