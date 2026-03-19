import { Router } from 'express';
import { memberController } from '../controllers/member.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdminInServer } from '../middlewares/permission.middleware';

const router = Router();

router.use(authenticate);

// Lecture
router.get('/servers/:serverId/members', memberController.getServerMembers);

// Actions de modération (admin ou owner requis)
router.delete('/servers/:serverId/members/:userId/kick', requireAdminInServer, memberController.kickMember);
router.post('/servers/:serverId/members/:userId/ban',    requireAdminInServer, memberController.banMember);
router.delete('/servers/:serverId/members/:userId/ban',  requireAdminInServer, memberController.unbanMember);

export default router;