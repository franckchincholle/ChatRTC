import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { ServerController } from '../../../src/controllers/server.controller';
import { ServerService } from '../../../src/services/server.service';

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  req.user = { 
    id: 'user-123', 
    username: 'testuser', 
    email: 'test@example.com' 
  };
  next();
});

const serverController = new ServerController();

jest.mock('../../../src/services/server.service');
const mockServiceInstance = ServerService.prototype;

app.post('/api/servers', serverController.createServer);
app.get('/api/servers', serverController.getUserServers);
app.get('/api/servers/:id', serverController.getServerById);
app.put('/api/servers/:id', serverController.updateServer);
app.delete('/api/servers/:id', serverController.deleteServer);
app.post('/api/servers/join', serverController.joinServerWithCode);
app.post('/api/servers/:id/invite', serverController.generateInviteCode);

describe('ServerController', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createServer', () => {
    it('devrait créer un serveur et retourner 201', async () => {
      const mockServer = { id: 's1', name: 'Mon Serveur' };
      (mockServiceInstance.createServer as jest.Mock).mockResolvedValue(mockServer);

      const res = await request(app)
        .post('/api/servers')
        .send({ name: 'Mon Serveur' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ success: true, data: mockServer });
      expect(mockServiceInstance.createServer).toHaveBeenCalledWith('user-123', { name: 'Mon Serveur' });
    });

    it('devrait appeler next(error) en cas d échec (Coverage Branches)', async () => {
      (mockServiceInstance.createServer as jest.Mock).mockRejectedValue(new Error('Erreur test'));
      
      const res = await request(app)
        .post('/api/servers')
        .send({ name: 'Fail' });

      expect(res.status).toBeGreaterThanOrEqual(400); 
    });
  });

  describe('getUserServers', () => {
    it('devrait retourner les serveurs de l utilisateur', async () => {
      const mockServers = [{ id: 's1', name: 'S1' }];
      (mockServiceInstance.getUserServers as jest.Mock).mockResolvedValue(mockServers);

      const res = await request(app).get('/api/servers');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockServers);
    });
  });

  describe('updateServer', () => {
    it('devrait mettre à jour le serveur', async () => {
      const updated = { id: 's1', name: 'New Name' };
      (mockServiceInstance.updateServer as jest.Mock).mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/servers/s1')
        .send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('New Name');
    });
  });

  describe('deleteServer', () => {
    it('devrait supprimer le serveur et retourner un message', async () => {
      (mockServiceInstance.deleteServer as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).delete('/api/servers/s1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Server deleted');
    });
  });

  describe('joinServerWithCode', () => {
    it('devrait rejoindre un serveur via un code d invitation', async () => {
      const mockMember = { userId: 'user-123', serverId: 's1' };
      (mockServiceInstance.joinServer as jest.Mock).mockResolvedValue(mockMember);

      const res = await request(app)
        .post('/api/servers/join')
        .send({ inviteCode: 'ABC-123' });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockMember);
    });
  });
});