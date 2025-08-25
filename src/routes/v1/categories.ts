import { Router } from 'express';
import { categoryController } from '../../controllers/categoryController';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/books', categoryController.getCategoryBooks);

// Protected routes (require authentication)
// router.use(authenticate);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
