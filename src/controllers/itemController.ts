import { Request, Response } from 'express';
import { itemService } from '../services/itemService';

export const itemController = {
  async getItemById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const item = await itemService.getItemById(id);
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  },

  async createItem(req: Request, res: Response) {
    try {
      const { book_id, ...restData } = req.body;
      const userId = (req as any).user?.id;
      
      console.log(book_id);
      console.log(restData);
      
      if (!book_id) {
        return res.status(400).json({ error: 'book_id is required' });
      }
      
      const newItem = await itemService.createItem({
        ...restData,
        book_id: Number(book_id), // Ensure it's a number
        created_by: userId
      });
      
      res.status(201).json(newItem);
    } catch (error) {
      console.log('Error creating item:', error);
      res.status(400).json({ error: 'Failed to create item', details: error.message });
    }
  },

  async updateItem(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const userId = (req as any).user?.id;
      
      const updatedItem = await itemService.updateItem(id, {
        ...updateData,
        updated_by: userId
      });
      
      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update item' });
    }
  },

  async deleteItem(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user?.id;
      
      await itemService.deleteItem(id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete item' });
    }
  },

  async getBookItems(req: Request, res: Response) {
    try {
      const bookId = parseInt(req.params.bookId);
      const items = await itemService.getBookItems(bookId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch book items' });
    }
  }
};
