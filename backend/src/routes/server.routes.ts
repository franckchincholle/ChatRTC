import { Router } from 'express';
import { ServerController } from '../controllers/server.controller';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createServerValidation, joinServerValidation, updateMemberRoleValidation, updateServerValidation } from '../validators/server.validator';

const router = Router();
const serverController = new ServerController();

// authentication
router.use(authenticate);


// server routes

// create server
router.post('/', createServerValidation, validate, (req, res, next) => serverController.createServer(req as AuthenticatedRequest, res, next));
// get user servers
router.get('/', (req, res, next) => serverController.getUserServers(req as any, res, next));
// join server
router.post('/join', joinServerValidation, validate, (req, res, next) => serverController.joinServerWithCode(req as any, res, next));


// actions on specific server

// get server by id
router.get('/:id', (req, res, next) => serverController.getServerById(req as any, res, next));
// update server
router.put('/:id', updateServerValidation, validate, (req, res, next) => serverController.updateServer(req as any, res, next));
// delete server
router.delete('/:id', (req, res, next) => serverController.deleteServer(req as any, res, next));


// server member management

// list members
router.get('/:id/members', (req, res, next) => serverController.getServerMembers(req as any, res, next));
// leave server
router.delete('/:id/leave', (req, res, next) => serverController.leaveServer(req as any, res, next));
// generate invite code
router.post('/:id/invite', (req, res, next) => serverController.generateInviteCode(req as any, res, next));
// update member role
router.put('/:id/members/:userId', updateMemberRoleValidation, validate, (req, res, next) => serverController.updateMemberRole(req as any, res, next));


export default router;