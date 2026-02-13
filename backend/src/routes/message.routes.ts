import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// authentication
router.use(authenticate);

// message routes
router.post('/', messageController.sendMessage);
router.get('/channel/:channelId', messageController.getMessages);

export default router;