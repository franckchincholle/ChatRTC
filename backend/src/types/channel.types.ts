/**
 * Types et interfaces pour les channels
 */

/**
 * Données pour créer un channel
 */
export interface CreateChannelData {
  name: string;
  serverId: string;
}

/**
 * Données pour mettre à jour un channel (pour le service)
 */
export interface UpdateChannelData {
  name: string;
}

/**
 * Données partielles pour mettre à jour un channel (pour le repository)
 * Tous les champs sont optionnels car Prisma permet des updates partiels
 */
export interface UpdateChannelInput {
  name?: string;
}

/**
 * Réponse avec les infos d'un channel
 */
export interface ChannelResponse {
  id: string;
  name: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
}