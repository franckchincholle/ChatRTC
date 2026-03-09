import config from '@/config/env';

export const API_URL = config.apiUrl;
export const WS_URL = config.wsUrl;

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_USERNAME_LENGTH = 20;
export const MIN_USERNAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_SERVER_NAME_LENGTH = 50;
export const MIN_SERVER_NAME_LENGTH = 2;
export const MAX_CHANNEL_NAME_LENGTH = 30;
export const MIN_CHANNEL_NAME_LENGTH = 2;

export const TYPING_TIMEOUT = 3000; 

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès refusé',
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur',
  UNKNOWN_ERROR: 'Une erreur est survenue',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie',
  SIGNUP_SUCCESS: 'Inscription réussie',
  SERVER_CREATED: 'Serveur créé',
  SERVER_JOINED: 'Serveur rejoint',
  SERVER_LEFT: 'Serveur quitté',
  CHANNEL_CREATED: 'Canal créé',
  CHANNEL_UPDATED: 'Canal mis à jour',
  CHANNEL_DELETED: 'Canal supprimé',
  MESSAGE_DELETED: 'Message supprimé',
  ROLE_UPDATED: 'Rôle mis à jour',
};