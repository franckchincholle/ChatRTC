import request from 'supertest';
import express from 'express';
import { memberController } from '../../../src/controllers/member.controller';
import { memberService } from '../../../src/services/member.service';

const app = express();
app.use(express.json());

app.use((req: any, res: any, next: any) => {
  req.user = { id: 'user-123' };
  next();
});

jest.mock('../../../src/services/member.service');

app.get(
  '/api/servers/:serverId/members',
  memberController.getServerMembers.bind(memberController)
);

describe('MemberController', () => {
  it('getServerMembers: devrait retourner 200 et la liste des membres', async () => {
    const mockMembers = [{ id: 'm1', user: { username: 'test' } }];
    (memberService.getServerMembers as jest.Mock).mockResolvedValue(
      mockMembers
    );

    const res = await request(app).get('/api/servers/s1/members');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.members).toEqual(mockMembers);
    expect(memberService.getServerMembers).toHaveBeenCalledWith(
      'user-123',
      's1'
    );
  });

  it('getServerMembers: devrait passer l erreur au middleware next', async () => {
    (memberService.getServerMembers as jest.Mock).mockRejectedValue(
      new Error('DB Error')
    );
    const res = await request(app).get('/api/servers/s1/members');
    expect(res.status).toBe(500);
  });
});
