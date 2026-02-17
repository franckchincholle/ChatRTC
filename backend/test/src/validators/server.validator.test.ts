import { createServerValidation } from '../../../src/validators/server.validator';
import { validationResult } from 'express-validator';

const runValidation = async (validations: any[], data: any) => {
  const req: any = { body: data };
  for (const validation of validations) {
    await validation.run(req);
  }
  return validationResult(req);
};

describe('Server Validator', () => {
  it('createServerValidation: devrait valider un nom correct', async () => {
    const errors = await runValidation(createServerValidation, { name: 'Mon Super Serveur' });
    expect(errors.isEmpty()).toBe(true);
  });

  it('createServerValidation: devrait échouer si le nom est manquant ou trop court', async () => {
    // On teste avec une chaîne vide pour être sûr de déclencher .notEmpty() ou .isLength()
    const errors = await runValidation(createServerValidation, { name: '' });
    expect(errors.isEmpty()).toBe(false);
    
    // Teste aussi la limite basse (si ton code impose min: 3, alors 'a' échoue)
    const errorsShort = await runValidation(createServerValidation, { name: 'a' });
    expect(errorsShort.isEmpty()).toBe(false);
  });
});