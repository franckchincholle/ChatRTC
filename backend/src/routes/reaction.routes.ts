import { Router } from 'express';
import { reactionController } from '../controllers/reaction.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

// POST /channels/:channelId/messages/:messageId/reactions
router.post('/', reactionController.toggleReaction);

export default router;