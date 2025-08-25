import { Router } from "express";
import {  auth_check, healthCheck, ping_pong } from "../../controllers/healthController";
import { check } from "../../middlewares/check";
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.get("/health-check", check, healthCheck);
router.get("/ping", check, ping_pong);
router.get("/auth-check", authenticate, auth_check);

export default router;