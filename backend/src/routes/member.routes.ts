import { Router } from 'express';
import { memberController } from '../controllers/member.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// GET /servers/:serverId/members
router.get('/servers/:serverId/members', memberController.getServerMembers);

export default router;