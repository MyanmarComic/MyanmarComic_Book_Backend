import { Router } from 'express';
import { itemController } from '../../controllers/itemController';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/:id', itemController.getItemById);
router.get('/:bookId/items', itemController.getBookItems);

// Protected routes (require authentication)
// router.use(authenticate);
router.post('/', itemController.createItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;
