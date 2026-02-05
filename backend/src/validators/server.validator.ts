// Validateurs pour Server
// Schémas de validation (Zod ou Joi)

// TODO: Validation schemas
// - createServerSchema
// - updateServerSchema
// - joinServerSchema
// - updateMemberRoleSchema

export const createServerSchema = {
  // name: string, min 2, max 50
};

export const updateServerSchema = {
  // name?: string, min 2, max 50
};

export const joinServerSchema = {
  // inviteCode: string, min 6
};

export const updateMemberRoleSchema = {
  // role: 'admin' | 'member'
};