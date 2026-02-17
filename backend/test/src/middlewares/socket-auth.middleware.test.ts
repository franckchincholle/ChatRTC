import { socketAuthMiddleware } from '../../../src/middlewares/socket-auth.middleware';
import * as jwt from '../../../src/utils/jwt';
import { userRepository } from '../../../src/repositories/user.repository';

jest.mock('../../../src/utils/jwt');
jest.mock('../../../src/repositories/user.repository');

describe('Socket Auth Middleware', () => {
  let socket: any;
  let next: jest.Mock;

  beforeEach(() => {
    socket = {
      handshake: { auth: {}, headers: {} },
      data: {}
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('devrait valider un token correct et injecter userId dans socket.data', async () => {
    socket.handshake.auth.token = 'Bearer valide';
    (jwt.verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'u1' });
    (userRepository.findById as jest.Mock).mockResolvedValue({ id: 'u1' });

    await socketAuthMiddleware(socket, next);

    expect(socket.data.userId).toBe('u1');
    expect(next).toHaveBeenCalledWith();
  });

  it('devrait appeler next avec "Token missing" si aucun token n est fourni', async () => {
    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Authentication error: Token missing');
  });

  it('devrait appeler next avec "Invalid or expired token" en cas d erreur JWT', async () => {
    socket.handshake.auth.token = 'Bearer invalide';
    (jwt.verifyAccessToken as jest.Mock).mockImplementation(() => {
      throw new Error('JWT Error');
    });

    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Authentication error: Invalid or expired token');
  });
});