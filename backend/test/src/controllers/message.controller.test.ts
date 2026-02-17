import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { messageController } from '../../../src/controllers/message.controller';
import { messageService } from '../../../src/services/message.service';

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

jest.mock('../../../src/services/message.service');

app.post('/api/messages', messageController.sendMessage.bind(messageController));
app.get('/api/channels/:channelId/messages', messageController.getMessages.bind(messageController));
app.delete('/api/messages/:messageId', messageController.deleteMessage.bind(messageController));

describe('MessageController', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('devrait envoyer un message et retourner 201', async () => {
      const mockMessage = { id: 'm1', content: 'Hello World', userId: 'user-123', channelId: 'c1' };
      (messageService.sendMessage as jest.Mock).mockResolvedValue(mockMessage);

      const res = await request(app)
        .post('/api/messages')
        .send({ channelId: 'c1', content: 'Hello World' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockMessage);
      expect(messageService.sendMessage).toHaveBeenCalledWith('user-123', 'c1', 'Hello World');
    });

    it('devrait passer l erreur au middleware next en cas d échec', async () => {
      (messageService.sendMessage as jest.Mock).mockRejectedValue(new Error('Service error'));
      
      const res = await request(app)
        .post('/api/messages')
        .send({ channelId: 'c1', content: 'Fail' });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('getMessages', () => {
    it('devrait retourner les messages d un channel', async () => {
      const mockMessages = [{ id: 'm1', content: 'Hello' }];
      (messageService.getChannelMessages as jest.Mock).mockResolvedValue(mockMessages);

      const res = await request(app).get('/api/channels/c1/messages');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockMessages);
      expect(messageService.getChannelMessages).toHaveBeenCalledWith('user-123', 'c1');
    });
  });

  describe('deleteMessage', () => {
    it('devrait supprimer un message avec succès', async () => {
      (messageService.deleteMessage as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).delete('/api/messages/m1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Message deleted successfully');
      expect(messageService.deleteMessage).toHaveBeenCalledWith('user-123', 'm1');
    });
  });
});