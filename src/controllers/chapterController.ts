import { Request, Response } from "express";
import { handleChapterUpload, getChapterNumbersBySeries, getImageUrlsBySeriesAndChapter, updateChapterPublishStatus, deleteChapter, incrementChapterViews, getAllChapters, getTopViewedChapters, getChapterNumbersBySeriesForAdmin } from "../services/chapterService";

/**
 * Handles chapter upload. Accepts either a zip file containing images or multiple image files directly.
 * @param req Express request object
 * @param res Express response object
 */
export const uploadChapterHandler = async (req: Request, res: Response): Promise<void> => {
  const { seriesTitle, chapter, published } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!seriesTitle || !chapter || !files || files.length === 0) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  try {
    await handleChapterUpload(seriesTitle, chapter, files as any, published);
    res.status(201).json({ message: "Chapter uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload chapter", error });
  }
};

export const getChapterNumbersBySeriesHandler = async (req: Request, res: Response): Promise<void> => {
  const seriesId = parseInt(req.params.seriesId);
  if (isNaN(seriesId)) {
    res.status(400).json({ success: false, message: "Invalid seriesId" });
    return;
  }
  try {
    const numbers = await getChapterNumbersBySeries(seriesId);
    res.status(200).json({ success: true, chapters: numbers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch chapter numbers" });
  }
};

export const getChapterNumbersBySeriesHandlerForAdmin = async (req: Request, res: Response): Promise<void> => {
  const seriesId = parseInt(req.params.seriesId);
  if (isNaN(seriesId)) {
    res.status(400).json({ success: false, message: "Invalid seriesId" });
    return;
  }
  try {
    const numbers = await getChapterNumbersBySeriesForAdmin(seriesId);
    res.status(200).json({ success: true, chapters: numbers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch chapter numbers" });
  }
};

export const getImageUrlsBySeriesAndChapterHandler = async (req: Request, res: Response): Promise<void> => {
  const seriesId = parseInt(req.query.seriesId as string);
  const chapterId = parseInt(req.query.chapterId as string);
  if (isNaN(seriesId) || isNaN(chapterId)) {
    res.status(400).json({ success: false, message: "Invalid seriesId or chapterId" });
    return;
  }
  try {
    const images = await getImageUrlsBySeriesAndChapter(seriesId, chapterId); 
    if (!images || images.length === 0) {
      res.status(404).json({ success: false, message: "No images found for this chapter" });
      return;
    }
    // Increment the view count for this chapter
    await incrementChapterViews(seriesId, chapterId);
    res.status(200).json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
};

/**
 * Updates the publish status of a chapter
 * @param req Express request object containing chapterId and published status
 * @param res Express response object
 */
export const updateChapterPublishHandler = async (req: Request, res: Response): Promise<void> => {
  const seriesId = parseInt(req.params.seriesId);
  const chapterId = parseInt(req.params.chapterId);
  const { published } = req.body;

  if (isNaN(seriesId)) {
    res.status(400).json({ success: false, message: "Invalid seriesId" });
    return;
  }

  if (isNaN(chapterId)) {
    res.status(400).json({ success: false, message: "Invalid chapterId" });
    return;
  }

  if (typeof published !== 'boolean') {
    res.status(400).json({ success: false, message: "Published status must be a boolean value" });
    return;
  }

  try {
    const updatedChapter = await updateChapterPublishStatus(seriesId, chapterId, published);
    if (!updatedChapter) {
      res.status(404).json({ success: false, message: "Chapter not found in the specified series" });
      return;
    }
    res.status(200).json({
      success: true,
      message: `Chapter ${published ? 'published' : 'unpublished'} successfully`,
      chapter: updatedChapter
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update chapter publish status" });
  }
};

/**
 * Deletes a chapter from the specified series
 * @param req Express request object containing seriesId and chapterId
 * @param res Express response object
 */
export const deleteChapterHandler = async (req: Request, res: Response): Promise<void> => {
  const seriesId = parseInt(req.params.seriesId);
  const chapterId = parseInt(req.params.chapterId);

  if (isNaN(seriesId)) {
    res.status(400).json({ success: false, message: "Invalid seriesId" });
    return;
  }

  if (isNaN(chapterId)) {
    res.status(400).json({ success: false, message: "Invalid chapterId" });
    return;
  }

  try {
    const deletedChapter = await deleteChapter(seriesId, chapterId);
    if (!deletedChapter) {
      res.status(404).json({ success: false, message: "Chapter not found in the specified series" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Chapter deleted successfully",
      chapter: deletedChapter
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete chapter" });
  }
};

/**
 * Fetch all chapters
 */
export const getAllChaptersHandler = async (req: Request, res: Response) => {
  try {
    const chapters = await getAllChapters();
    res.status(200).json({ success: true, data: chapters });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch chapters" });
  }
};

/**
 * Fetch top 5 most viewed chapters
 */
export const getTopViewedChaptersHandler = async (req: Request, res: Response) => {
  try {
    const chapters = await getTopViewedChapters();
    res.status(200).json({ success: true, data: chapters });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch top viewed chapters" });
  }
};