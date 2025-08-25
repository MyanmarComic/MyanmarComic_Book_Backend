import { Router } from 'express';
import { login, refreshTokenController, logout } from '../../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/refresh-token', refreshTokenController);
router.post('/logout', logout);

export default router;
