import { PrismaClient } from "@prisma/client";
import { uploadToS3, getPublicUrl } from "./s3Service";
import AdmZip, { IZipEntry } from "adm-zip";
import path from "path";

const prisma = new PrismaClient();

function unzipImages(buffer: Buffer): IZipEntry[] {
  const zip = new AdmZip(buffer);
  return zip.getEntries()
    .filter((e: IZipEntry) => !e.isDirectory && /\.(jpg|jpeg|png)$/i.test(e.entryName))
    .sort((a: IZipEntry, b: IZipEntry) => a.entryName.localeCompare(b.entryName, undefined, { numeric: true }));
}

async function uploadImagesToS3(entries: IZipEntry[], s3Base: string, seriesId: number, chapterId: number) {
  for (const entry of entries) {
    const fileName = path.basename(entry.entryName);
    const key = `${s3Base}${fileName}`;
    
    await uploadToS3(key, await entry.getData(), "image/jpeg");
    const url = getPublicUrl(key);

    await prisma.image.create({
      data: {
        s3Key: key,
        url,
        seriesId,
        chapterId,
      }
    });
  }
}

/**
 * Handles the upload of a chapter, supporting both zip files (containing images) and multiple image files directly.
 * @param seriesTitle The title of the series
 * @param chapter The chapter number or title
 * @param files Array of uploaded files (either a single zip or multiple images)
 */
export const handleChapterUpload = async (
  seriesTitle: string,
  chapter: string | number,
  files: Express.Multer.File[],
  published: string = "true"
) => {
  // Determine if a zip file is present
  let entries: IZipEntry[] = [];
  let imageBuffers: { buffer: Buffer, originalname: string }[] = [];

  if (files.length === 1 && /\.zip$/i.test(files[0].originalname)) {
    // 1. Unzip images
    entries = unzipImages(files[0].buffer);
  } else {
    // Multiple images uploaded directly
    imageBuffers = files.map(f => ({ buffer: f.buffer, originalname: f.originalname }));
  }

  // 2. Ensure series exists in DB
  let series = await prisma.series.findFirst({ where: { title: seriesTitle } });
  if (!series) throw new Error("Series not found");

  // 3. Create chapter in DB if not exists
  let chapterRecord = await prisma.chapter.findFirst({
    where: { title: chapter.toString(), seriesId: series.id }
  });

  if (!chapterRecord) {
    chapterRecord = await prisma.chapter.create({
      data: { 
        title: chapter.toString(), 
        chapterId: Number(chapter), 
        seriesId: series.id, 
        published: published === 'true' ? true : false
      }
    });
  }

  // Update episodes field in Series
  const chapterCount = await prisma.chapter.count({ where: { seriesId: series.id } });
  await prisma.series.update({
    where: { id: series.id },
    data: { episodes: chapterCount }
  });

  // 4. Upload images to S3 and create image records
  const s3Base = `series/${seriesTitle.replace(/\s+/g, '_')}/chapter_${chapter}/`;
  
  if (entries.length > 0) {
    await uploadImagesToS3(entries, s3Base, series.id, Number(chapter));
  } else if (imageBuffers.length > 0) {
    for (const img of imageBuffers) {
      const fileName = img.originalname;
      const key = `${s3Base}${fileName}`;
      await uploadToS3(key, img.buffer, "image/jpeg");
      const url = getPublicUrl(key);
      
      await prisma.image.create({
        data: {
          s3Key: key,
          url,
          seriesId: series.id,
          chapterId: Number(chapter),
        }
      });
    }
  } else {
    throw new Error("No valid images found in upload");
  }
};

export const getChapterNumbersBySeries = async (seriesId: number): Promise<{ chapterId: number, createdAt: Date }[]> => {
  const chapters = await prisma.chapter.findMany({
    where: { seriesId, published: true },
    select: { id: true, chapterId: true, views:true, createdAt: true, published: true },
    orderBy: { chapterId: "asc" }
  });
  return chapters;
};

export const getChapterNumbersBySeriesForAdmin = async (seriesId: number): Promise<{ chapterId: number, createdAt: Date }[]> => {
  const chapters = await prisma.chapter.findMany({
    where: { seriesId },
    select: { id: true, chapterId: true, views:true, createdAt: true, published: true },
    orderBy: { chapterId: "asc" }
  });
  return chapters;
};

export const getImageUrlsBySeriesAndChapter = async (seriesId: number, chapterId: number): Promise<string[]> => {
  const images = await prisma.image.findMany({
    where: { seriesId, chapterId },
    select: { s3Key: true },
    orderBy: { s3Key: "asc" }
  });
  return images.map(img => img.s3Key);
};

/**
 * Updates the publish status of a chapter
 * @param seriesId The ID of the series the chapter belongs to
 * @param chapterId The ID of the chapter to update
 * @param published The new publish status (true for published, false for unpublished)
 * @returns The updated chapter object or null if chapter not found in the specified series
 */
export const updateChapterPublishStatus = async (seriesId: number, chapterId: number, published: boolean) => {
  console.log("SeriesId", seriesId, "ChapterId", chapterId, "Published", published);

  try {
    const updatedChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        seriesId: seriesId // Ensure the chapter belongs to the specified series
      },
      data: { published },
      include: {
        series: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    return updatedChapter;
  } catch (error) {
    // If chapter doesn't exist or doesn't belong to the series, Prisma will throw an error
    return null;
  }
};

/**
 * Deletes a chapter from the specified series
 * @param seriesId The ID of the series the chapter belongs to
 * @param chapterId The ID of the chapter to delete
 * @returns The deleted chapter object or null if chapter not found in the specified series
 */
export const deleteChapter = async (seriesId: number, chapterId: number) => {
  console.log("Deleting chapter - SeriesId:", seriesId, "ChapterId:", chapterId);

  try {
    // First, check if the chapter exists and belongs to the series
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        seriesId: seriesId
      },
      include: {
        series: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!chapter) {
      console.log("Chapter not found or doesn't belong to the specified series");
      return null;
    }

    // Delete all images associated with this chapter
    await prisma.image.deleteMany({
      where: {
        seriesId: seriesId,
        chapterId: chapterId
      }
    });

    // Delete the chapter
    const deletedChapter = await prisma.chapter.delete({
      where: {
        id: chapterId,
        seriesId: seriesId
      },
      include: {
        series: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Update the episodes count in the series
    const remainingChapters = await prisma.chapter.count({
      where: { seriesId: seriesId }
    });

    await prisma.series.update({
      where: { id: seriesId },
      data: { episodes: remainingChapters }
    });

    console.log("Chapter deleted successfully");
    return deletedChapter;
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return null;
  }
};

/**
 * Increments the views count for a chapter by 1.
 * @param seriesId The ID of the series the chapter belongs to
 * @param chapterId The chapterId of the chapter to increment views for
 */
export const incrementChapterViews = async (seriesId: number, chapterId: number): Promise<void> => {
  await prisma.chapter.updateMany({
    where: { seriesId, chapterId },
    data: { views: { increment: 1 } }
  });
};

/**
 * Fetch all chapters from the database
 */
export const getAllChapters = async () => {
  return prisma.chapter.findMany();
};

/**
 * Fetch top 5 most viewed chapters
 */
export const getTopViewedChapters = async () => {
  return prisma.chapter.findMany({
    orderBy: { views: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      views: true,
      chapterId: true,
      series: {
        select: {
          title: true
        }
      }
    }
  });
};