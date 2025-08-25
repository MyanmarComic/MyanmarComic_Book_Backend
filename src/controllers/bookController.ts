import { Request, Response } from 'express';
import { bookService } from '../services/bookService';

export const bookController = {
  async getBooks(req: Request, res: Response) {
    try {
      const books = await bookService.getBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  },

  async getBookById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const book = await bookService.getBookById(id);
      
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch book' });
    }
  },

  async createBook(req: Request, res: Response) {
    try {
      const { tags, ...bookData } = req.body;
      console.log(tags);
      console.log(bookData);
      
      const userId = (req as any).user?.id; // Assuming you have user info in request
      
      const newBook = await bookService.createBook({
        ...bookData,
        created_by: userId
      }, tags || []);
      
      res.status(201).json(newBook);
    } catch (error) {
      console.log(error);
      
      res.status(400).json({ error: 'Failed to create book' });
    }
  },

  async updateBook(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const userId = (req as any).user?.id;
      
      const updatedBook = await bookService.updateBook(id, {
        ...updateData,
        updated_by: userId
      });
      
      res.json(updatedBook);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update book' });
    }
  },

  async deleteBook(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user?.id;
      
      await bookService.deleteBook(id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete book' });
    }
  },

  async addTag(req: Request, res: Response) {
    try {
      const bookId = parseInt(req.params.id);
      const { tagId } = req.body;
      const userId = (req as any).user?.id;
      
      const result = await bookService.addTag(bookId, tagId, userId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: 'Failed to add tag' });
    }
  },

  async removeTag(req: Request, res: Response) {
    try {
      const bookId = parseInt(req.params.id);
      const { tagId } = req.params;
      
      await bookService.removeTag(bookId, parseInt(tagId));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to remove tag' });
    }
  },

  async getBookItemCount(req: Request, res: Response) {
    try {
      const bookId = parseInt(req.params.id);
      const count = await bookService.getBookItemCount(bookId);
      res.json(count);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get item count' });
    }
  }
};
