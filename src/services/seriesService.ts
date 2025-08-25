import { PrismaClient, Series } from "@prisma/client";
import { uploadToS3, getPublicUrl } from "./s3Service";

const prisma = new PrismaClient();

export const getAllSeries = async (page: number = 1, pageSize: number = 10) => {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    prisma.series.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      where: { published: true }
    }),
    prisma.series.count({ where: { published: true } }),
  ]);
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const getAllSeriesForAdmin = async (page: number = 1, pageSize: number = 10) => {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    prisma.series.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.series.count(),
  ]);
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const createSeries = async (seriesData: Omit<Series, "id" | "createdAt" | "updatedAt">) => {
  try {
    const parsedSeriesData = {
      ...seriesData,
      episodes: parseInt(seriesData.episodes.toString()),
      rating: parseFloat(seriesData.rating.toString()),
      likes: seriesData.likes ? parseInt(seriesData.likes.toString()) : 0,
      views: seriesData.views ? parseInt(seriesData.views.toString()) : 0,
      published:
        typeof seriesData.published === "string"
          ? seriesData.published === "true"
          : !!seriesData.published,
    };
    return await prisma.series.create({ data: parsedSeriesData });
  } catch (error) {
    throw { status: 500, message: 'Error creating series', originalError: error };
  }
};

export const createSeriesWithImage = async (seriesData: Omit<Series, "id" | "createdAt" | "updatedAt">, file: Express.Multer.File) => {
  try {
    let coverImageKey, coverImageUrl;
    if (file) {
      const seriesName = seriesData.title.replace(/\s+/g, '_');
      const key = `series/${seriesName}/cover/${Date.now()}_coverimage.jpg`;
      await uploadToS3(key, file.buffer, file.mimetype);
      coverImageKey = key;
      coverImageUrl = getPublicUrl(key);
    }
    const created = await createSeries({ ...seriesData, coverImageKey: coverImageKey as string });
    return { ...created, coverImageUrl };
  } catch (error) {
    throw { status: 500, message: 'Error creating series with image', originalError: error };
  }
};

export const getSeriesById = async (id: number) => {
  return prisma.series.findUnique({ where: { id } });
};

export const updateSeries = async (
  id: number,
  updateData: Partial<Omit<Series, "id" | "createdAt" | "updatedAt">>,
  file?: Express.Multer.File
) => {
  try {
    let coverImageKey, coverImageUrl;

    if (file) {
      const seriesName = updateData.title?.replace(/\s+/g, '_') || `series_${id}`;
      const key = `series/${seriesName}/cover/${Date.now()}_coverimage.jpg`;
      await uploadToS3(key, file.buffer, file.mimetype);
      coverImageKey = key;
      coverImageUrl = getPublicUrl(key);
    }

    // Prepare the update object
    const updateObj: any = {
      ...updateData,
    };
    if (coverImageKey) {
      updateObj.coverImageKey = coverImageKey;
    }

    // Convert string fields to correct types
    if (updateObj.episodes !== undefined) updateObj.episodes = parseInt(updateObj.episodes as any);
    if (updateObj.rating !== undefined) updateObj.rating = parseFloat(updateObj.rating as any);
    if (updateObj.likes !== undefined) updateObj.likes = parseInt(updateObj.likes as any);
    if (updateObj.views !== undefined) updateObj.views = parseInt(updateObj.views as any);
    if (updateObj.published !== undefined) updateObj.published = updateObj.published === "true" || updateObj.published === true || updateObj.published === 1 || updateObj.published === "1";


    // Update the series in the database
    const updated = await prisma.series.update({
      where: { id },
      data: updateObj,
    });

    // Optionally, return the coverImageUrl in the response
    return updated;
  } catch (error) {
    console.error("Error in updateSeries:", error);
    throw error; // rethrow so the controller can handle it
  }
};

export const deleteSeries = async (id: number) => {
  return prisma.series.delete({ where: { id } });
};

export const getMostReadSeries = async (limit: number = 5) => {
  return prisma.series.findMany({
    orderBy: [
      { views: "desc" },
      { likes: "desc" }
    ],
    where: { published: true },
    take: limit
  });
};

export const searchSeriesByName = async (name: string) => {
  return prisma.series.findMany({
    where: {
      title: {
        contains: name,
      },
      published: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateSeriesEpisodes = async (seriesId: number) => {
  const chapterCount = await prisma.chapter.count({ where: { seriesId } });
  return prisma.series.update({
    where: { id: seriesId },
    data: { episodes: chapterCount },
  });
};

/**
 * シリーズの閲覧数（view count）を1増やす関数
 * @param id シリーズID
 * @returns 更新後のシリーズデータ
 */
export const incrementSeriesViewCount = async (id: number) => {
  return prisma.series.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}; 

export const getSeriesWithRecentChapters = async (days: number = 2, page: number = 1, pageSize: number = 10) => {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  const skip = (page - 1) * pageSize;

  // First, get the total count of series with recent chapters
  const total = await prisma.series.count({
    where: {
      published: true,
      chapters: {
        some: {
          createdAt: { gte: dateThreshold },
          updatedAt: { gte: dateThreshold },
          published: true
        }
      }
    }
  });

  // Then get the paginated series with their recent chapters
  const recentSeries = await prisma.series.findMany({
    where: {
      published: true,
      chapters: {
        some: {
          createdAt: { gte: dateThreshold },
          updatedAt: { gte: dateThreshold },
          published: true
        }
      }
    },
    include: {
      chapters: {
        where: {
          createdAt: { gte: dateThreshold },
          updatedAt: { gte: dateThreshold },
          published: true
        },
        orderBy: { createdAt: 'asc' },
        take: 2,
        select: {
          id: true,
          title: true,
          chapterId: true,
          createdAt: true
        }
      }
    },
    orderBy: { createdAt: 'asc' },
    skip,
    take: pageSize
  });

  // Filter series to only include those with at least 2 recent chapters
  const filteredSeries = recentSeries.filter(series => series.chapters.length >= 2);

  return {
    data: filteredSeries.map(series => ({
      ...series,
      chapters: series.chapters.slice(0, 2)
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};