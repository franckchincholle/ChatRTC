import { requireAdmin } from '../../../src/middlewares/permission.middleware';
import { serverMemberRepository } from '../../../src/repositories/server-member.repository';
import { ForbiddenError } from '../../../src/utils/errors';

jest.mock('../../../src/repositories/server-member.repository');

describe('Permission Middleware', () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = { user: { id: 'u1' }, params: { id: 's1' } };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('requireAdmin: devrait passer si l utilisateur a les privilèges', async () => {
    (serverMemberRepository.isAdminOrOwner as jest.Mock).mockResolvedValue(true);
    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('requireAdmin: devrait lever ForbiddenError si non autorisé', async () => {
    (serverMemberRepository.isAdminOrOwner as jest.Mock).mockResolvedValue(false);
    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});