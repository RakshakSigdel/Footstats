import { Router } from 'express';
const router= Router();
import { register, login } from '../controllers/authController';

//POST api/auth/register
router.post('/register',register);

//POST api/auth/login
router.post('/login',login);

export default router;