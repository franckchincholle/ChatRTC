import { Router } from 'express';
import { ServerController } from '../controllers/server.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createServerValidation, joinServerValidation, updateMemberRoleValidation, updateServerValidation } from '../validators/server.validator';

const router = Router();
const serverController = new ServerController();

// authentication
router.use(authenticate);


// server routes

// create server
router.post('/', createServerValidation, validate, serverController.createServer);
// get user servers
router.get('/', serverController.getUserServers);
// join server
router.post('/join', joinServerValidation, validate, serverController.joinServerWithCode);


// actions on specific server

// get server by id
router.get('/:id', serverController.getServerById);
// update server
router.put('/:id', updateServerValidation, validate, serverController.updateServer);
// delete server
router.delete('/:id', serverController.deleteServer);


// server member management

// list members
router.get('/:id/members', serverController.getServerMembers);
// leave server
router.delete('/:id/leave', serverController.leaveServer);
// generate invite code
router.post('/:id/invite', serverController.generateInviteCode);
// update member role
router.put('/:id/members/:userId', updateMemberRoleValidation, validate, serverController.updateMemberRole);


export default router;