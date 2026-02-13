/**
 * Type générique pour toutes les réponses de l'API
 * Le backend encapsule toujours les données dans { success, data }
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}