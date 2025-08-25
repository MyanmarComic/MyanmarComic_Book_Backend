import { Router } from "express";
import multer from "multer";
import { uploadChapterHandler, getChapterNumbersBySeriesHandler,getChapterNumbersBySeriesHandlerForAdmin, getImageUrlsBySeriesAndChapterHandler, updateChapterPublishHandler, deleteChapterHandler, getAllChaptersHandler, getTopViewedChaptersHandler } from "../../controllers/chapterController";
import { authenticate } from "../../middlewares/auth";

const router = Router();
const upload = multer();

router.post("/chapter/upload", upload.array("images"), uploadChapterHandler);
router.get("/chapter/images", getImageUrlsBySeriesAndChapterHandler);
router.get("/chapter/series/:seriesId/numbers", getChapterNumbersBySeriesHandler);
router.get("/chapter/admin/series/:seriesId/numbers", getChapterNumbersBySeriesHandlerForAdmin);
router.get("/chapter", getAllChaptersHandler);
router.get("/chapter/top-views", getTopViewedChaptersHandler);
router.patch("/series/:seriesId/chapter/:chapterId/publish" ,updateChapterPublishHandler);
router.delete("/series/:seriesId/chapter/:chapterId", deleteChapterHandler);

export default router;
