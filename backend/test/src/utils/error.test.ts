import { BadRequestError, UnauthorizedError, ForbiddenError, ConflictError } from '../../../src/utils/errors';

describe('Custom Errors', () => {
  it('devrait créer des erreurs avec les bons status codes', () => {
    expect(new BadRequestError('err').statusCode).toBe(400);
    expect(new UnauthorizedError('err').statusCode).toBe(401);
    expect(new ForbiddenError('err').statusCode).toBe(403);
    expect(new ConflictError('err').statusCode).toBe(409);
  });
});