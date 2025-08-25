import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const tagService = {
  async createTag(name: string, userId?: number) {
    return prisma.tag.create({
      data: {
        name,
        created_by: userId,
        updated_by: userId,
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
