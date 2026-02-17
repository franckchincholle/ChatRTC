import { Router } from 'express';
import { channelController } from '../controllers/channel.controller';
import {
  createChannelValidation,
  getChannelsByServerValidation,
  getChannelByIdValidation,
  updateChannelValidation,
  deleteChannelValidation,
} from '../validators/channel.validator';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/servers/:serverId/channels',
  authenticate,                 
  createChannelValidation,      
  validate,                     
  channelController.createChannel
);

router.get(
  '/servers/:serverId/channels',
  authenticate,                      
  getChannelsByServerValidation,     
  validate,                          
  channelController.getChannelsByServer 
);

router.get(
  '/channels/:id',
  authenticate,                   
  getChannelByIdValidation,       
  validate,                       
  channelController.getChannelById 
);

router.put(
  '/channels/:id',
  authenticate,                
  updateChannelValidation,     
  validate,                    
  channelController.updateChannel 
);

router.delete(
  '/channels/:id',
  authenticate,                
  deleteChannelValidation,    
  validate,                    
  channelController.deleteChannel 
);

export default router;