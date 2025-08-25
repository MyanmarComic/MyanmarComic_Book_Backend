import { Request, Response } from "express";
import {
  getAllSeries,
  getSeriesById,
  updateSeries,
  deleteSeries,
  createSeriesWithImage,
  getMostReadSeries,
  searchSeriesByName,
  updateSeriesEpisodes,
  incrementSeriesViewCount,
  getAllSeriesForAdmin,
  getSeriesWithRecentChapters,
} from "../services/seriesService";

export const getSeries = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const result = await getAllSeries(page, pageSize);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch series" });
  }
};

export const getSeriesForAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 100;
    const result = await getAllSeriesForAdmin(page, pageSize);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch series" });
  }
};

export const createSeriesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await createSeriesWithImage(req.body, req.file as Express.Multer.File);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: "Failed to create series" });
  }
};

/**
 * シリーズIDでシリーズを取得し、存在する場合は閲覧数（view count）を1増やす
 * @param req リクエスト（params: id）
 * @param res レスポンス（success: true, series: シリーズデータ）
 * @returns 404: シリーズが存在しない場合、400: 取得失敗時
 */
export const getSeriesByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const series = await getSeriesById(id);
    if (!series) {
      res.status(404).json({ error: "Series not found" });
      return;
    }
    // シリーズが存在する場合、閲覧数を1増やす
    await incrementSeriesViewCount(id);
    const updatedSeries = await getSeriesById(id);
    res.status(200).json({ success: true, series: updatedSeries });
  } catch (error) {
    res.status(400).json({ error: "Failed to fetch series" });
  }
};

export const updateSeriesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updated = await updateSeries(id, req.body, req.file as Express.Multer.File);
 

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: "Failed to update series" });
  }
};

export const deleteSeriesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await deleteSeries(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Failed to delete series" });
  }
};

export const getMostReadSeriesHandler = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5
  try {
    
    const series = await getMostReadSeries(limit);
    res.json({ success: true, series });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch most read series" });
  }
};

export const searchSeriesByNameHandler = async (req: Request, res: Response): Promise<void> => {
  const name = req.query.name as string;
  if (!name) {
    res.status(400).json({ success: false, message: "Missing 'name' query parameter" });
    return;
  }
  try {
    const series = await searchSeriesByName(name);
    res.json({ success: true, series });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to search series" });
  }
};

export const updateSeriesEpisodesHandler = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    const updatedSeries = await updateSeriesEpisodes(id);
    res.status(200).json({ success: true, series: updatedSeries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update episodes" });
  }
};

export const getSeriesWithRecentChaptersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 2;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const result = await getSeriesWithRecentChapters(days, page, pageSize);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching series with recent chapters:', error);
    res.status(500).json({ error: "Failed to fetch series with recent chapters" });
  }
};