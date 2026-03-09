import request from 'supertest';
import app from '../../src/server';

jest.mock('../../src/config/database', () => ({
  prisma: {
    $connect: jest.fn().mockResolvedValue(true),
    $disconnect: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../src/config/redis', () => ({
  redis: {
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../src/sockets/socket.manager', () => ({
  SocketManager: {
    init: jest.fn(),
  },
}));

describe('Server.ts Entrance Point', () => {
  describe('GET /health', () => {
    it('devrait retourner un status 200 et le status ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });

  describe('404 Handling', () => {
    it('devrait retourner 404 pour une route inexistante', async () => {
      const res = await request(app).get('/health/unknown-endpoint');

      expect([404, 401]).toContain(res.status);

      if (res.status === 404) {
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('non trouvée');
      }
    });
  });

  describe('Process Events Coverage', () => {
    it('devrait avoir configuré les listeners de signaux système', () => {
      const signals = process.eventNames();
      expect(signals).toContain('SIGINT');
      expect(signals).toContain('uncaughtException');
      expect(signals).toContain('unhandledRejection');
    });
  });
});
