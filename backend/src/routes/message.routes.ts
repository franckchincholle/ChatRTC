import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/',              messageController.sendMessage);
router.get('/',               messageController.getMessages);
router.put('/:messageId',     messageController.updateMessage);
router.delete('/:messageId',  messageController.deleteMessage);

export default router;