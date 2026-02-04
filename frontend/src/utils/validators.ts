// Validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email requis' };
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { isValid: false, error: 'Email invalide' };
  }

  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Mot de passe requis' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Minimum 8 caractères' };
  }

  return { isValid: true };
}

export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: "Nom d'utilisateur requis" };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Minimum 3 caractères' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Maximum 20 caractères' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Lettres, chiffres et _ uniquement',
    };
  }

  return { isValid: true };
}

export function validateServerName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, error: 'Nom de serveur requis' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Minimum 2 caractères' };
  }

  if (name.length > 50) {
    return { isValid: false, error: 'Maximum 50 caractères' };
  }

  return { isValid: true };
}

export function validateChannelName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, error: 'Nom de canal requis' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Minimum 2 caractères' };
  }

  if (name.length > 30) {
    return { isValid: false, error: 'Maximum 30 caractères' };
  }

  return { isValid: true };
}

export function validateMessage(content: string): ValidationResult {
  if (!content || !content.trim()) {
    return { isValid: false, error: 'Message vide' };
  }

  if (content.length > 2000) {
    return { isValid: false, error: 'Message trop long (max 2000 caractères)' };
  }

  return { isValid: true };
}

export function validateInviteCode(code: string): ValidationResult {
  if (!code) {
    return { isValid: false, error: "Code d'invitation requis" };
  }

  if (code.length < 6) {
    return { isValid: false, error: 'Code invalide' };
  }

  return { isValid: true };
}