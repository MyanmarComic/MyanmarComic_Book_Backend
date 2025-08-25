import { Router } from 'express';
import { tagController } from '../../controllers/tagController';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/', tagController.getTags);
router.get('/:id', tagController.getTagById);

// Protected routes (require authentication)
router.post('/', tagController.createTag);

// Future protected routes can be added here
// router.put('/:id', tagController.updateTag);
// router.delete('/:id', tagController.deleteTag);

export default router;
