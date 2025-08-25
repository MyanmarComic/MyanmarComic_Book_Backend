import { Router } from "express";
import {
  getSeries,
  createSeriesHandler,
  getSeriesByIdHandler,
  updateSeriesHandler,
  deleteSeriesHandler,
  getMostReadSeriesHandler,
  searchSeriesByNameHandler,
  getSeriesForAdmin,
  getSeriesWithRecentChaptersHandler,
} from "../../controllers/seriesController";
import multer from "multer";
import { authenticate } from "../../middlewares/auth";

const router = Router();
const upload = multer(); 

router.get("/series", getSeries);
router.get("/series/recent-chapters", getSeriesWithRecentChaptersHandler);
router.post("/series", upload.single("coverImage"), createSeriesHandler);
router.get("/series/most-read", getMostReadSeriesHandler);
router.get("/series/search", searchSeriesByNameHandler);
router.get("/series/all-status", getSeriesForAdmin);
router.get("/series/:id", getSeriesByIdHandler);
router.patch("/series/:id", upload.single("coverImage") ,updateSeriesHandler);
router.delete("/series/:id" ,deleteSeriesHandler);

export default router;