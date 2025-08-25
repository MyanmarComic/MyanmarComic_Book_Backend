import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService';

export const categoryController = {
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await categoryService.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  async getCategoryById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const category = await categoryService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  },

  async createCategory(req: Request, res: Response) {
    try {
      const categoryData = req.body;
      const userId = (req as any).user?.id;
      
      const newCategory = await categoryService.createCategory({
        ...categoryData,
        created_by: userId
      });
      
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create category' });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const userId = (req as any).user?.id;
      
      const updatedCategory = await categoryService.updateCategory(id, {
        ...updateData,
        updated_by: userId
      });
      
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update category' });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user?.id;
      
      await categoryService.deleteCategory(id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete category' });
    }
  },

  async getCategoryBooks(req: Request, res: Response) {
    try {
      const categoryId = parseInt(req.params.id);
      const books = await categoryService.getCategoryBooks(categoryId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category books' });
    }
  }
};
