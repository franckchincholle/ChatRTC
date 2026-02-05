/**
 * Classe de base pour toutes les erreurs custom
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture la stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreur 400 - Requête invalide
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * Erreur 401 - Non authentifié
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Erreur 403 - Accès refusé
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Erreur 404 - Ressource non trouvée
 */
export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

/**
 * Erreur 409 - Conflit (ex: username déjà pris)
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * Erreur 422 - Validation échouée
 */
export class ValidationError extends AppError {
  public readonly errors: any;

  constructor(message = 'Validation Failed', errors?: any) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Erreur 500 - Erreur serveur interne
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, false); // Non-operational (bug)
  }
}