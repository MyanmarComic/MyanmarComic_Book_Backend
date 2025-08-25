import { Request, Response } from 'express';
import { tagService } from '../services/tagService';

export const tagController = {
  async createTag(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const userId = (req as any).user?.id; // Get user ID from auth middleware
      
      if (!name) {
        return res.status(400).json({ error: 'Tag name is required' });
      }
      
      const tag = await tagService.createTag(name, userId);
      res.status(201).json(tag);
    } catch (error) {
      if (error.code === 'P2002') { // Prisma unique constraint error
        return res.status(409).json({ error: 'Tag with this name already exists' });
      }
      res.status(500).json({ error: 'Failed to create tag' });
    }
  },

  async getTags(req: Request, res: Response) {
    try {
      const tags = await tagService.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  },

  async getTagById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const tag = await tagService.getTagById(id);
      
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      
      res.json(tag);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tag' });
    }
  },
};
