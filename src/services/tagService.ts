import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const tagService = {
  async createTag(name: string, userId?: number) {
    return prisma.tag.create({
      data: {
        name,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),  // Add this line
        updated_at: new Date()   // Add this line
      },
    });
  },

  async getTagById(id: number) {
    return prisma.tag.findUnique({
      where: { id },
    });
  },

  async getTags() {
    return prisma.tag.findMany({
      where: { deleted_at: null },
    });
  },
};
