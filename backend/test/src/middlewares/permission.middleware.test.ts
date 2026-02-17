import { requireAdmin, requireOwner, requireMember } from '../../../src/middlewares/permission.middleware';
import { serverMemberRepository } from '../../../src/repositories/server-member.repository';
import { ForbiddenError } from '../../../src/utils/errors';

jest.mock('../../../src/repositories/server-member.repository');

describe('Permission Middleware - Branch Coverage', () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = { user: { id: 'u1' }, params: { id: 's1' } };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireOwner', () => {
    it('devrait appeler next() si l utilisateur est owner', async () => {
      (serverMemberRepository.isOwner as jest.Mock).mockResolvedValue(true);
      await requireOwner(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('devrait appeler next(ForbiddenError) si l utilisateur n est pas owner', async () => {
      (serverMemberRepository.isOwner as jest.Mock).mockResolvedValue(false);
      await requireOwner(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('requireAdmin', () => {
    it('devrait appeler next() si l utilisateur est admin/owner', async () => {
      (serverMemberRepository.isAdminOrOwner as jest.Mock).mockResolvedValue(true);
      await requireAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('devrait appeler next(ForbiddenError) si l utilisateur n a pas les privilèges', async () => {
      (serverMemberRepository.isAdminOrOwner as jest.Mock).mockResolvedValue(false);
      await requireAdmin(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('requireMember', () => {
    it('devrait appeler next(ForbiddenError) si l utilisateur n est pas membre', async () => {
      (serverMemberRepository.isMember as jest.Mock).mockResolvedValue(false);
      await requireMember(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});