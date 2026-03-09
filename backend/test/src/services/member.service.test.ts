import { memberService } from '../../../src/services/member.service';
import { serverMemberRepository } from '../../../src/repositories/server-member.repository';
import { ForbiddenError } from '../../../src/utils/errors';

jest.mock('../../../src/repositories/server-member.repository');

describe('MemberService - Branch Coverage', () => {
  const userId = 'u1';
  const serverId = 's1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getServerMembers: devrait retourner les membres si l utilisateur est membre (Branche Succès)', async () => {
    (serverMemberRepository.isMember as jest.Mock).mockResolvedValue(true);

    const mockMembers = [
      {
        userId: 'u2',
        serverId: 's1',
        role: 'MEMBER',
        joinedAt: new Date(),
        user: {
          id: 'u2',
          username: 'testuser',
          email: 'test@example.com',
        },
      },
    ];

    (serverMemberRepository.findByServerId as jest.Mock).mockResolvedValue(
      mockMembers
    );

    const result = await memberService.getServerMembers(userId, serverId);

    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('testuser');
    expect(serverMemberRepository.findByServerId).toHaveBeenCalledWith(
      serverId
    );
  });

  it('getServerMembers: devrait lever ForbiddenError si l utilisateur n est pas membre (Branche Erreur)', async () => {
    (serverMemberRepository.isMember as jest.Mock).mockResolvedValue(false);

    await expect(
      memberService.getServerMembers(userId, serverId)
    ).rejects.toThrow(ForbiddenError);
  });
});
