import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateBookInput {
  name: string;
  image_link: string;
  description?: string;
  author?: string;
  category_id: number;
  created_by?: number;
}

interface UpdateBookInput {
  name?: string;
  image_link?: string;
  description?: string;
  author?: string;
  category_id?: number;
  updated_by?: number;
}

export const bookService = {
  async getBooks() {
    return prisma.book.findMany({
      where: { deleted_at: null },
      include: { category: true, tags: { include: { tag: true } } }
    });
  },

  async getBookById(id: number) {
    return prisma.book.findUnique({
      where: { id, deleted_at: null },
      include: { 
        category: true, 
        items: { where: { deleted_at: null } },
        tags: { include: { tag: true } }
      }
    });
  },

  async createBook(data: CreateBookInput, tags: number[] = []) {
    return prisma.book.create({
      data: {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
        tags: {
          create: tags.map(tagId => ({
            tag: { connect: { id: tagId } },
            assigned_by: data.created_by,
            assigned_at: new Date()
          }))
        }
      },
      include: {
        tags: { include: { tag: true } },
        category: true
      }
    });
  },

  async updateBook(id: number, data: UpdateBookInput) {
    return prisma.book.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  },

  async deleteBook(id: number, deletedBy: number) {
    return prisma.book.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy
      }
    });
  },

  async getBookItemCount(bookId: number) {
    const items = await prisma.item.findMany({
      where: { 
        book_id: bookId,
        deleted_at: null 
      },
      select: {
        id: true
      }
    });
    return { 
      count: items.length,
      itemIds: items.map(item => item.id)
    };
  },

  async addTag(bookId: number, tagId: number, userId: number) {
    return prisma.bookTag.create({
      data: {
        book_id: bookId,
        tag_id: tagId,
        assigned_by: userId,
        assigned_at: new Date()
      }
    });
  },

  async removeTag(bookId: number, tagId: number) {
    return prisma.bookTag.delete({
      where: {
        book_id_tag_id: {
          book_id: bookId,
          tag_id: tagId
        }
      }
    });
  }
};
