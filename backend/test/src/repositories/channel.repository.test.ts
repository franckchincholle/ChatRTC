import { channelRepository } from '../../../src/repositories/channel.repository';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    channel: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ChannelRepository', () => {
  it('findById: devrait retourner un channel', async () => {
    (prisma.channel.findUnique as jest.Mock).mockResolvedValue({ id: 'c1', name: 'general' });
    const result = await channelRepository.findById('c1');
    expect(result?.id).toBe('c1');
  });

  it('findByServerId: devrait retourner la liste des channels', async () => {
    (prisma.channel.findMany as jest.Mock).mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
    const result = await channelRepository.findByServerId('s1');
    expect(result).toHaveLength(2);
  });
});