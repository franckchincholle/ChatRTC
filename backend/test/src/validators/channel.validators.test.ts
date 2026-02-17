import { 
  createChannelValidation, 
  updateChannelValidation, 
  deleteChannelValidation 
} from '../../../src/validators/channel.validator';
import { validationResult } from 'express-validator';

const runValidation = async (validations: any[], data: any, params: any = {}) => {
  const req: any = { 
    body: data,
    params: params
  };
  for (const validation of validations) {
    await validation.run(req);
  }
  return validationResult(req);
};

describe('Channel Validator', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  describe('createChannelValidation', () => {
    it('devrait valider un channel correct', async () => {
      const body = { name: 'general' };
      const params = { serverId: validUUID };
      
      const errors = await runValidation(createChannelValidation, body, params);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait échouer si le serverId n est pas un UUID', async () => {
      const errors = await runValidation(createChannelValidation, { name: 'test' }, { serverId: '123' });
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe("L'ID du serveur doit être un UUID valide");
    });

    it('devrait échouer si le nom contient des caractères spéciaux', async () => {
      const errors = await runValidation(createChannelValidation, { name: 'salon #1' }, { serverId: validUUID });
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('updateChannelValidation', () => {
    it('devrait valider une mise à jour correcte', async () => {
      const errors = await runValidation(updateChannelValidation, { name: 'new-name' }, { id: validUUID });
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait échouer si l ID du channel est manquant ou invalide', async () => {
      const errors = await runValidation(updateChannelValidation, { name: 'name' }, { id: 'invalid' });
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('deleteChannelValidation', () => {
    it('devrait valider une suppression avec un ID valide', async () => {
      const errors = await runValidation(deleteChannelValidation, {}, { id: validUUID });
      expect(errors.isEmpty()).toBe(true);
    });
  });
});