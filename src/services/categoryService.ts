import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateCategoryInput {
  category_name: string;
  category_cover: string;
  category_description?: string;
  created_by?: number;
}

interface UpdateCategoryInput {
  category_name?: string;
  category_cover?: string;
  category_description?: string;
  updated_by?: number;
}

export const categoryService = {
  async getCategories() {
    return prisma.category.findMany({
      where: { deleted_at: null },
      include: { books: true }
    });
  },

  async getCategoryById(id: number) {
    return prisma.category.findUnique({
      where: { id, deleted_at: null },
      include: { 
        books: { 
          where: { deleted_at: null },
          include: { 
            tags: { include: { tag: true } },
            _count: { select: { items: true } }
          }
        } 
      }
    });
  },

  async createCategory(data: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  },

  async updateCategory(id: number, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  },

  async deleteCategory(id: number, deletedBy: number) {
    return prisma.category.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy
      }
    });
  },

  async getCategoryBooks(categoryId: number) {
    return prisma.book.findMany({
      where: { 
        category_id: categoryId,
        deleted_at: null 
      },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { items: true } }
      }
    });
  }
};
