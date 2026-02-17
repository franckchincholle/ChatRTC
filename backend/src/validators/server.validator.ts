import { body } from 'express-validator';

export const createServerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Server name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Server name must be between 2 and 50 characters'),
];

export const joinServerValidation = [
  body('inviteCode')
    .trim()
    .notEmpty()
    .withMessage('Invite code is required')
    .isLength({ min: 8, max: 8})
    .withMessage('Invite code must be exactly 8 characters'),
]

export const updateMemberRoleValidation = [
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['ADMIN', 'MEMBER'])
    .withMessage('Role must be either ADMIN or MEMBER'),
]

export const updateServerValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Server name must be between 2 and 50 characters'),
]
