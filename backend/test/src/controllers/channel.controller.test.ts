import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { channelController } from '../../../src/controllers/channel.controller';
import { channelService } from '../../../src/services/channel.service';

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).user = { 
    id: 'user-123', 
    username: 'testuser', 
    email: 'test@example.com' 
  };
  next();
});

jest.mock('../../../src/services/channel.service');

app.post('/api/servers/:serverId/channels', channelController.createChannel.bind(channelController));
app.get('/api/servers/:serverId/channels', channelController.getChannelsByServer.bind(channelController));
app.get('/api/channels/:id', channelController.getChannelById.bind(channelController));
app.put('/api/channels/:id', channelController.updateChannel.bind(channelController));
app.delete('/api/channels/:id', channelController.deleteChannel.bind(channelController));

describe('ChannelController', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/servers/:serverId/channels', () => {
    it('devrait créer un channel et retourner 201', async () => {
      const mockChannel = { id: 'c1', name: 'general', serverId: 's1' };
      (channelService.createChannel as jest.Mock).mockResolvedValue(mockChannel);

      const res = await request(app)
        .post('/api/servers/s1/channels')
        .send({ name: 'general' });

      expect(res.status).toBe(201);
      expect(res.body.data.channel).toEqual(mockChannel);
    });
  });

  describe('GET /api/servers/:serverId/channels', () => {
    it('devrait retourner les channels d un serveur', async () => {
      const mockChannels = [{ id: 'c1', name: 'general' }];
      (channelService.getChannelsByServerId as jest.Mock).mockResolvedValue(mockChannels);

      const res = await request(app).get('/api/servers/s1/channels');
      
      expect(res.status).toBe(200);
      expect(res.body.data.channels).toEqual(mockChannels);
    });
  });

  describe('GET /api/channels/:id', () => {
    it('devrait retourner un channel par son ID', async () => {
      const mockChannel = { id: 'c1', name: 'general' };
      (channelService.getChannelById as jest.Mock).mockResolvedValue(mockChannel);

      const res = await request(app).get('/api/channels/c1');
      
      expect(res.status).toBe(200);
      expect(res.body.data.channel).toEqual(mockChannel);
    });
  });

  describe('PUT /api/channels/:id', () => {
    it('devrait mettre à jour le channel', async () => {
      const updatedChannel = { id: 'c1', name: 'new-name' };
      (channelService.updateChannel as jest.Mock).mockResolvedValue(updatedChannel);

      const res = await request(app)
        .put('/api/channels/c1')
        .send({ name: 'new-name' });

      expect(res.status).toBe(200);
      expect(res.body.data.channel.name).toBe('new-name');
    });
  });

  describe('DELETE /api/channels/:id', () => {
    it('devrait supprimer le channel', async () => {
      (channelService.deleteChannel as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).delete('/api/channels/c1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Channel supprimé avec succès');
    });
  });
});