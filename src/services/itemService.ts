import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateItemInput {
  name: string;
  image_link?: string;
  content?: string;
  author?: string;
  book_id: number;
  created_by?: number;
}

interface UpdateItemInput {
  name?: string;
  image_link?: string;
  content?: string;
  author?: string;
  updated_by?: number;
}

export const itemService = {
  async getItemById(id: number) {
    return prisma.item.findUnique({
      where: { id, deleted_at: null },
      include: { 
        book: {
          include: {
            category: true,
            tags: { include: { tag: true } }
          }
        }
      }
    });
  },

  async createItem(data: CreateItemInput) {
    // Update the book's total_items count
    await prisma.book.update({
      where: { id: data.book_id },
      data: {
        total_items: { increment: 1 },
        updated_at: new Date()
      }
    });

    return prisma.item.create({
      data: {
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  },

  async updateItem(id: number, data: UpdateItemInput) {
    return prisma.item.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  },

  async deleteItem(id: number, deletedBy: number) {
    // First get the item to update the book's total_items
    const item = await prisma.item.findUnique({
      where: { id }
    });

    if (!item) return null;

    // Update the book's total_items count
    await prisma.book.update({
      where: { id: item.book_id },
      data: {
        total_items: { decrement: 1 },
        updated_at: new Date()
      }
    });

    return prisma.item.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy
      }
    });
  },

  async getBookItems(bookId: number) {
    return prisma.item.findMany({
      where: { 
        book_id: bookId,
        deleted_at: null 
      },
      orderBy: { created_at: 'asc' }
    });
  }
};
