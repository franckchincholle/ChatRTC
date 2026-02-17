import { Router } from 'express';
import { ServerController } from '../controllers/server.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createServerValidation, joinServerValidation, updateMemberRoleValidation, updateServerValidation } from '../validators/server.validator';

const router = Router();
const serverController = new ServerController();

router.use(authenticate);

router.post('/', createServerValidation, validate, serverController.createServer);
router.get('/', serverController.getUserServers);
router.post('/join', joinServerValidation, validate, serverController.joinServerWithCode);

router.get('/:id', serverController.getServerById);
router.put('/:id', updateServerValidation, validate, serverController.updateServer);
router.delete('/:id', serverController.deleteServer);


router.get('/:id/members', serverController.getServerMembers);
router.delete('/:id/leave', serverController.leaveServer);
router.post('/:id/invite', serverController.generateInviteCode);
router.put('/:id/members/:userId', updateMemberRoleValidation, validate, serverController.updateMemberRole);


export default router;