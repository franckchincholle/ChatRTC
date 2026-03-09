import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { 
  signupValidation, 
  loginValidation, 
  refreshTokenValidation 
} from '../validators/auth.validator';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/signup',
  signupValidation,    
  validate,            
  authController.signup 
);

router.post(
  '/login',
  loginValidation,     
  validate,            
  authController.login 
);

router.post(
  '/refresh',
  refreshTokenValidation, 
  validate,               
  authController.refreshToken 
);

router.post(
  '/logout',
  authenticate,           
  authController.logout   
);

router.get(
  '/me',
  authenticate,              
  authController.getCurrentUser 
);

export default router;