import { messageRepository } from '../../../src/repositories/message.repository';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    message: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('MessageRepository', () => {
  it('create: devrait enregistrer un message', async () => {
    const data = { content: 'Hi', channelId: 'c1', userId: 'u1' };
    (prisma.message.create as jest.Mock).mockResolvedValue({
      id: 'm1',
      ...data,
    });

    await messageRepository.create(data);

    expect(prisma.message.create).toHaveBeenCalledWith({
      data: data,
      include: expect.any(Object),
    });
  });

  it('findByChannelId: devrait lister les messages d un salon', async () => {
    (prisma.message.findMany as jest.Mock).mockResolvedValue([]);
    await messageRepository.findByChannelId('c1');
    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { channelId: 'c1' } })
    );
  });

  it('findById: devrait trouver un message par son ID', async () => {
    (prisma.message.findUnique as jest.Mock).mockResolvedValue({ id: 'm1' });
    await messageRepository.findById('m1');
    expect(prisma.message.findUnique).toHaveBeenCalled();
  });

  it('delete: devrait supprimer un message', async () => {
    await messageRepository.delete('m1');
    expect(prisma.message.delete).toHaveBeenCalled();
  });
});
