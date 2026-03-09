import request from 'supertest';
import express from 'express';
import { authController } from '../../../src/controllers/auth.controller';
import { authService } from '../../../src/services/auth.service';

const app = express();
app.use(express.json());

app.post('/auth/signup', (req, res, next) => authController.signup(req, res, next));
app.post('/auth/login', (req, res, next) => authController.login(req, res, next));
app.post('/auth/refresh', (req, res, next) => authController.refreshToken(req, res, next));

jest.mock('../../../src/services/auth.service');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('devrait retourner 200 et les tokens dans l objet data', async () => {
      const mockResult = { 
        accessToken: 'at', 
        refreshToken: 'rt', 
        user: { id: 'u1', email: 'test@t.com' } 
      };
      (authService.login as jest.Mock).mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@t.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Connexion réussie');

      expect(res.body.data).toMatchObject({
        accessToken: 'at',
        refreshToken: 'rt'
      });
    });

    it('devrait passer l erreur au middleware next en cas d échec', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('Auth failed'));

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@t.com', password: 'password123' });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /auth/signup', () => {
    it('devrait retourner 201 après une inscription réussie', async () => {
      const mockResult = { id: 'u1', username: 'newuser' };
      (authService.signup as jest.Mock).mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/auth/signup')
        .send({ username: 'newuser', email: 'test@t.com', password: 'Password123!' });

      expect(res.status).toBe(201);
      expect(res.body.data).toEqual(mockResult);
    });
  });

  describe('POST /auth/refresh', () => {
    it('devrait retourner un nouveau access token', async () => {
      const mockResult = { accessToken: 'new_at' };
      (authService.refreshAccessToken as jest.Mock).mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'valid_rt' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBe('new_at');
    });
  });
});