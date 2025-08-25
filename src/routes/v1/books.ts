import { Router } from 'express';
import { bookController } from '../../controllers/bookController';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);
router.get('/:id/item-count', bookController.getBookItemCount);

// Protected routes (require authentication)
router.post('/', bookController.createBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);
router.post('/:id/tags', bookController.addTag);
router.delete('/:id/tags/:tagId', bookController.removeTag);

export default router;
