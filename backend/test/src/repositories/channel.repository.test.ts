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

  it('create: devrait créer un nouveau channel', async () => {
    const channelData = { name: 'annonces', serverId: 's1' };
    (prisma.channel.create as jest.Mock).mockResolvedValue({ id: 'c3', ...channelData });

    await channelRepository.createChannel(channelData as any); 
    
    expect(prisma.channel.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: 'annonces' })
    });
  });

  it('delete: devrait supprimer le channel spécifié', async () => {
    await channelRepository.deleteChannel('c1');
    expect(prisma.channel.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });

  it('deleteChannel: devrait supprimer un channel', async () => {
    await channelRepository.deleteChannel('c1');
    expect(prisma.channel.delete).toHaveBeenCalled();
  });
});